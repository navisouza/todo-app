import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status

User = get_user_model()


@pytest.mark.django_db
class TestRegister:
    def test_register_creates_user_and_returns_tokens(self, api_client):
        url = reverse("register")
        payload = {
            "username": "novo_usuario",
            "email": "novo@example.com",
            "password": "SenhaForte123!",
            "password_confirm": "SenhaForte123!",
        }
        response = api_client.post(url, payload, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        assert User.objects.filter(email="novo@example.com").exists()
        assert "access" in response.data
        assert "refresh" in response.data

    def test_register_fails_when_passwords_dont_match(self, api_client):
        url = reverse("register")
        payload = {
            "username": "novo_usuario",
            "email": "novo@example.com",
            "password": "SenhaForte123!",
            "password_confirm": "outrasenha",
        }
        response = api_client.post(url, payload, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert not User.objects.filter(email="novo@example.com").exists()


@pytest.mark.django_db
class TestLogin:
    def test_login_with_valid_credentials(self, api_client, user):
        user.set_password("SenhaForte123!")
        user.save()
        url = reverse("login")
        response = api_client.post(
            url,
            {"username": user.username, "password": "SenhaForte123!"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        assert "access" in response.data

    def test_login_with_invalid_credentials(self, api_client, user):
        url = reverse("login")
        response = api_client.post(
            url, {"username": user.username, "password": "errada"}, format="json"
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestMe:
    def test_me_requires_authentication(self, api_client):
        response = api_client.get(reverse("me"))
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_me_returns_current_user(self, auth_client, user):
        response = auth_client.get(reverse("me"))
        assert response.status_code == status.HTTP_200_OK
        assert response.data["email"] == user.email
