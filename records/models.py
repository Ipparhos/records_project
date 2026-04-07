from django.db import models
from django.contrib.auth.models import User

# Standard tracking events separated by venue for the API
OUTDOOR_EVENTS = [
    ("Sprints", [("100m", "100m"), ("200m", "200m"), ("400m", "400m")]),
    ("Middle Distance", [("800m", "800m"), ("1500m", "1500m")]),
    ("Long Distance", [("3000m", "3000m"), ("5000m", "5000m"), ("10000m", "10000m")]),
    ("Hurdles", [("100mH", "100m Hurdles"), ("110mH", "110m Hurdles"), ("400mH", "400m Hurdles")]),
    ("Relays", [("4x100m", "4×100m Relay"), ("4x400m", "4×400m Relay")]),
    ("Field Events", [("High Jump", "High Jump"), ("Long Jump", "Long Jump"), ("Triple Jump", "Triple Jump"),
                      ("Pole Vault", "Pole Vault"), ("Shot Put", "Shot Put"), ("Discus", "Discus"),
                      ("Javelin", "Javelin"), ("Hammer Throw", "Hammer Throw")]),
]

INDOOR_EVENTS = [
    ("Sprints", [("60m", "60m"), ("200m", "200m"), ("400m", "400m")]),
    ("Middle Distance", [("800m", "800m"), ("1500m", "1500m")]),
    ("Long Distance", [("3000m", "3000m")]),
    ("Hurdles", [("60mH", "60m Hurdles")]),
    ("Relays", [("4x400m", "4×400m Relay")]),
    ("Field Events", [("High Jump", "High Jump"), ("Long Jump", "Long Jump"), ("Triple Jump", "Triple Jump"),
                      ("Pole Vault", "Pole Vault"), ("Shot Put", "Shot Put")]),
]

class Record(models.Model):
    VENUE_OUTDOORS = "Outdoors"
    VENUE_INDOORS = "Indoors"
    VENUE_CHOICES = [
        (VENUE_OUTDOORS, "Outdoors"),
        (VENUE_INDOORS, "Indoors"),
    ]

    UNIT_SECONDS = "seconds"
    UNIT_METERS = "meters"
    UNIT_CHOICES = [
        (UNIT_SECONDS, "Seconds"),
        (UNIT_METERS, "Meters"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="records")
    venue = models.CharField(max_length=10, choices=VENUE_CHOICES, default=VENUE_OUTDOORS)
    event = models.CharField(max_length=100)
    value = models.FloatField()
    unit = models.CharField(max_length=10, choices=UNIT_CHOICES, default=UNIT_SECONDS)
    iaaf_score = models.IntegerField(null=True, blank=True)
    date = models.DateField()
    notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "records"
        ordering = ["-date", "-created_at"]

    def __str__(self):
        return f"{self.user.username} — {self.event} ({self.venue}): {self.value} {self.unit}"

    @property
    def is_custom_event(self):
        standard_values = set()
        for _, opts in OUTDOOR_EVENTS + INDOOR_EVENTS:
            for v, _ in opts:
                standard_values.add(v)
        return self.event not in standard_values
