import { request } from "./http";
import type { Patient } from "../types/api";

// Fetches the full patient list.
export function getPatients() {
  return request<Patient[]>("/patients");
}

// Creates a patient from the form payload.
export function createPatient(payload: { name: string; dateOfBirth?: string }) {
  return request<Patient>("/patients", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
