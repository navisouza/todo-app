from django.db.models import Q
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, status, viewsets

from .models import Task
from .serializers import ShareTaskSerializer, TaskSerializer


from .filters import TaskFilter


class IsOwnerOrSharedReadOnly(IsAuthenticated):
    """
    - Dono: acesso total (ver, editar, excluir, compartilhar).
    - Usuário com quem a tarefa foi compartilhada: pode visualizar e marcar
      como concluída/não concluída, mas não edita outros campos nem exclui.
    """

    def has_object_permission(self, request, view, obj):
        if obj.owner_id == request.user.id:
            return True
        is_shared = obj.shared_with.filter(id=request.user.id).exists()
        return is_shared and view.action in ("retrieve", "toggle_complete")


class TaskViewSet(viewsets.ModelViewSet):
    """
    CRUD de tarefas + ações extras:
      - POST /api/tasks/{id}/toggle-complete/  -> alterna concluída/não concluída
      - POST /api/tasks/{id}/share/            -> compartilha com outros usuários (por email)
      - POST /api/tasks/{id}/unshare/          -> remove compartilhamento
      - GET  /api/tasks/shared-with-me/        -> tarefas que outros compartilharam comigo
    """

    serializer_class = TaskSerializer
    permission_classes = [IsOwnerOrSharedReadOnly]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = TaskFilter
    ordering_fields = ["due_date", "priority", "created_at", "title"]

    def get_queryset(self):
        user = self.request.user
        return Task.objects.filter(Q(owner=user) | Q(shared_with=user)).distinct()

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=["get"], url_path="shared-with-me")
    def shared_with_me(self, request):
        tasks = Task.objects.filter(shared_with=request.user).distinct()
        page = self.paginate_queryset(tasks)
        serializer = self.get_serializer(page if page is not None else tasks, many=True)
        if page is not None:
            return self.get_paginated_response(serializer.data)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="toggle-complete")
    def toggle_complete(self, request, pk=None):
        task = self.get_object()
        task.is_completed = not task.is_completed
        task.save(update_fields=["is_completed", "updated_at"])
        return Response(TaskSerializer(task, context={"request": request}).data)

    @action(detail=True, methods=["post"])
    def share(self, request, pk=None):
        task = self.get_object()
        if task.owner_id != request.user.id:
            return Response(
                {"detail": "Apenas o dono da tarefa pode compartilhá-la."},
                status=status.HTTP_403_FORBIDDEN,
            )
        serializer = ShareTaskSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        task.shared_with.add(*serializer.validated_data["emails"])
        return Response(TaskSerializer(task, context={"request": request}).data)

    @action(detail=True, methods=["post"])
    def unshare(self, request, pk=None):
        task = self.get_object()
        if task.owner_id != request.user.id:
            return Response(
                {"detail": "Apenas o dono da tarefa pode remover compartilhamento."},
                status=status.HTTP_403_FORBIDDEN,
            )
        serializer = ShareTaskSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        task.shared_with.remove(*serializer.validated_data["emails"])
        return Response(TaskSerializer(task, context={"request": request}).data)
