import { request } from "./http";
import type { Visit } from "../types/api";

type VisitFilters = {
  clinicianId?: number;
  patientId?: number;
};

export function getVisits(filters: VisitFilters) {
  const search = new URLSearchParams();

  if (filters.clinicianId) {
    search.set("clinicianId", String(filters.clinicianId));
  }

  if (filters.patientId) {
    search.set("patientId", String(filters.patientId));
  }

  const query = search.toString();

  return request<Visit[]>(`/visits${query ? `?${query}` : ""}`);
}

export function createVisit(payload: {
  clinicianId: number;
  patientId: number;
  visitedAt: string;
  notes?: string;
}) {
  return request<Visit>("/visits", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

