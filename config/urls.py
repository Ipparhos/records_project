from django.contrib import admin
from django.urls import include, path, re_path
from django.views.generic import TemplateView
from django.views.generic.base import RedirectView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("records.urls")),
    path("favicon.ico", RedirectView.as_view(url="/static/favicon.svg")),
    re_path(r"^.*$", TemplateView.as_view(template_name="index.html")),
]

