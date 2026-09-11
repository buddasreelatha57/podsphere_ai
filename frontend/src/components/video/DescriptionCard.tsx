import "./DescriptionCard.css";

interface Props {
  description: string;
}

export default function DescriptionCard({
  description,
}: Props) {
  return (
    <section className="description-card">

      <h2>Description</h2>

      <p>
        {description || "No description available."}
      </p>

    </section>
  );
}