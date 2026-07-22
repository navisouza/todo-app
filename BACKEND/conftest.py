import pytest
from model_bakery import baker
from rest_framework.test import APIClient


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user(db):
    return baker.make("accounts.CustomUser", email="user@example.com", username="user1")


@pytest.fixture
def other_user(db):
    return baker.make(
        "accounts.CustomUser", email="other@example.com", username="user2"
    )


@pytest.fixture
def auth_client(api_client, user):
    api_client.force_authenticate(user=user)
    return api_client
