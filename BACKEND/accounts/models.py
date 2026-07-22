from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    """
    Usuário customizado. Herda de AbstractUser mantendo tudo que a classe
    já resolve (hash de senha, permissões, admin) e só torna o email
    obrigatório e único, pois será usado para compartilhamento de tarefas.
    """

    email = models.EmailField(unique=True)

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["email"]

    def __str__(self):
        return self.username
