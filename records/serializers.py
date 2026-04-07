from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.db.models import Min, Max
from rest_framework import serializers

from .models import Record


# ---------------------------------------------------------------------------
# Auth serializers
# ---------------------------------------------------------------------------

class UserSerializer(serializers.ModelSerializer):
    """Read-only user profile."""

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "date_joined"]
        read_only_fields = fields


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Handles user sign-up with password validation."""

    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["username", "email", "password", "password_confirm", "first_name", "last_name"]

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


# ---------------------------------------------------------------------------
# Record serializers
# ---------------------------------------------------------------------------

class RecordSerializer(serializers.ModelSerializer):
    """Full CRUD serializer for records. The user is set automatically."""

    username = serializers.CharField(source="user.username", read_only=True)
    is_custom_event = serializers.BooleanField(read_only=True)

    class Meta:
        model = Record
        fields = [
            "id",
            "username",
            "venue",
            "event",
            "value",
            "unit",
            "iaaf_score",
            "date",
            "notes",
            "is_custom_event",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "username", "is_custom_event", "created_at", "updated_at"]

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)


class PersonalBestSerializer(serializers.Serializer):
    """Aggregated personal best per event."""

    event = serializers.CharField()
    venue = serializers.CharField()
    best_value = serializers.FloatField()
    unit = serializers.CharField()
    iaaf_score = serializers.IntegerField(allow_null=True)
    date = serializers.DateField()
    record_id = serializers.IntegerField()
    entry_count = serializers.IntegerField()


class LeaderboardEntrySerializer(serializers.Serializer):
    """One row in the leaderboard for a specific event."""

    username = serializers.CharField()
    venue = serializers.CharField()
    best_value = serializers.FloatField()
    unit = serializers.CharField()
    iaaf_score = serializers.IntegerField(allow_null=True)
    date = serializers.DateField()
    record_id = serializers.IntegerField()
