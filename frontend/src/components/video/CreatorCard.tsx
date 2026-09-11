import "./CreatorCard.css";

interface Props {
  creator: {
    name: string;
    avatar?: string;
    followers?: string[];
  };

  views: number;

  createdAt: string;

  isFollowing?: boolean;
  onFollow?: () => void;
}

export default function CreatorCard({
  creator,
  views,
  createdAt,
  isFollowing,
  onFollow,
}: Props) {
  return (
    <section className="creator-card">

      <div className="creator-left">

        <div className="creator-avatar">
          {creator.avatar ? (
            <img src={creator.avatar} alt={`${creator.name} profile`} />
          ) : (
            creator.name.charAt(0).toUpperCase()
          )}
        </div>

        <div className="creator-info">

          <h3>{creator.name}</h3>

          <div className="creator-meta">

            <span>
              {(creator.followers?.length || 0).toLocaleString()} abhiman
            </span>

            <span>{(views || 0).toLocaleString()} views</span>

            <span>{new Date(createdAt).toLocaleDateString()}</span>

          </div>

        </div>

      </div>

      <button 
        className={`follow-btn ${isFollowing ? "active" : ""}`} 
        onClick={onFollow}
      >

        Abhimani

      </button>

    </section>
  );
}