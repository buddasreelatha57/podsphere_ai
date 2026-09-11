import "./RelatedCard.css";

interface Props {
  article: any;
  onClick?: () => void;
}

export default function RelatedArticleCard({ article, onClick }: Props) {
  return (
    <div
      className="related-card"
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <img src={article.thumbnail} alt={article.title} />

      <div className="related-info">
        <h4>{article.title}</h4>
        <p className="creator-name">{article.creator?.name || "Unknown Creator"}</p>
        <div className="stats-row">
          <span>{article.views || 0} reads</span>
          <span className="dot">•</span>
          <span>{new Date(article.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>
    </div>
  );
}