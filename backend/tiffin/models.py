
from django.db import models
from django.conf import settings


# Tiffin categories
CATEGORY_CHOICES = [
    ("Veg Thali", "Veg Thali"),
    ("Non-Veg Thali", "Non-Veg Thali"),
    ("Breakfast", "Breakfast"),
    ("Lunch", "Lunch"),
    ("Dinner", "Dinner"),
    ("Special", "Special"),
]


# Order status options
STATUS_CHOICES = [
    ("Pending", "Pending"),
    ("Confirmed", "Confirmed"),
    ("Preparing", "Preparing"),
    ("Out for Delivery", "Out for Delivery"),
    ("Delivered", "Delivered"),
    ("Cancelled", "Cancelled"),
]


# Tiffin Menu Model
class Tiffin(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    category = models.CharField(
        max_length=50,
        choices=CATEGORY_CHOICES,
        default="Veg Thali",
    )

    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # Tiffin image URL
    image = models.URLField(
        max_length=1000,
        blank=True,
        null=True,
    )

    # Alternative image URL
    image_url = models.URLField(
        max_length=1000,
        blank=True,
        null=True,
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name


# Customer Order Model
class Order(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="orders",
    )

    customer_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20)
    address = models.TextField()

    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )

    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default="Pending",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Order #{self.id} - {self.customer_name}"


# Individual Items inside an Order
class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items",
    )

    tiffin = models.ForeignKey(
        Tiffin,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    item_name = models.CharField(max_length=200)

    quantity = models.PositiveIntegerField(default=1)

    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    @property
    def subtotal(self):
        return self.quantity * self.unit_price

    def __str__(self):
        return f"{self.item_name} x {self.quantity}"


# Customer Profile Model
class UserProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )

    phone = models.CharField(
        max_length=20,
        blank=True,
    )

    def __str__(self):
        return self.user.username
