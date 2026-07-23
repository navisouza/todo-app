import pytest
from rest_framework import status

from tasks.models import Task


@pytest.mark.django_db
class TestTaskCRUD:
    list_url = "/api/tasks/"

    def test_create_task(self, auth_client, user, category):
        payload = {
            "title": "Estudar Django",
            "category_id": category.id,
            "priority": "high",
        }
        response = auth_client.post(self.list_url, payload, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        assert Task.objects.filter(owner=user, title="Estudar Django").exists()

    def test_list_returns_own_and_shared_tasks(self, auth_client, user, other_user):
        Task.objects.create(owner=user, title="Minha tarefa")
        shared_task = Task.objects.create(
            owner=other_user, title="Compartilhada comigo"
        )
        shared_task.shared_with.add(user)
        Task.objects.create(owner=other_user, title="Nao deveria aparecer")

        response = auth_client.get(self.list_url)

        titles = {t["title"] for t in response.data["results"]}
        assert titles == {"Minha tarefa", "Compartilhada comigo"}

    def test_toggle_complete(self, auth_client, user):
        task = Task.objects.create(owner=user, title="Tarefa", is_completed=False)
        url = f"{self.list_url}{task.id}/toggle-complete/"

        response = auth_client.post(url)
        task.refresh_from_db()
        assert response.status_code == status.HTTP_200_OK
        assert task.is_completed is True

    def test_filter_by_completed(self, auth_client, user):
        Task.objects.create(owner=user, title="Feita", is_completed=True)
        Task.objects.create(owner=user, title="Pendente", is_completed=False)

        response = auth_client.get(self.list_url, {"is_completed": "true"})

        titles = [t["title"] for t in response.data["results"]]
        assert titles == ["Feita"]

    def test_filter_by_category(self, auth_client, user, category):
        Task.objects.create(owner=user, title="Sem categoria")
        Task.objects.create(owner=user, title="Com categoria", category=category)

        response = auth_client.get(self.list_url, {"category_id": category.id})

        titles = [t["title"] for t in response.data["results"]]
        assert titles == ["Com categoria"]


@pytest.mark.django_db
class TestTaskSharing:
    def test_owner_can_share_task(self, auth_client, user, other_user):
        task = Task.objects.create(owner=user, title="Tarefa compartilhavel")
        url = f"/api/tasks/{task.id}/share/"

        response = auth_client.post(url, {"emails": [other_user.email]}, format="json")

        assert response.status_code == status.HTTP_200_OK
        assert other_user in task.shared_with.all()

    def test_share_fails_for_unknown_email(self, auth_client, user):
        task = Task.objects.create(owner=user, title="Tarefa")
        url = f"/api/tasks/{task.id}/share/"

        response = auth_client.post(
            url, {"emails": ["fantasma@example.com"]}, format="json"
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_non_owner_cannot_share_task(self, api_client, user, other_user):
        task = Task.objects.create(owner=other_user, title="Tarefa de outra pessoa")
        task.shared_with.add(user)
        api_client.force_authenticate(user=user)

        url = f"/api/tasks/{task.id}/share/"
        response = api_client.post(url, {"emails": [user.email]}, format="json")

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_shared_with_me_endpoint(self, api_client, user, other_user):
        task = Task.objects.create(owner=other_user, title="Compartilhada")
        task.shared_with.add(user)
        api_client.force_authenticate(user=user)

        response = api_client.get("/api/tasks/shared-with-me/")

        titles = [t["title"] for t in response.data["results"]]
        assert titles == ["Compartilhada"]

    def test_shared_user_can_toggle_complete_but_not_edit(
        self, api_client, user, other_user
    ):
        task = Task.objects.create(owner=other_user, title="Compartilhada")
        task.shared_with.add(user)
        api_client.force_authenticate(user=user)

        toggle_response = api_client.post(f"/api/tasks/{task.id}/toggle-complete/")
        assert toggle_response.status_code == status.HTTP_200_OK

        edit_response = api_client.patch(
            f"/api/tasks/{task.id}/", {"title": "Alterado"}
        )
        assert edit_response.status_code == status.HTTP_403_FORBIDDEN
