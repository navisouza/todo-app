from django.db import models
from django.conf import settings



class Task(models.Model):
    """
    Tarefa de um usuário. Pode pertencer a uma categoria e ser compartilhada
    com outros usuários (que podem visualizar e marcar como concluída).
    """

    class Priority(models.TextChoices):
        LOW = "low", "Baixa"
        MEDIUM = "medium", "Média"
        HIGH = "high", "Alta"

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default="")
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="tasks"
    )
    category = models.ForeignKey(
        "categories.Category",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="tasks",
    )
    shared_with = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name="shared_tasks",
        blank=True,
        help_text="Usuários com quem esta tarefa foi compartilhada.",
    )
    is_completed = models.BooleanField(default=False)
    priority = models.CharField(max_length=10, choices=Priority.choices, default=Priority.MEDIUM)
    due_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["owner", "is_completed"]),
        ]

    def __str__(self):
        return self.title