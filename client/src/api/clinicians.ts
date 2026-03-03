import { request } from "./http";
import type { Clinician } from "../types/api";

// Fetches the full clinician list.
export function getClinicians() {
  return request<Clinician[]>("/clinicians");
}

// Creates a clinician from the form payload.
export function createClinician(payload: { name: string }) {
  return request<Clinician>("/clinicians", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
