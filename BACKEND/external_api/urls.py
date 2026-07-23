from django.urls import path

from .views import CheckHolidayView, NationalHolidaysView

urlpatterns = [
    path("holidays/", NationalHolidaysView.as_view(), name="holidays-list"),
    path("holidays/check/", CheckHolidayView.as_view(), name="holidays-check"),
]
