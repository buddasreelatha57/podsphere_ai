import "./RelatedCard.css";

interface Props {
  podcast: any;
  onClick?: () => void;
}

export default function RelatedPodcastCard({ podcast, onClick }: Props) {
  return (
    <div
      className="related-card"
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <img src={podcast.thumbnail} alt={podcast.title} />

      <div className="related-info">
        <h4>{podcast.title}</h4>
        <p className="creator-name">{podcast.creator?.name || "Unknown Creator"}</p>
        <div className="stats-row">
          <span>{podcast.views || 0} plays</span>
          <span className="dot">•</span>
          <span>{new Date(podcast.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>
    </div>
  );
}