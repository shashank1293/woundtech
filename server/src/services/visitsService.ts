import { Prisma } from "@prisma/client";

import { prisma } from "../db/prisma";
import { AppError } from "../middleware/errorHandler";

type ListVisitsInput = {
  clinicianId?: number;
  patientId?: number;
};

type CreateVisitInput = {
  clinicianId: number;
  patientId: number;
  visitedAt: Date;
  notes?: string;
};

async function listVisits(filters: ListVisitsInput) {
  return prisma.visit.findMany({
    where: {
      clinicianId: filters.clinicianId,
      patientId: filters.patientId,
    },
    orderBy: {
      visitedAt: "desc",
    },
    include: {
      clinician: {
        select: {
          id: true,
          name: true,
        },
      },
      patient: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

async function createVisit(data: CreateVisitInput) {
  const [clinician, patient] = await Promise.all([
    prisma.clinician.findUnique({ where: { id: data.clinicianId } }),
    prisma.patient.findUnique({ where: { id: data.patientId } }),
  ]);

  if (!clinician) {
    throw new AppError("Clinician not found", 404);
  }

  if (!patient) {
    throw new AppError("Patient not found", 404);
  }

  try {
    return await prisma.visit.create({
      data,
      include: {
        clinician: {
          select: {
            id: true,
            name: true,
          },
        },
        patient: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new AppError("This clinician already has a visit booked for that slot", 409);
    }

    throw error;
  }
}

export const visitsService = {
  listVisits,
  createVisit,
};
