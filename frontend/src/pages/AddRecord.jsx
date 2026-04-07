import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { parsePerformance } from "../utils";

export default function AddRecord() {
  const navigate = useNavigate();
  // We'll store both venues' event structures: { Outdoors: [...], Indoors: [...] }
  const [eventsData, setEventsData] = useState({ Outdoors: [], Indoors: [] });
  
  const [form, setForm] = useState({
    venue: "Outdoors",
    eventSelection: "",
    customEvent: "",
    value: "",
    unit: "seconds",
    iaaf_score: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const { data } = await api.get("/events/");
        setEventsData(data);
        // Set a default event based on the initial venue
        if (data.Outdoors && data.Outdoors.length > 0 && data.Outdoors[0][1].length > 0) {
          setForm((f) => ({ ...f, eventSelection: data.Outdoors[0][1][0][0] }));
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchEvents();
  }, []);

  // When venue changes, update the event selection to the first valid standard event for that venue
  const handleVenueChange = (e) => {
    const newVenue = e.target.value;
    let newDefaultEvent = "custom";
    const venueEvents = eventsData[newVenue];
    if (venueEvents && venueEvents.length > 0 && venueEvents[0][1].length > 0) {
      newDefaultEvent = venueEvents[0][1][0][0];
    }
    setForm({ ...form, venue: newVenue, eventSelection: newDefaultEvent });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const eventName =
      form.eventSelection === "custom" ? form.customEvent : form.eventSelection;

    try {
      let finalValue = parseFloat(form.value);
      if (form.unit === "seconds") {
        finalValue = parsePerformance(form.value, form.unit);
      }

      await api.post("/records/", {
        venue: form.venue,
        event: eventName,
        value: finalValue,
        unit: form.unit,
        iaaf_score: form.iaaf_score ? parseInt(form.iaaf_score, 10) : null,
        date: form.date,
        notes: form.notes,
      });
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Failed to save record. Ensure your time format is correct (e.g. 15.42 or 4:18.52).");
    } finally {
      setLoading(false);
    }
  };

  const currentGroups = eventsData[form.venue] || [];

  return (
    <div className="form-page">
      <div className="card max-w-md mx-auto">
        <h2>Add New Record</h2>
        <form onSubmit={handleSubmit} className="record-form mt-4">

          <div className="form-group row">
            <div className="flex-1">
              <label>Venue</label>
              <select value={form.venue} onChange={handleVenueChange} required>
                <option value="Outdoors">Outdoors</option>
                <option value="Indoors">Indoors</option>
              </select>
            </div>
            <div className="flex-2">
              <label>Event</label>
              <select
                value={form.eventSelection}
                onChange={(e) => setForm({ ...form, eventSelection: e.target.value })}
                required
              >
                {currentGroups.map(([groupName, events]) => (
                  <optgroup key={groupName} label={groupName}>
                    {events.map(([val, label]) => (
                      <option key={val} value={val}>
                        {label}
                      </option>
                    ))}
                  </optgroup>
                ))}
                <optgroup label="Other">
                  <option value="custom">Custom Event...</option>
                </optgroup>
              </select>
            </div>
          </div>

          {form.eventSelection === "custom" && (
            <div className="form-group slide-down">
              <label>Custom Event Name</label>
              <input
                type="text"
                placeholder="e.g., 30m Dash"
                value={form.customEvent}
                onChange={(e) => setForm({ ...form, customEvent: e.target.value })}
                required
                maxLength={100}
              />
            </div>
          )}

          <div className="form-group">
            <label>Value</label>
            <div className="input-with-select">
              <input
                type="text"
                placeholder={form.unit === "seconds" ? "e.g. 12.34 or 4:15.50" : "0.00"}
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                required
              />
              <select
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
              >
                <option value="seconds">Seconds (s)</option>
                <option value="meters">Meters (m)</option>
              </select>
            </div>
          </div>

          <div className="form-group row">
            <div className="flex-1">
              <label>Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>
            <div className="flex-1">
              <label>IAAF Points (Optional)</label>
              <input
                type="number"
                placeholder="e.g. 1042"
                value={form.iaaf_score}
                onChange={(e) => setForm({ ...form, iaaf_score: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Notes (Optional)</label>
            <textarea
              placeholder="Wind-aid, competition name, training context..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows="2"
            />
          </div>

          <div className="form-actions row mt-4">
            <button
              type="button"
              className="btn btn-secondary flex-1"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary flex-2" disabled={loading}>
              {loading ? "Saving..." : "Save Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
