import "./DescriptionCard.css";
import { useState } from "react";

interface Props {
  description: string;
}

export default function DescriptionCard({
  description,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = description.length > 320;

  return (
    <section className="description-card">

      <h2>Description</h2>

      <p className={`description-text ${expanded ? "expanded" : ""}`}>
        {description || "No description available."}
      </p>

      {hasMore && (
        <button
          type="button"
          className="description-toggle"
          onClick={() => setExpanded((isExpanded) => !isExpanded)}
          aria-expanded={expanded}
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}

    </section>
  );
}