import type { Visit } from "../types/api";

export const TIME_OPTIONS = Array.from({ length: 96 }, (_, index) => {
  const totalMinutes = index * 15;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
});

export function getDefaultVisitDate(referenceDate = new Date()) {
  const normalized = new Date(referenceDate);
  normalized.setMinutes(normalized.getMinutes() - normalized.getTimezoneOffset());

  return normalized.toISOString().slice(0, 10);
}

export function getDefaultVisitTime(referenceDate = new Date()) {
  const totalMinutes = referenceDate.getHours() * 60 + referenceDate.getMinutes();
  const roundedMinutes = Math.ceil(totalMinutes / 15) * 15;
  const normalizedMinutes = roundedMinutes % (24 * 60);
  const hours = Math.floor(normalizedMinutes / 60);
  const minutes = normalizedMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function formatTimeLabel(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  const meridiem = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;

  return `${displayHours}:${String(minutes).padStart(2, "0")} ${meridiem}`;
}

export function getLocalDateValue(value: string) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getLocalTimeValue(value: string) {
  const date = new Date(value);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

export function isPastVisitDate(visitDate: string, referenceDate = new Date()) {
  return visitDate < getDefaultVisitDate(referenceDate);
}

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
  const slotDate = new Date(referenceDate);
  slotDate.setHours(hours, minutes, 0, 0);

  return slotDate.getTime() < referenceDate.getTime();
}

export function getBookedSlotsForClinicianDate(
  visits: Visit[],
  clinicianId: string,
  visitDate: string,
) {
  return new Set(
    visits
      .filter(
        (visit) =>
          String(visit.clinicianId) === clinicianId && getLocalDateValue(visit.visitedAt) === visitDate,
      )
      .map((visit) => getLocalTimeValue(visit.visitedAt)),
  );
}
