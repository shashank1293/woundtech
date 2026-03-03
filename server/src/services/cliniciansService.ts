import { prisma } from "../db/prisma";

type CreateClinicianInput = {
  name: string;
};

async function listClinicians() {
  return prisma.clinician.findMany({
    orderBy: {
      name: "asc",
    },
  });
}

async function createClinician(data: CreateClinicianInput) {
  return prisma.clinician.create({
    data,
  });
}

export const cliniciansService = {
  listClinicians,
  createClinician,
};

