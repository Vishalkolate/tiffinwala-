
import logging

from django.contrib.auth import authenticate, get_user_model
from django.db import transaction

from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .auth_serializers import RegisterSerializer

logger = logging.getLogger(__name__)

User = get_user_model()


def user_data(user):
    """Return user information for the frontend."""
    try:
        phone = user.profile.phone
    except Exception:
        phone = ""

    return {
        "id": user.id,
        "full_name": user.first_name,
        "email": user.email,
        "phone": phone,
        "is_staff": user.is_staff,
        "is_superuser": user.is_superuser,
    }


# ==========================================
# CUSTOMER REGISTER API
# ==========================================

@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])
def register_api(request):
    """Register a new customer account."""
    serializer = RegisterSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        with transaction.atomic():
            user = serializer.save()

            # Newly registered customers must not be admins.
            user.is_staff = False
            user.is_superuser = False
            user.save(update_fields=["is_staff", "is_superuser"])

            token, _ = Token.objects.get_or_create(user=user)

        return Response(
            {
                "message": "Account created successfully.",
                "token": token.key,
                "user": user_data(user),
            },
            status=status.HTTP_201_CREATED,
        )

    except Exception:
        logger.exception("Signup API failed")
        return Response(
            {
                "detail": (
                    "Unable to create the account. "
                    "Check the Django backend terminal."
                )
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


# ==========================================
# LOGIN API
# ==========================================

@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])
def login_api(request):
    """Authenticate a customer or administrator."""

    email = request.data.get("email", "")
    password = request.data.get("password", "")

    if not isinstance(email, str) or not isinstance(password, str):
        return Response(
            {"detail": "Email and password must be text values."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    email = email.strip().lower()

    if not email or not password:
        return Response(
            {"detail": "Email and password are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Find the account using its email address.
    user_obj = User.objects.filter(email__iexact=email).first()

    if user_obj is None:
        return Response(
            {"detail": "Incorrect email or password."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Authenticate using the actual Django username.
    user = authenticate(
        request,
        username=user_obj.get_username(),
        password=password,
    )

    if user is None:
        return Response(
            {"detail": "Incorrect email or password."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not user.is_active:
        return Response(
            {"detail": "Your account is inactive."},
            status=status.HTTP_403_FORBIDDEN,
        )


    login_type = request.data.get("login_type", "customer")

    if login_type not in ["customer", "admin"]:
        return Response(
            {"detail": "Invalid login type."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Admin login must only allow staff users.
    if login_type == "admin" and not (
    user.is_staff or user.is_superuser
):
        return Response(
        {"detail": "Admin access denied. Please login again."},
        status=status.HTTP_403_FORBIDDEN,
    )

    # Customer login must not provide Admin access.
    if login_type == "customer" and user.is_staff:
        return Response(
        {
            "detail": (
                "This is an administrator account. "
                "Please use the Admin Login page."
            )
        },
        status=status.HTTP_403_FORBIDDEN,
    )

    token, _ = Token.objects.get_or_create(user=user)

    return Response(
        {
            "message": "Login successful.",
            "token": token.key,
            "user": user_data(user),
        },
        status=status.HTTP_200_OK,
    )


# ==========================================
# CURRENT USER API
# ==========================================

@api_view(["GET"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def me_api(request):
    """Return authenticated user's details."""
    return Response(
        {"user": user_data(request.user)},
        status=status.HTTP_200_OK,
    )


# ==========================================
# LOGOUT API
# ==========================================

@api_view(["POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def logout_api(request):
    """Delete the current authentication token."""
    try:
        request.user.auth_token.delete()
    except Token.DoesNotExist:
        pass

    return Response(
        {"message": "Logout successful."},
        status=status.HTTP_200_OK,
    )