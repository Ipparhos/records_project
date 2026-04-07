from django.contrib import admin
from .models import Record

@admin.register(Record)
class RecordAdmin(admin.ModelAdmin):
    list_display = ["user", "venue", "event", "value", "unit", "iaaf_score", "date", "created_at"]
    list_filter = ["venue", "event", "unit", "date"]
    search_fields = ["user__username", "event", "notes"]
    ordering = ["-date", "-created_at"]
    readonly_fields = ["created_at", "updated_at"]
