import { FormEvent, useEffect, useState } from "react";

import type { Clinician, Patient, Visit } from "../types/api";
import {
  formatTimeLabel,
  getBookedSlotsForClinicianDate,
  getDefaultVisitDate,
  getDefaultVisitTime,
  isPastVisitDate,
  isPastVisitSlot,
  TIME_OPTIONS,
} from "./visitSlotUtils";

type CreateVisitFormProps = {
  clinicians: Clinician[];
  patients: Patient[];
  visits: Visit[];
  isSubmitting: boolean;
  onSubmit: (payload: {
    clinicianId: number;
    patientId: number;
    visitedAt: string;
    notes?: string;
  }) => Promise<unknown>;
};

export function CreateVisitForm({
  clinicians,
  patients,
  visits,
  isSubmitting,
  onSubmit,
}: CreateVisitFormProps) {
  const [clinicianId, setClinicianId] = useState("");
  const [patientId, setPatientId] = useState("");
  const [visitDate, setVisitDate] = useState(getDefaultVisitDate);
  const [visitTime, setVisitTime] = useState(getDefaultVisitTime);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const today = getDefaultVisitDate();
  const bookedSlots = getBookedSlotsForClinicianDate(visits, clinicianId, visitDate);
  const hasSelectedSlotBooked = bookedSlots.has(visitTime);
  const hasSelectedSlotInPast = isPastVisitSlot(visitDate, visitTime);

  useEffect(() => {
    if (!clinicianId && clinicians[0]) {
      setClinicianId(String(clinicians[0].id));
    }
  }, [clinicianId, clinicians]);

  useEffect(() => {
    if (!patientId && patients[0]) {
      setPatientId(String(patients[0].id));
    }
  }, [patientId, patients]);

  useEffect(() => {
    if (bookedSlots.has(visitTime) || isPastVisitSlot(visitDate, visitTime)) {
      const nextAvailableSlot = TIME_OPTIONS.find(
        (timeOption) => !bookedSlots.has(timeOption) && !isPastVisitSlot(visitDate, timeOption),
      );

      if (nextAvailableSlot) {
        setVisitTime(nextAvailableSlot);
      }
    }
  }, [bookedSlots, visitDate, visitTime]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!clinicianId || !patientId || !visitDate || !visitTime) {
      setError("Clinician, patient, and visit date are required.");
      return;
    }

    const normalizedVisitDate = new Date(`${visitDate}T${visitTime}:00`);

    if (normalizedVisitDate.getMinutes() % 15 !== 0) {
      setError("Visit time must be in 15-minute increments.");
      return;
    }

    if (isPastVisitDate(visitDate) || normalizedVisitDate.getTime() < Date.now()) {
      setError("Visits cannot be booked in the past.");
      return;
    }

    if (bookedSlots.has(visitTime)) {
      setError("This slot is already booked for the selected clinician.");
      return;
    }

    try {
      await onSubmit({
        clinicianId: Number(clinicianId),
        patientId: Number(patientId),
        visitedAt: normalizedVisitDate.toISOString(),
        notes: notes.trim() || undefined,
      });
      setNotes("");
      setVisitDate(getDefaultVisitDate());
      setVisitTime(getDefaultVisitTime());
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to save visit.");
    }
  }

  const isDisabled = isSubmitting || clinicians.length === 0 || patients.length === 0;

  return (
    <form className="stack" onSubmit={handleSubmit}>
      <label className="field">
        <span>Clinician</span>
        <select value={clinicianId} onChange={(event) => setClinicianId(event.target.value)} disabled={isDisabled}>
          <option value="">Select a clinician</option>
          {clinicians.map((clinician) => (
            <option key={clinician.id} value={clinician.id}>
              {clinician.name}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Patient</span>
        <select value={patientId} onChange={(event) => setPatientId(event.target.value)} disabled={isDisabled}>
          <option value="">Select a patient</option>
          {patients.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {patient.name}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Visit Date</span>
        <input
          type="date"
          value={visitDate}
          min={today}
          onChange={(event) => setVisitDate(event.target.value)}
          disabled={isDisabled}
        />
      </label>

      <label className="field">
        <span>Visit Time</span>
        <div className="slot-grid" role="list" aria-label="15-minute visit slots">
          {TIME_OPTIONS.map((timeOption) => {
            const isBooked = bookedSlots.has(timeOption);
            const isPastSlot = isPastVisitSlot(visitDate, timeOption);
            const isSelected = visitTime === timeOption;

            return (
              <button
                key={timeOption}
                type="button"
                className={`slot-pill${isSelected ? " slot-pill--selected" : ""}${isBooked || isPastSlot ? " slot-pill--booked" : ""}`}
                onClick={() => setVisitTime(timeOption)}
                disabled={isDisabled || isBooked || isPastSlot}
                aria-pressed={isSelected}
              >
                {formatTimeLabel(timeOption)}
              </button>
            );
          })}
        </div>
      </label>

      <p className="field-hint">
        Visits are scheduled in 15-minute slots. Gray slots are already booked for the selected
        clinician.
      </p>

      {hasSelectedSlotBooked ? (
        <p className="error-text">Choose another slot. This one is already booked.</p>
      ) : hasSelectedSlotInPast ? (
        <p className="error-text">Choose a current or future slot.</p>
      ) : null}

      <label className="field">
        <span>Notes</span>
        <textarea
          rows={4}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Optional visit notes"
          disabled={isDisabled}
        />
      </label>

      {clinicians.length === 0 || patients.length === 0 ? (
        <p className="empty-state">Add at least one clinician and one patient before recording a visit.</p>
      ) : null}

      {error ? <p className="error-text">{error}</p> : null}

      <button className="button button--primary" type="submit" disabled={isDisabled}>
        {isSubmitting ? "Saving..." : "Record Visit"}
      </button>
    </form>
  );
}
