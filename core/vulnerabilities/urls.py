from django.urls import path
from .views import *

urlpatterns = [
   path("upload_csv/", upload_csv),
   path("get_filter_options/", get_filter_options),
   path("count_vulnerabilities_by_vendor/", count_vulnerabilities_by_vendor)
]