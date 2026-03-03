import { request } from "./http";
import type { Clinician } from "../types/api";

export function getClinicians() {
  return request<Clinician[]>("/clinicians");
}

export function createClinician(payload: { name: string }) {
  return request<Clinician>("/clinicians", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

