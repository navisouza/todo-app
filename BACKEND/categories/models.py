from django.conf import settings
from django.db import models


class Category(models.Model):
    """Categoria usada para organizar tarefas. Pertence a um usuário (dono)."""

    name = models.CharField(max_length=100)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="categories"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(fields=["owner", "name"], name="unique_category_per_owner")
        ]

    def __str__(self):
        return f"{self.name} ({self.owner})"