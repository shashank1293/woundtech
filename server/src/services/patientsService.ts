import { prisma } from "../db/prisma";

type CreatePatientInput = {
  name: string;
  dateOfBirth?: Date;
};

async function listPatients() {
  return prisma.patient.findMany({
    orderBy: {
      name: "asc",
    },
  });
}

async function createPatient(data: CreatePatientInput) {
  return prisma.patient.create({
    data,
  });
}

export const patientsService = {
  listPatients,
  createPatient,
};

