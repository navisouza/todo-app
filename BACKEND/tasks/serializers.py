from accounts.serializers import UserSerializer
from categories.models import Category
from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import Task

User = get_user_model()


class TaskSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    shared_with = UserSerializer(many=True, read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        source="category",
        queryset=Category.objects.none(),
        allow_null=True,
        required=False,
    )

    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "description",
            "owner",
            "category_id",
            "shared_with",
            "is_completed",
            "priority",
            "due_date",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "owner", "shared_with", "created_at", "updated_at"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        if request is not None:
            # Um usuário só pode associar a tarefa às SUAS próprias categorias.
            self.fields["category_id"].queryset = Category.objects.filter(
                owner=request.user
            )


class ShareTaskSerializer(serializers.Serializer):
    """Payload para compartilhar uma tarefa: lista de emails de usuários existentes."""

    emails = serializers.ListField(child=serializers.EmailField(), allow_empty=False)

    def validate_emails(self, emails):
        users = list(User.objects.filter(email__in=emails))
        found_emails = {u.email for u in users}
        missing = set(emails) - found_emails
        if missing:
            raise serializers.ValidationError(
                f"Usuários não encontrados para os emails: {', '.join(sorted(missing))}"
            )
        return users
