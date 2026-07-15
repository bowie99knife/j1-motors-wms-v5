import { useState } from "react";
import { configured, supabase } from "../lib/supabase";

type TrackRecord = {
  type: "job" | "appointment" | "quotation";
  status: string;
  rego: string;
  make: string;
  model: string;
  job_number?: string;
  preferred_date?: string;
  preferred_time?: string;
  estimated_completion?: string;
  recommendations?: string;
};

function findDemoRecord(rego: string, phone: string): TrackRecord | null {
  const normalizedRego = rego.trim().toUpperCase();
  const normalizedPhone = phone.replace(/\s+/g, "");

  try {
    const jobs = JSON.parse(localStorage.getItem("j1_demo_jobs") || "[]");
    const job = jobs.find((item: any) =>
      String(item.rego || "").toUpperCase() === normalizedRego &&
      String(item.customer_phone || "").replace(/\s+/g, "") === normalizedPhone
    );
    if (job) {
      return {
        type: "job",
        job_number: job.job_number,
        status: job.status,
        rego: job.rego,
        make: job.make,
        model: job.model,
        estimated_completion: job.estimated_completion,
        recommendations: job.recommendations,
      };
    }

    const bookings = JSON.parse(localStorage.getItem("j1_demo_bookings") || "[]");
    const booking = bookings.find((item: any) =>
      String(item.rego || "").toUpperCase() === normalizedRego &&
      String(item.customer_phone || "").replace(/\s+/g, "") === normalizedPhone
    );
    if (booking) {
      return {
        type: "appointment",
        status: booking.status,
        rego: booking.rego,
        make: booking.make,
        model: booking.model,
        preferred_date: booking.preferred_date,
        preferred_time: booking.preferred_time,
      };
    }

    const quotes = JSON.parse(localStorage.getItem("j1_demo_quotes") || "[]");
    const quote = quotes.find((item: any) =>
      String(item.rego || "").toUpperCase() === normalizedRego &&
      String(item.customer_phone || "").replace(/\s+/g, "") === normalizedPhone
    );
    if (quote) {
      return {
        type: "quotation",
        status: quote.status,
        rego: quote.rego,
        make: quote.make,
        model: quote.model,
      };
    }
  } catch {
    return null;
  }

  return null;
}

export default function Tracking() {
  const [rego, setRego] = useState("");
  const [phone, setPhone] = useState("");
  const [record, setRecord] = useState<TrackRecord | null>(null);
  const [message, setMessage] = useState("");

  async function search() {
    if (!rego.trim() || !phone.trim()) {
      setMessage("Enter both registration and phone number.");
      setRecord(null);
      return;
    }

    setMessage("Searching…");

    if (!configured) {
      const demoRecord = findDemoRecord(rego, phone);
      setRecord(demoRecord);
      setMessage(demoRecord ? "" : "No matching vehicle record found.");
      return;
    }

    const { data, error } = await supabase.rpc("track_vehicle_by_rego_phone", {
      registration_input: rego.trim(),
      phone_input: phone.trim(),
    });

    if (error) {
      setMessage(error.message);
      setRecord(null);
      return;
    }

    setRecord(data as TrackRecord | null);
    setMessage(data ? "" : "No matching vehicle record found.");
  }

  return (
    <section>
      <div className="title">
        <span className="eyebrow">Customer portal</span>
        <h1>Track repair</h1>
        <p>Enter the registration and phone number used for the booking or job card.</p>
      </div>

      <div className="panel">
        <div className="trackFields">
          <label>
            Vehicle registration
            <input
              autoCapitalize="characters"
              placeholder="e.g. 1ABC234"
              value={rego}
              onChange={(event) => setRego(event.target.value.toUpperCase())}
            />
          </label>

          <label>
            Phone number
            <input
              type="tel"
              inputMode="tel"
              placeholder="e.g. 0412 345 678"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </label>

          <button className="primary trackButton" type="button" onClick={search}>
            Track vehicle
          </button>
        </div>

        {message && <p className="notice">{message}</p>}

        {record && (
          <article className="trackingResult">
            <div>
              <span className="eyebrow">{record.type}</span>
              <h2>{record.rego} · {record.make} {record.model}</h2>
              {record.job_number && <p>Job number: <strong>{record.job_number}</strong></p>}
              <p>Status: <strong>{record.status}</strong></p>
              {record.preferred_date && <p>Appointment: {record.preferred_date} {record.preferred_time || ""}</p>}
              {record.estimated_completion && <p>Estimated completion: {new Date(record.estimated_completion).toLocaleString()}</p>}
              {record.recommendations && <p>{record.recommendations}</p>}
            </div>
          </article>
        )}
      </div>
    </section>
  );
}
