import type { Visit } from "../types/api";

// Generates every 15-minute time option used by the scheduler pill grid.
export const TIME_OPTIONS = Array.from({ length: 96 }, (_, index) => {
  const totalMinutes = index * 15;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
});

// Returns today's date in the format expected by the HTML date input.
export function getDefaultVisitDate(referenceDate = new Date()) {
  const normalized = new Date(referenceDate);
  // Shift to local time before slicing so the date input stays aligned with the user's calendar day.
  normalized.setMinutes(normalized.getMinutes() - normalized.getTimezoneOffset());

  return normalized.toISOString().slice(0, 10);
}

// Rounds the current time up to the next 15-minute slot for the default selection.
export function getDefaultVisitTime(referenceDate = new Date()) {
  const totalMinutes = referenceDate.getHours() * 60 + referenceDate.getMinutes();
  // New visits snap to the next quarter-hour slot to match the booking rules enforced by the API.
  const roundedMinutes = Math.ceil(totalMinutes / 15) * 15;
  const normalizedMinutes = roundedMinutes % (24 * 60);
  const hours = Math.floor(normalizedMinutes / 60);
  const minutes = normalizedMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

// Converts 24-hour slot values into user-facing labels such as 9:15 AM.
export function formatTimeLabel(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  const meridiem = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;

  return `${displayHours}:${String(minutes).padStart(2, "0")} ${meridiem}`;
}

// Extracts a local calendar date from an ISO timestamp.
export function getLocalDateValue(value: string) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// Extracts a local HH:mm slot value from an ISO timestamp.
export function getLocalTimeValue(value: string) {
  const date = new Date(value);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

// Checks whether the selected visit date is before the current local date.
export function isPastVisitDate(visitDate: string, referenceDate = new Date()) {
  return visitDate < getDefaultVisitDate(referenceDate);
}

// Checks whether a specific date and slot combination is already in the past.
export function isPastVisitSlot(
  visitDate: string,
  visitTime: string,
  referenceDate = new Date(),
) {
  if (isPastVisitDate(visitDate, referenceDate)) {
    return true;
  }

  if (visitDate > getDefaultVisitDate(referenceDate)) {
    return false;
  }

  const [hours, minutes] = visitTime.split(":").map(Number);
  // Compare a concrete local slot timestamp instead of comparing strings such as "09:15".
  const slotDate = new Date(referenceDate);
  slotDate.setHours(hours, minutes, 0, 0);

  return slotDate.getTime() < referenceDate.getTime();
}

// Returns the booked slot set for one clinician on one local calendar day.
export function getBookedSlotsForClinicianDate(
  visits: Visit[],
  clinicianId: string,
  visitDate: string,
) {
  // The form renders pills from local time, so booked slots need to be grouped by the user's local day.
  return new Set(
    visits
      .filter(
        (visit) =>
          String(visit.clinicianId) === clinicianId && getLocalDateValue(visit.visitedAt) === visitDate,
      )
      .map((visit) => getLocalTimeValue(visit.visitedAt)),
  );
}
