
from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import serializers

from .models import UserProfile

User = get_user_model()


class RegisterSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=15)
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        trim_whitespace=False,
    )

    def validate_full_name(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Full name is required."
            )

        return value

    def validate_email(self, value):
        value = value.strip().lower()

        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "या email वर account आधीपासून आहे."
            )

        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError(
                "या email वर account आधीपासून आहे."
            )

        return value

    def validate_phone(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Phone number is required."
            )

        return value

    @transaction.atomic
    def create(self, validated_data):
        full_name = validated_data["full_name"]
        email = validated_data["email"]
        phone = validated_data["phone"]
        password = validated_data["password"]

        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=full_name,
        )

        UserProfile.objects.create(
            user=user,
            phone=phone,
        )

        return user
