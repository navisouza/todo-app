import django_filters

from .models import Task


class TaskFilter(django_filters.FilterSet):
    """
    Filtros disponíveis via query string, ex:
    /api/tasks/?is_completed=true&category_id=2&priority=high&due_before=2026-08-01
    """

    category_id = django_filters.NumberFilter(field_name="category_id")
    priority = django_filters.ChoiceFilter(choices=Task.Priority.choices)
    due_before = django_filters.DateFilter(field_name="due_date", lookup_expr="lte")
    due_after = django_filters.DateFilter(field_name="due_date", lookup_expr="gte")
    search = django_filters.CharFilter(method="filter_search")

    class Meta:
        model = Task
        fields = ["is_completed", "category_id", "priority", "due_before", "due_after"]

    def filter_search(self, queryset, name, value):
        from django.db.models import Q

        return queryset.filter(
            Q(title__icontains=value) | Q(description__icontains=value)
        )
