import { prisma } from "../db/prisma";

type CreatePatientInput = {
  name: string;
  dateOfBirth?: Date;
};

// Loads patients alphabetically to keep the picker order predictable.
async function listPatients() {
  return prisma.patient.findMany({
    orderBy: {
      name: "asc",
    },
  });
}

// Persists a new patient record.
async function createPatient(data: CreatePatientInput) {
  return prisma.patient.create({
    data,
  });
}

export const patientsService = {
  listPatients,
  createPatient,
};
