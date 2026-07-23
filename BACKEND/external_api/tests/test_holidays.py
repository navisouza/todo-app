import pytest
import responses
from rest_framework import status

from external_api.services import (
    HolidaysAPIError,
    get_national_holidays,
    is_holiday,
    HOLIDAYS_API_BASE_URL,
)

MOCK_HOLIDAYS_2026 = [
    {"date": "2026-01-01", "name": "Confraternização mundial", "type": "national"},
    {"date": "2026-11-15", "name": "Proclamação da República", "type": "national"},
]


class TestHolidaysService:
    @responses.activate
    def test_get_national_holidays_parses_response(self):
        responses.add(
            responses.GET,
            f"{HOLIDAYS_API_BASE_URL}/2026",
            json=MOCK_HOLIDAYS_2026,
            status=200,
        )
        holidays = get_national_holidays(2026)
        assert len(holidays) == 2
        assert holidays[0].name == "Confraternização mundial"

    @responses.activate
    def test_get_national_holidays_raises_on_error(self):
        responses.add(
            responses.GET,
            f"{HOLIDAYS_API_BASE_URL}/2026",
            json={"detail": "erro"},
            status=500,
        )
        with pytest.raises(HolidaysAPIError):
            get_national_holidays(2026)

    @responses.activate
    def test_is_holiday_true(self):
        responses.add(
            responses.GET,
            f"{HOLIDAYS_API_BASE_URL}/2026",
            json=MOCK_HOLIDAYS_2026,
            status=200,
        )
        holiday = is_holiday("2026-11-15")
        assert holiday is not None
        assert holiday.name == "Proclamação da República"

    @responses.activate
    def test_is_holiday_false(self):
        responses.add(
            responses.GET,
            f"{HOLIDAYS_API_BASE_URL}/2026",
            json=MOCK_HOLIDAYS_2026,
            status=200,
        )
        assert is_holiday("2026-03-10") is None


@pytest.mark.django_db
class TestHolidaysViews:
    @responses.activate
    def test_list_holidays_endpoint(self, auth_client):
        responses.add(
            responses.GET,
            f"{HOLIDAYS_API_BASE_URL}/2026",
            json=MOCK_HOLIDAYS_2026,
            status=200,
        )
        response = auth_client.get("/api/external/holidays/", {"year": "2026"})
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 2

    def test_list_holidays_requires_year(self, auth_client):
        response = auth_client.get("/api/external/holidays/")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    @responses.activate
    def test_check_holiday_endpoint(self, auth_client):
        responses.add(
            responses.GET,
            f"{HOLIDAYS_API_BASE_URL}/2026",
            json=MOCK_HOLIDAYS_2026,
            status=200,
        )
        response = auth_client.get(
            "/api/external/holidays/check/", {"date": "2026-01-01"}
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.data["is_holiday"] is True

    def test_check_holiday_requires_auth(self, api_client):
        response = api_client.get(
            "/api/external/holidays/check/", {"date": "2026-01-01"}
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
