import { PropsWithChildren } from "react";

type SectionCardProps = PropsWithChildren<{
  title: string;
  description?: string;
}>;

// Wraps related UI content in a consistent titled card layout.
export function SectionCard({ title, description, children }: SectionCardProps) {
  return (
    <section className="card">
      <div className="card__header">
        <div>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}
