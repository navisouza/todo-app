from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .services import HolidaysAPIError, get_national_holidays, is_holiday


class NationalHolidaysView(APIView):
    """GET /api/external/holidays/?year=2026 -> lista feriados nacionais do ano."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        year = request.query_params.get("year")
        if not year or not year.isdigit():
            return Response(
                {"detail": "Informe um ano válido via ?year=YYYY."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            holidays = get_national_holidays(int(year))
        except HolidaysAPIError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)
        return Response([h.__dict__ for h in holidays])


class CheckHolidayView(APIView):
    """
    GET /api/external/holidays/check/?date=2026-11-15
    Usado pelo front pra avisar o usuário que a tarefa cai num feriado nacional.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        date_str = request.query_params.get("date")
        if not date_str:
            return Response(
                {"detail": "Informe uma data via ?date=YYYY-MM-DD."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            holiday = is_holiday(date_str)
        except HolidaysAPIError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)
        except (ValueError, IndexError):
            return Response(
                {"detail": "Data inválida, use o formato YYYY-MM-DD."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if holiday is None:
            return Response({"is_holiday": False})
        return Response({"is_holiday": True, "holiday": holiday.__dict__})