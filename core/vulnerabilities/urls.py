from django.urls import path
from .views import *

urlpatterns = [
   path("upload_csv/", upload_csv),
   path("count_vulnerabilities_by_vendor/", count_vulnerabilities_by_vendor),
   path("count_vulnerabilities_by_type/", count_vulnerabilities_by_type),
   path("top_10_devices_by_base_score/", top_10_devices_by_base_score)
]