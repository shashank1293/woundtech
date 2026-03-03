export type Clinician = {
  id: number;
  name: string;
  createdAt: string;
};

export type Patient = {
  id: number;
  name: string;
  dateOfBirth: string | null;
  createdAt: string;
};

export type Visit = {
  id: number;
  clinicianId: number;
  patientId: number;
  visitedAt: string;
  notes: string | null;
  createdAt: string;
  clinician: {
    id: number;
    name: string;
  };
  patient: {
    id: number;
    name: string;
  };
};

export type ApiError = {
  message: string;
  issues?: Array<{
    path: string;
    message: string;
  }>;
};

