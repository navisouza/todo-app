import pytest
from rest_framework import status

from categories.models import Category


@pytest.mark.django_db
class TestCategoryCRUD:
    list_url = "/api/categories/"

    def test_requires_authentication(self, api_client):
        response = api_client.get(self.list_url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_create_category(self, auth_client, user):
        response = auth_client.post(self.list_url, {"name": "Pessoal"})
        assert response.status_code == status.HTTP_201_CREATED
        assert Category.objects.filter(owner=user, name="Pessoal").exists()

    def test_list_only_returns_own_categories(self, auth_client, user, other_user):
        Category.objects.create(owner=user, name="Minha")
        Category.objects.create(owner=other_user, name="Da outra pessoa")

        response = auth_client.get(self.list_url)

        names = [c["name"] for c in response.data["results"]]
        assert names == ["Minha"]

    def test_update_category(self, auth_client, user):
        category = Category.objects.create(owner=user, name="Antiga")
        url = f"{self.list_url}{category.id}/"
        response = auth_client.patch(url, {"name": "Renomeada"})
        assert response.status_code == status.HTTP_200_OK
        category.refresh_from_db()
        assert category.name == "Renomeada"

    def test_delete_category(self, auth_client, user):
        category = Category.objects.create(owner=user, name="Descartavel")
        url = f"{self.list_url}{category.id}/"
        response = auth_client.delete(url)
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Category.objects.filter(id=category.id).exists()

    def test_cannot_access_other_users_category(self, auth_client, other_user):
        other_category = Category.objects.create(owner=other_user, name="Privada")
        url = f"{self.list_url}{other_category.id}/"
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_404_NOT_FOUND
