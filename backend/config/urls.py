
from django.conf import settings
from django.conf.urls.static import static
from pathlib import Path

from django.contrib import admin
from django.urls import include, path, re_path
from django.views.generic import TemplateView
from django.views.static import serve



# Project root: tiffin-service/
BASE_DIR = Path(__file__).resolve().parent.parent.parent
DIST_DIR = BASE_DIR / "dist"

urlpatterns = [
    # Django admin
    path("admin/", admin.site.urls),

    # Main application APIs
    path("api/", include("tiffin.urls")),

    # Admin and customer login API

    # React build assets
    re_path(
        r"^assets/(?P<path>.*)$",
        serve,
        {"document_root": DIST_DIR / "assets"},
    ),

    # React frontend routes
    re_path(
        r"^(?!api/|admin/|assets/|static/|media/).*",
        TemplateView.as_view(template_name="index.html"),
        name="react-frontend",
    ),
]

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT,
    )
