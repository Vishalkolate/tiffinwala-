
from django.contrib import admin
from .models import Tiffin


@admin.register(Tiffin)
class TiffinAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "price", "is_available")
    list_filter = ("category", "is_available")
    search_fields = ("name",)
    list_editable = ("price", "is_available")



from .models import Tiffin, Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = (
        "tiffin",
        "item_name",
        "quantity",
        "unit_price",
    )


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "customer_name",
        "phone",
        "total_amount",
        "status",
        "created_at",
    )
    list_filter = ("status", "created_at")
    search_fields = ("customer_name", "phone")
    readonly_fields = ("total_amount", "created_at")
    inlines = [OrderItemInline]


# Register Tiffin only if it is not already registered.
if not admin.site.is_registered(Tiffin):
    admin.site.register(Tiffin)
