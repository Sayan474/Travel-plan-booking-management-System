import { useMemo, useState } from "react";

import styles from "./BookingForm.module.css";

const STEPS = ["Review", "Passengers", "Add-ons", "Payment"];

const formatINR = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return String(value);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const prettifyValue = (label, value) => {
  if (label === "Price") return formatINR(value);
  if (label === "Amenities") return String(value).split(" ").filter(Boolean).join(", ");
  return String(value).replace(/\s+/g, " ").trim();
};

function getCleanSelectionRows(selection) {
  if (!selection || typeof selection !== "object") {
    return [{ label: "Selection", value: "No selection available" }];
  }

  const rows = [];
  const preferredFields = [
    ["Hotel Name", selection.hotel_name],
    ["Flight", selection.flight_name || selection.flight_number],
    ["Airline", selection.airline],
    ["From", selection.origin || selection.from],
    ["To", selection.destination || selection.to],
    ["Location", selection.location || selection.city],
    ["Stars", selection.stars],
    ["Price", selection.price || selection.price_per_night],
  ];

  preferredFields.forEach(([label, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      rows.push({ label, value: prettifyValue(label, value) });
    }
  });

  if (Array.isArray(selection.amenities) && selection.amenities.length > 0) {
    rows.push({ label: "Amenities", value: selection.amenities.join(", ") });
  }

  if (rows.length > 0) {
    return rows;
  }

  Object.entries(selection).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (typeof value === "object") return;
    const label = key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
    rows.push({ label, value: String(value) });
  });

  return rows.length > 0 ? rows : [{ label: "Selection", value: "Details available" }];
}

export default function BookingForm({ selection, onConfirm }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    full_name: "",
    passport_number: "",
    dob: "",
    nationality: "",
    seat: "Window",
    meal: "Veg",
    insurance: true,
    card_number: "",
    expiry: "",
    cvv: "",
  });

  const canContinue = useMemo(() => {
    if (step === 1) return form.full_name && form.passport_number && form.dob;
    if (step === 3) {
      return form.card_number.length >= 12 && form.cvv.length >= 3 && form.cvv.length <= 4 && /^\d{2}\/\d{4}$/.test(form.expiry);
    }
    return true;
  }, [step, form]);

  const reviewRows = useMemo(() => getCleanSelectionRows(selection), [selection]);

  const submit = () => {
    onConfirm({
      passenger: {
        full_name: form.full_name,
        passport_number: form.passport_number,
        dob: form.dob,
        nationality: form.nationality,
      },
      add_ons: { seat: form.seat, meal: form.meal, insurance: form.insurance },
      payment: {
        amount: selection?.price || selection?.price_per_night || 120,
        method: "card",
      },
    });
  };

  return (
    <div className={`${styles.wrap} card`}>
      <div className={styles.progressBar}>
        <div style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
      </div>
      <div className={styles.stepRow}>
        {STEPS.map((s, idx) => (
          <span key={s} className={idx <= step ? styles.done : ""}>
            {idx + 1}. {s}
          </span>
        ))}
      </div>

      {step === 0 && (
        <div className={styles.panel}>
          <h3>Review Selection</h3>
          <div className={styles.reviewList}>
            {reviewRows.map((row) => (
              <div key={row.label} className={styles.reviewItem}>
                <span className={styles.reviewLabel}>{row.label}:</span>
                <span className={styles.reviewValue}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className={styles.grid2}>
          <input className="input" placeholder="Full Name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          <input className="input" placeholder="Passport Number" value={form.passport_number} onChange={(e) => setForm({ ...form, passport_number: e.target.value })} />
          <div className={styles.fieldWithHint}>
            <input
              className="input"
              type="date"
              placeholder="Date of Birth"
              aria-label="Date of Birth (DD/MM/YYYY)"
              title="Date of Birth (DD/MM/YYYY)"
              value={form.dob}
              onChange={(e) => setForm({ ...form, dob: e.target.value })}
            />
            <small className={styles.fieldHint}>Date of Birth (DD/MM/YYYY)</small>
          </div>
          <input className="input" placeholder="Nationality" value={form.nationality} onChange={(e) => setForm({ ...form, nationality: e.target.value })} />
        </div>
      )}

      {step === 2 && (
        <div className={styles.grid2}>
          <select className="select" value={form.seat} onChange={(e) => setForm({ ...form, seat: e.target.value })}>
            <option>Window</option>
            <option>Aisle</option>
            <option>Extra Legroom</option>
          </select>
          <select className="select" value={form.meal} onChange={(e) => setForm({ ...form, meal: e.target.value })}>
            <option>Veg</option>
            <option>Non-Veg</option>
            <option>Vegan</option>
          </select>
          <label className={styles.checkbox}>
            <input type="checkbox" checked={form.insurance} onChange={(e) => setForm({ ...form, insurance: e.target.checked })} />
            Add travel insurance
          </label>
        </div>
      )}

      {step === 3 && (
        <div className={styles.grid2}>
          <input
            className="input"
            placeholder="Card Number"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={19}
            value={form.card_number}
            onChange={(e) => setForm({ ...form, card_number: e.target.value.replace(/\D/g, "").slice(0, 19) })}
          />
          <input
            className="input"
            placeholder="Expiry (MM/YYYY)"
            inputMode="numeric"
            maxLength={7}
            value={form.expiry}
            onChange={(e) => {
              const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 6);
              const formatted = digitsOnly.length > 2 ? `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}` : digitsOnly;
              setForm({ ...form, expiry: formatted });
            }}
          />
          <input
            className="input"
            placeholder="CVV"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            value={form.cvv}
            onChange={(e) => setForm({ ...form, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
          />
        </div>
      )}

      <div className={styles.actions}>
        <button className="btn" disabled={step === 0} onClick={() => setStep(step - 1)}>
          Back
        </button>
        {step < STEPS.length - 1 ? (
          <button className="btn btn-primary" disabled={!canContinue} onClick={() => setStep(step + 1)}>
            Continue
          </button>
        ) : (
          <button className="btn btn-primary" disabled={!canContinue} onClick={submit}>
            Confirm Booking
          </button>
        )}
      </div>
    </div>
  );
}
