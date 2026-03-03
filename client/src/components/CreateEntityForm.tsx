import { FormEvent, useState } from "react";

type CreateEntityFormProps = {
  label: string;
  dateLabel?: string;
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: (payload: { name: string; dateOfBirth?: string }) => Promise<unknown>;
};

export function CreateEntityForm({
  label,
  dateLabel,
  submitLabel,
  isSubmitting,
  onSubmit,
}: CreateEntityFormProps) {
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    try {
      await onSubmit({
        name: name.trim(),
        dateOfBirth: dateLabel && dateOfBirth ? dateOfBirth : undefined,
      });
      setName("");
      setDateOfBirth("");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to save.");
    }
  }

  return (
    <form className="stack" onSubmit={handleSubmit}>
      <label className="field">
        <span>{label}</span>
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Enter a name" />
      </label>

      {dateLabel ? (
        <label className="field">
          <span>{dateLabel}</span>
          <input
            type="date"
            value={dateOfBirth}
            onChange={(event) => setDateOfBirth(event.target.value)}
          />
        </label>
      ) : null}

      {error ? <p className="error-text">{error}</p> : null}

      <button className="button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}

