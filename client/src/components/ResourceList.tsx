type ResourceListProps = {
  items: Array<{
    id: number;
    primary: string;
    secondary?: string | null;
  }>;
  emptyMessage: string;
};

export function ResourceList({ items, emptyMessage }: ResourceListProps) {
  if (items.length === 0) {
    return <p className="empty-state">{emptyMessage}</p>;
  }

  return (
    <ul className="resource-list">
      {items.map((item) => (
        <li key={item.id} className="resource-list__item">
          <span>{item.primary}</span>
          {item.secondary ? <small>{item.secondary}</small> : null}
        </li>
      ))}
    </ul>
  );
}

