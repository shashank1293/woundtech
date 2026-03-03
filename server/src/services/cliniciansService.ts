import { prisma } from "../db/prisma";

type CreateClinicianInput = {
  name: string;
};

// Loads clinicians alphabetically to keep the picker order predictable.
async function listClinicians() {
  return prisma.clinician.findMany({
    orderBy: {
      name: "asc",
    },
  });
}

// Persists a new clinician record.
async function createClinician(data: CreateClinicianInput) {
  return prisma.clinician.create({
    data,
  });
}

export const cliniciansService = {
  listClinicians,
  createClinician,
};
