
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.db.models import Sum
from django.utils import timezone

from rest_framework import generics, status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView


from datetime import timedelta
from django.db.models.functions import TruncDate


from .models import Tiffin, Order
from .serializers import (
    TiffinSerializer,
    OrderCreateSerializer,
    OrderDetailSerializer,
    MyOrderSerializer,
)

User = get_user_model()


# MENU API
# GET /api/menu/

class TiffinListAPI(generics.ListAPIView):
    serializer_class = TiffinSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Tiffin.objects.filter(is_available=True)

        category = self.request.query_params.get("category")

        if category:
            queryset = queryset.filter(category=category)

        return queryset


# CREATE ORDER API
# POST /api/orders/

class OrderCreateAPI(generics.CreateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderCreateSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            serializer.save()


# ALL ORDERS API
# GET /api/orders/

class OrderListAPI(generics.ListAPIView):
    queryset = (
        Order.objects
        .prefetch_related("items")
        .order_by("-created_at")
    )

    serializer_class = OrderDetailSerializer
    permission_classes = [AllowAny]


# MY ORDERS API
# GET /api/orders/my/

class MyOrdersView(generics.ListAPIView):
    serializer_class = MyOrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Order.objects
            .filter(user=self.request.user)
            .exclude(status__iexact="cancelled")
            .prefetch_related("items")
            .order_by("-created_at")
        )


# CANCEL CUSTOMER ORDER API
# DELETE /api/orders/<id>/cancel/

class MyOrderCancelAPI(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            order = Order.objects.get(
                pk=pk,
                user=request.user
            )
        except Order.DoesNotExist:
            return Response(
                {"detail": "Order not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        current_status = str(order.status).strip().lower()

        if current_status not in ["pending", "confirmed"]:
            return Response(
                {
                    "detail": (
                        "Only pending or confirmed orders "
                        "can be cancelled."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        order.status = "cancelled"
        order.save(update_fields=["status"])

        return Response(
            {"detail": "Order cancelled successfully."},
            status=status.HTTP_200_OK
        )



# ADMIN DASHBOARD API
# GET /api/admin/dashboard/

class AdminDashboardAPI(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAdminUser]

    def get(self, request):
        today = timezone.localdate()

        # Last 7 days, including today
        start_date = today - timedelta(days=6)

        # Existing dashboard statistics
        total_orders = Order.objects.count()

        today_orders = Order.objects.filter(
            created_at__date=today
        ).count()

        pending_orders = Order.objects.filter(
            status__iexact="pending"
        ).count()

        total_tiffins = Tiffin.objects.count()

        # Existing total revenue logic preserved
        total_revenue = (
            Order.objects
            .exclude(status__iexact="cancelled")
            .aggregate(total=Sum("total_amount"))
            .get("total")
            or Decimal("0.00")
        )

        # Sales Analytics:
        # Daily revenue from delivered orders only
        daily_revenue = (
            Order.objects
            .filter(
                status__iexact="delivered",
                created_at__date__gte=start_date,
                created_at__date__lte=today,
            )
            .annotate(
                date=TruncDate("created_at")
            )
            .values("date")
            .annotate(
                revenue=Sum("total_amount")
            )
            .order_by("date")
        )

        # Convert daily revenue to a dictionary
        revenue_map = {
            item["date"]: item["revenue"] or Decimal("0.00")
            for item in daily_revenue
        }

        # Always return all 7 dates
        revenue_by_day = []

        for day_number in range(7):
            current_date = start_date + timedelta(
                days=day_number
            )

            revenue_by_day.append({
                "date": current_date.isoformat(),
                "revenue": str(
                    revenue_map.get(
                        current_date,
                        Decimal("0.00")
                    )
                ),
            })

        # Dashboard API response
        return Response({
            "total_orders": total_orders,
            "today_orders": today_orders,
            "pending_orders": pending_orders,
            "total_tiffins": total_tiffins,
            "total_revenue": str(total_revenue),
            "revenue_by_day": revenue_by_day,
        })



# ADMIN ORDERS API
# GET /api/admin/orders/

class AdminOrdersAPI(generics.ListAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAdminUser]

    serializer_class = OrderDetailSerializer

    def get_queryset(self):
        queryset = (
            Order.objects
            .prefetch_related("items")
            .order_by("-created_at")
        )

        order_status = self.request.query_params.get("status")

        if order_status and order_status != "All":
            queryset = queryset.filter(
                status__iexact=order_status
            )

        return queryset



# ADMIN ORDER STATUS UPDATE API
# PATCH /api/admin/orders/<id>/

class AdminOrderStatusAPI(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAdminUser]

    allowed_statuses = [
        "pending",
        "confirmed",
        "preparing",
        "out for delivery",
        "delivered",
        "cancelled",
    ]

    def patch(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response(
                {"detail": "Order not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        new_status = request.data.get("status")

        if not new_status:
            return Response(
                {"status": "This field is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        new_status = str(new_status).strip().lower()

        if new_status not in self.allowed_statuses:
            return Response(
                {
                    "status": (
                        "Invalid status. Allowed statuses: "
                        + ", ".join(self.allowed_statuses)
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        order.status = new_status
        order.save(update_fields=["status"])

        return Response({
            "id": order.id,
            "status": order.status,
        })


# ADMIN TIFFINS API
# GET /api/admin/tiffins/
# POST /api/admin/tiffins/

class AdminTiffinListCreateAPI(generics.ListCreateAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAdminUser]

    serializer_class = TiffinSerializer

    def get_queryset(self):
        return Tiffin.objects.all().order_by("-id")


# ADMIN TIFFIN UPDATE / DELETE API
# PUT /api/admin/tiffins/<id>/
# PATCH /api/admin/tiffins/<id>/
# DELETE /api/admin/tiffins/<id>/

class AdminTiffinDetailAPI(generics.RetrieveUpdateDestroyAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAdminUser]

    queryset = Tiffin.objects.all()
    serializer_class = TiffinSerializer


# ADMIN CUSTOMERS API
# GET /api/admin/customers/

class AdminCustomersAPI(generics.ListAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        return (
            User.objects
            .all()
            .order_by("-date_joined")
        )

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        page = self.paginate_queryset(queryset)

        if page is not None:
            data = [
                self.serialize_customer(user)
                for user in page
            ]
            return self.get_paginated_response(data)

        data = [
            self.serialize_customer(user)
            for user in queryset
        ]

        return Response(data)

    def serialize_customer(self, user):
        try:
            phone = user.profile.phone
        except Exception:
            phone = ""

        return {
            "id": user.id,
            "username": user.get_username(),
            "full_name": (
                user.get_full_name()
                or user.get_username()
            ),
            "email": user.email,
            "phone": phone,
            "date_joined": user.date_joined,
        }
