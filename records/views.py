from django.contrib.auth.models import User
from django.db.models import Min, Max, F, Window
from django.db.models.functions import Rank
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response

from .models import Record
from .serializers import (
    LeaderboardEntrySerializer,
    PersonalBestSerializer,
    RecordSerializer,
    UserRegistrationSerializer,
    UserSerializer,
)


# ---------------------------------------------------------------------------
# Auth views
# ---------------------------------------------------------------------------

class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register/ — create a new user account."""

    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]


class MeView(generics.RetrieveAPIView):
    """GET /api/auth/me/ — return the current user's profile."""

    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


# ---------------------------------------------------------------------------
# Record views
# ---------------------------------------------------------------------------

class RecordViewSet(viewsets.ModelViewSet):
    """
    CRUD endpoints for the authenticated user's records.

    GET    /api/records/              — list all my records
    POST   /api/records/              — create a new record
    GET    /api/records/<pk>/         — retrieve one record
    PUT    /api/records/<pk>/         — update a record
    DELETE /api/records/<pk>/         — delete a record
    GET    /api/records/personal-bests/ — best per event
    GET    /api/records/history/?event=100m — history for one event
    """

    serializer_class = RecordSerializer

    def get_queryset(self):
        return Record.objects.filter(user=self.request.user)

    # ---- custom actions ----

    @action(detail=False, methods=["get"], url_path="personal-bests")
    def personal_bests(self, request):
        """Return the user's best record for each event."""
        qs = Record.objects.filter(user=request.user)

        # Group by event AND venue: for time events (seconds) we want MIN, for distance (meters) we want MAX
        events_data = []

        events_venues = qs.order_by().values("event", "venue").distinct()
        for ev in events_venues:
            event_name = ev["event"]
            venue = ev["venue"]
            
            event_records = qs.filter(event=event_name, venue=venue)
            first = event_records.first()
            if not first:
                continue

            if first.unit == Record.UNIT_SECONDS:
                best = event_records.order_by("value").first()
            else:
                best = event_records.order_by("-value").first()

            events_data.append({
                "event": event_name,
                "venue": best.venue,
                "best_value": best.value,
                "unit": best.unit,
                "iaaf_score": best.iaaf_score,
                "date": best.date,
                "record_id": best.id,
                "entry_count": event_records.count(),
            })

        serializer = PersonalBestSerializer(events_data, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="history")
    def history(self, request):
        """Return all records for a specific event and venue, newest first."""
        event = request.query_params.get("event")
        venue = request.query_params.get("venue")
        if not event or not venue:
            return Response(
                {"detail": "The 'event' and 'venue' query parameters are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        qs = Record.objects.filter(user=request.user, event=event, venue=venue).order_by("-date", "-created_at")
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)


# ---------------------------------------------------------------------------
# Public views
# ---------------------------------------------------------------------------

from .models import Record, OUTDOOR_EVENTS, INDOOR_EVENTS

@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def event_list(request):
    """GET /api/events/ — return the list of standard events (public)."""
    return Response({
        "Outdoors": OUTDOOR_EVENTS,
        "Indoors": INDOOR_EVENTS
    })


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def leaderboard(request):
    """
    GET /api/leaderboard/?event=100m&venue=Outdoors — top records across all users for an event.
    """
    event = request.query_params.get("event")
    venue = request.query_params.get("venue")
    if not event or not venue:
        return Response(
            {"detail": "The 'event' and 'venue' query parameters are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    qs = Record.objects.filter(event=event, venue=venue)
    if not qs.exists():
        return Response([])

    # Determine direction: seconds=ascending (lower is better), meters=descending
    first = qs.first()
    if first.unit == Record.UNIT_SECONDS:
        order = "value"
    else:
        order = "-value"

    # Get each user's best, then rank
    best_per_user = {}
    for record in qs.order_by(order):
        if record.user.username not in best_per_user:
            best_per_user[record.user.username] = {
                "username": record.user.username,
                "venue": record.venue,
                "best_value": record.value,
                "unit": record.unit,
                "iaaf_score": record.iaaf_score,
                "date": record.date,
                "record_id": record.id,
            }

    entries = list(best_per_user.values())
    serializer = LeaderboardEntrySerializer(entries, many=True)
    return Response(serializer.data)
