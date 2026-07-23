"""
Cliente para a API externa de feriados nacionais (BrasilAPI): https://brasilapi.com.br/docs#tag/Feriados-Nacionais
"""

from dataclasses import dataclass

import requests

HOLIDAYS_API_BASE_URL = "https://brasilapi.com.br/api/feriados/v1"
API_TIMEOUT_SECONDS = 5


class HolidaysAPIError(Exception):
    """Erro ao consultar a API externa de feriados."""


@dataclass(frozen=True)
class Holiday:
    date: str
    name: str
    type: str


def get_national_holidays(year: int) -> list[Holiday]:
    """Busca a lista de feriados nacionais de um ano na BrasilAPI."""
    url = f"{HOLIDAYS_API_BASE_URL}/{year}"
    try:
        response = requests.get(url, timeout=API_TIMEOUT_SECONDS)
        response.raise_for_status()
    except requests.RequestException as exc:
        raise HolidaysAPIError(f"Falha ao consultar feriados de {year}: {exc}") from exc

    return [
        Holiday(date=item["date"], name=item["name"], type=item["type"])
        for item in response.json()
    ]


def is_holiday(date_str: str) -> Holiday | None:
    """Verifica se uma data (YYYY-MM-DD) é feriado nacional."""
    year = int(date_str.split("-")[0])
    holidays = get_national_holidays(year)
    return next((h for h in holidays if h.date == date_str), None)
