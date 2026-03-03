import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { createClinician, getClinicians } from "../api/clinicians";
import { createPatient, getPatients } from "../api/patients";
import { createVisit, getVisits } from "../api/visits";
import { CreateEntityForm } from "../components/CreateEntityForm";
import { CreateVisitForm } from "../components/CreateVisitForm";
import { ResourceList } from "../components/ResourceList";
import { SectionCard } from "../components/SectionCard";
import { VisitsTable } from "../components/VisitsTable";

export function HomePage() {
  const queryClient = useQueryClient();
  const [selectedClinicianId, setSelectedClinicianId] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState("");

  const cliniciansQuery = useQuery({
    queryKey: ["clinicians"],
    queryFn: getClinicians,
  });

  const patientsQuery = useQuery({
    queryKey: ["patients"],
    queryFn: getPatients,
  });

  const visitsQuery = useQuery({
    queryKey: ["visits", "filtered", selectedClinicianId, selectedPatientId],
    queryFn: () =>
      getVisits({
        clinicianId: selectedClinicianId ? Number(selectedClinicianId) : undefined,
        patientId: selectedPatientId ? Number(selectedPatientId) : undefined,
      }),
  });

  const visitSlotsQuery = useQuery({
    queryKey: ["visits", "all"],
    queryFn: () => getVisits({}),
  });

  const createClinicianMutation = useMutation({
    mutationFn: createClinician,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["clinicians"] });
    },
  });

  const createPatientMutation = useMutation({
    mutationFn: createPatient,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });

  const createVisitMutation = useMutation({
    mutationFn: createVisit,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["visits"] }),
        queryClient.invalidateQueries({ queryKey: ["clinicians"] }),
        queryClient.invalidateQueries({ queryKey: ["patients"] }),
      ]);
    },
  });

  const clinicians = cliniciansQuery.data ?? [];
  const patients = patientsQuery.data ?? [];
  const visits = visitsQuery.data ?? [];
  const allVisits = visitSlotsQuery.data ?? [];
  const resourceError = cliniciansQuery.error || patientsQuery.error;

  return (
    <main className="page-shell">
      <section className="hero">
        <img
          className="hero__logo"
          src="https://woundtech.net/wp-content/uploads/2024/06/woundtech-net-logo.png"
          alt="Woundtech"
        />
        <p className="eyebrow">Internal Operations</p>
        <h1>Patient Visit Tracker</h1>
        <p className="hero__copy">
          Track clinician visits, review activity in reverse chronological order, and filter the timeline
          when you need a narrower view.
        </p>
      </section>

      {resourceError ? (
        <p className="banner banner--error">
          {resourceError instanceof Error ? resourceError.message : "Unable to load the application data."}
        </p>
      ) : null}

      <section className="grid grid--two">
        <SectionCard title="Clinicians" description="Current clinicians available for visit tracking.">
          {cliniciansQuery.isLoading ? (
            <p className="empty-state">Loading clinicians...</p>
          ) : (
            <ResourceList
              items={clinicians.map((clinician) => ({
                id: clinician.id,
                primary: clinician.name,
              }))}
              emptyMessage="No clinicians added yet."
            />
          )}

          <CreateEntityForm
            label="Clinician Name"
            submitLabel="Add Clinician"
            isSubmitting={createClinicianMutation.isPending}
            onSubmit={createClinicianMutation.mutateAsync}
          />
        </SectionCard>

        <SectionCard title="Patients" description="Patients available for visit scheduling.">
          {patientsQuery.isLoading ? (
            <p className="empty-state">Loading patients...</p>
          ) : (
            <ResourceList
              items={patients.map((patient) => ({
                id: patient.id,
                primary: patient.name,
                secondary: patient.dateOfBirth
                  ? `DOB ${new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
                      new Date(patient.dateOfBirth),
                    )}`
                  : null,
              }))}
              emptyMessage="No patients added yet."
            />
          )}

          <CreateEntityForm
            label="Patient Name"
            dateLabel="Date of Birth"
            submitLabel="Add Patient"
            isSubmitting={createPatientMutation.isPending}
            onSubmit={createPatientMutation.mutateAsync}
          />
        </SectionCard>
      </section>

      <section className="grid grid--two">
        <SectionCard title="Create Visit" description="Record a new clinician visit for a patient.">
          <CreateVisitForm
            clinicians={clinicians}
            patients={patients}
            visits={allVisits}
            isSubmitting={createVisitMutation.isPending}
            onSubmit={createVisitMutation.mutateAsync}
          />
        </SectionCard>

        <SectionCard title="Filters" description="Narrow the visit timeline by clinician or patient.">
          <div className="stack">
            <label className="field">
              <span>Clinician</span>
              <select value={selectedClinicianId} onChange={(event) => setSelectedClinicianId(event.target.value)}>
                <option value="">All clinicians</option>
                {clinicians.map((clinician) => (
                  <option key={clinician.id} value={clinician.id}>
                    {clinician.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Patient</span>
              <select value={selectedPatientId} onChange={(event) => setSelectedPatientId(event.target.value)}>
                <option value="">All patients</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name}
                  </option>
                ))}
              </select>
            </label>

            <button
              className="button"
              type="button"
              onClick={() => {
                setSelectedClinicianId("");
                setSelectedPatientId("");
              }}
            >
              Clear Filters
            </button>
          </div>
        </SectionCard>
      </section>

      <SectionCard title="Visits" description="Most recent visits appear first.">
        {visitsQuery.isLoading ? <p className="empty-state">Loading visits...</p> : null}
        {visitsQuery.isError ? (
          <p className="banner banner--error">
            {visitsQuery.error instanceof Error ? visitsQuery.error.message : "Unable to load visits."}
          </p>
        ) : null}
        {!visitsQuery.isLoading && !visitsQuery.isError ? <VisitsTable visits={visits} /> : null}
      </SectionCard>
    </main>
  );
}
