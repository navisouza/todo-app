from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Category
from .serializers import CategorySerializer


class CategoryViewSet(viewsets.ModelViewSet):
    """CRUD de categorias. Cada usuário só vê/edita as suas próprias."""

    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return Category.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
