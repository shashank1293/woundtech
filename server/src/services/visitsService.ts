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

// Loads visits with related clinician and patient names for the table view.
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

// Creates a visit after verifying the related records exist.
async function createVisit(data: CreateVisitInput) {
  // Fail fast with clear 404s before attempting the insert so API callers get actionable errors.
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
    // Prisma raises a unique-constraint error when a clinician already has a visit at this exact slot.
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
