
from rest_framework import serializers
from .models import Tiffin, Order, OrderItem


# Tiffin Menu Serializer
class TiffinSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tiffin
        fields = "__all__"


# Order Item Serializer
class OrderItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "item_name",
            "quantity",
            "unit_price",
            "subtotal",
        ]

class OrderItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.ReadOnlyField()
    image = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "item_name",
            "quantity",
            "unit_price",
            "subtotal",
            "image",
        ]

    def get_image(self, obj):
        if obj.tiffin and obj.tiffin.image:
            return obj.tiffin.image
        return None


# My Orders Serializer
class MyOrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    delivery_address = serializers.CharField(
        source="address",
        read_only=True,
    )

    class Meta:
        model = Order
        fields = [
            "id",
            "customer_name",
            "phone",
            "delivery_address",
            "total_amount",
            "status",
            "created_at",
            "items",
        ]


# Create Order Serializer
class OrderCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = [
            "id",
            "customer_name",
            "phone",
            "address",
            "total_amount",
        ]
        read_only_fields = ["id"]


# All Orders Serializer
class OrderDetailSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "customer_name",
            "phone",
            "address",
            "total_amount",
            "status",
            "created_at",
            "items",
        ]

class OrderCreateSerializer(serializers.ModelSerializer):
    items = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=True,
    )

    class Meta:
        model = Order
        fields = [
            "id",
            "customer_name",
            "phone",
            "address",
            "items",
        ]
        read_only_fields = ["id"]

    def create(self, validated_data):





        
        from decimal import Decimal
        from django.db import transaction
        from rest_framework.exceptions import ValidationError

        items_data = validated_data.pop("items")
        total_amount = Decimal("0.00")
        validated_items = []

        for item in items_data:
            tiffin_id = item.get("tiffin_id", item.get("id"))
            quantity = item.get("quantity", 1)

            try:
                quantity = int(quantity)
                if quantity < 1:
                    raise ValueError

                tiffin = Tiffin.objects.get(
                    id=tiffin_id,
                    is_available=True,
                )
            except (Tiffin.DoesNotExist, TypeError, ValueError):
                raise ValidationError({
                    "items": "Invalid tiffin ID or quantity."
                })

            total_amount += tiffin.price * quantity
            validated_items.append((tiffin, quantity))

        if not validated_items:
            raise ValidationError({"items": "Cart is empty."})

        with transaction.atomic():
            order = Order.objects.create(
                **validated_data,
                total_amount=total_amount,
            )

            for tiffin, quantity in validated_items:
                OrderItem.objects.create(
                    order=order,
                    tiffin=tiffin,
                    item_name=tiffin.name,
                    quantity=quantity,
                    unit_price=tiffin.price,
                )

        return order        




class OrderCreateSerializer(serializers.ModelSerializer):
    items = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=True,
    )

    class Meta:
        model = Order
        fields = [
            "id",
            "customer_name",
            "phone",
            "address",
            "total_amount",
            "status",
            "items",
        ]
        read_only_fields = ["id", "total_amount", "status"]

    def create(self, validated_data):
        from decimal import Decimal
        from django.db import transaction
        from rest_framework.exceptions import ValidationError

        items_data = validated_data.pop("items")
        total = Decimal("0.00")
        order_items = []

        for item in items_data:
            tiffin_id = item.get("tiffin_id")
            quantity = item.get("quantity", 1)

            try:
                quantity = int(quantity)
                if quantity < 1:
                    raise ValueError

                tiffin = Tiffin.objects.get(
                    id=tiffin_id,
                    is_available=True,
                )
            except (Tiffin.DoesNotExist, TypeError, ValueError):
                raise ValidationError({
                    "items": "Invalid tiffin ID or quantity."
                })

            total += tiffin.price * quantity
            order_items.append((tiffin, quantity))

        if not order_items:
            raise ValidationError({"items": "Cart is empty."})

        with transaction.atomic():
            order = Order.objects.create(
                **validated_data,
                total_amount=total,
            )

            for tiffin, quantity in order_items:
                OrderItem.objects.create(
                    order=order,
                    tiffin=tiffin,
                    item_name=tiffin.name,
                    quantity=quantity,
                    unit_price=tiffin.price,
                )

        return order   


image = serializers.ImageField(
    required=False,
    allow_null=True,
)

image_url = serializers.URLField(
    required=False,
    allow_blank=True,
    allow_null=True,
)

class TiffinSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tiffin
        fields = "__all__"