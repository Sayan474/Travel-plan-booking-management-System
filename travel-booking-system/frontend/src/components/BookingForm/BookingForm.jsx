import { useMemo, useState } from "react";

import styles from "./BookingForm.module.css";

const STEPS = ["Review", "Passengers", "Add-ons", "Payment"];

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
    if (step === 3) return form.card_number.length >= 12 && form.cvv.length >= 3;
    return true;
  }, [step, form]);

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
          <pre>{JSON.stringify(selection, null, 2)}</pre>
        </div>
      )}

      {step === 1 && (
        <div className={styles.grid2}>
          <input className="input" placeholder="Full Name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          <input className="input" placeholder="Passport Number" value={form.passport_number} onChange={(e) => setForm({ ...form, passport_number: e.target.value })} />
          <input className="input" type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
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
          <input className="input" placeholder="Card Number" value={form.card_number} onChange={(e) => setForm({ ...form, card_number: e.target.value.replace(/\D/g, "") })} />
          <input className="input" placeholder="MM/YY" value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })} />
          <input className="input" placeholder="CVV" value={form.cvv} onChange={(e) => setForm({ ...form, cvv: e.target.value.replace(/\D/g, "") })} />
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
