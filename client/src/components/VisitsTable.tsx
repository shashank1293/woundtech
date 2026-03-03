import type { Visit } from "../types/api";

type VisitsTableProps = {
  visits: Visit[];
};

function formatVisitDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function VisitsTable({ visits }: VisitsTableProps) {
  if (visits.length === 0) {
    return <p className="empty-state">No visits match the current filters.</p>;
  }

  return (
    <div className="table-shell">
      <table className="visits-table">
        <thead>
          <tr>
            <th>Visit Date</th>
            <th>Clinician</th>
            <th>Patient</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {visits.map((visit) => (
            <tr key={visit.id}>
              <td>{formatVisitDate(visit.visitedAt)}</td>
              <td>{visit.clinician.name}</td>
              <td>{visit.patient.name}</td>
              <td>{visit.notes || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

