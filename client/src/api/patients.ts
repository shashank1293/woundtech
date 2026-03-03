import { request } from "./http";
import type { Patient } from "../types/api";

export function getPatients() {
  return request<Patient[]>("/patients");
}

export function createPatient(payload: { name: string; dateOfBirth?: string }) {
  return request<Patient>("/patients", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

