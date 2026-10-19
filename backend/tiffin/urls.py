
from django.urls import path

from . import auth_views
from .views import (
    TiffinListAPI,
    OrderCreateAPI,
    OrderListAPI,
    MyOrdersView,
    MyOrderCancelAPI,
    AdminDashboardAPI,
    AdminOrdersAPI,
    AdminOrderStatusAPI,
    AdminTiffinListCreateAPI,
    AdminTiffinDetailAPI,
    AdminCustomersAPI,
)

urlpatterns = [
 
    path(
        "menu/",
        TiffinListAPI.as_view(),
        name="menu-list",
    ),

    path(
        "orders/",
        OrderCreateAPI.as_view(),
        name="order-create",
    ),

    path(
        "orders/all/",
        OrderListAPI.as_view(),
        name="order-list",
    ),

    path(
        "orders/my/",
        MyOrdersView.as_view(),
        name="my-orders",
    ),

    path(
        "orders/<int:pk>/cancel/",
        MyOrderCancelAPI.as_view(),
        name="my-order-cancel",
    ),

    path(
        "auth/register/",
        auth_views.register_api,
        name="register",
    ),

    path(
        "auth/login/",
        auth_views.login_api,
        name="login",
    ),

    path(
        "auth/me/",
        auth_views.me_api,
        name="me",
    ),

    path(
        "auth/logout/",
        auth_views.logout_api,
        name="logout",
    ),


    path(
        "admin/dashboard/",
        AdminDashboardAPI.as_view(),
        name="admin-dashboard",
    ),

 
    path(
        "admin/orders/",
        AdminOrdersAPI.as_view(),
        name="admin-orders",
    ),

    path(
        "admin/orders/<int:pk>/",
        AdminOrderStatusAPI.as_view(),
        name="admin-order-status",
    ),

 
    path(
        "admin/tiffins/",
        AdminTiffinListCreateAPI.as_view(),
        name="admin-tiffin-list",
    ),

    path(
        "admin/tiffins/<int:pk>/",
        AdminTiffinDetailAPI.as_view(),
        name="admin-tiffin-detail",
    ),


    path(
        "admin/customers/",
        AdminCustomersAPI.as_view(),
        name="admin-customers",
    ),
]
