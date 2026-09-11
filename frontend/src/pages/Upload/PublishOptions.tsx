import { useState } from "react";
import "./CreateContent.css";

interface PublishOptionsProps {
  publishVideo: boolean;
  setPublishVideo: (value: boolean) => void;

  publishAudio: boolean;
  setPublishAudio: (value: boolean) => void;

  publishArticle: boolean;
  setPublishArticle: (value: boolean) => void;

  loading?: boolean;

  onBack?: () => void;
  onPublish?: () => void;
  onSaveDraft?: () => void;
}

export default function PublishOptions({
  publishVideo,
  setPublishVideo,
  publishAudio,
  setPublishAudio,
  publishArticle,
  setPublishArticle,
  loading = false,
  onBack,
  onPublish,
  onSaveDraft,
}: PublishOptionsProps) {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="form-group">
      <label>Publish Formats</label>

      <div className="publish-grid">
        {/* Video */}
        <div
          className={`publish-card ${publishVideo ? "selected" : ""}`}
          onClick={() => setPublishVideo(!publishVideo)}
        >
          <input
            type="checkbox"
            checked={publishVideo}
            readOnly
          />

          <span className="publish-icon">🎥</span>

          <div>
            <h4>Video</h4>
            <p>Publish the original MP4.</p>
          </div>
        </div>

        {/* Podcast */}
        <div
          className={`publish-card ${publishAudio ? "selected" : ""}`}
          onClick={() => setPublishAudio(!publishAudio)}
        >
          <input
            type="checkbox"
            checked={publishAudio}
            readOnly
          />

          <span className="publish-icon">🎧</span>

          <div>
            <h4>Podcast</h4>
            <p>Extract and publish audio.</p>
          </div>
        </div>

        {/* Article */}
        <div
          className={`publish-card ${publishArticle ? "selected" : ""}`}
          onClick={() => setPublishArticle(!publishArticle)}
        >
          <input
            type="checkbox"
            checked={publishArticle}
            readOnly
          />

          <span className="publish-icon">📖</span>

          <div>
            <h4>Reading Article</h4>
            <p>Generate an AI article.</p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
        <input 
          type="checkbox" 
          id="termsCheck" 
          checked={agreed} 
          onChange={(e) => setAgreed(e.target.checked)} 
          style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "#0fb3a0" }}
        />
        <label htmlFor="termsCheck" style={{ fontSize: "14px", color: "#94a3b8", cursor: "pointer" }}>
          I agree to the Terms and Conditions and confirm this content does not contain 18+ or explicit material.
        </label>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "30px",
          gap: "12px",
        }}
      >
        <button
          className="back-btn"
          onClick={onBack}
          disabled={loading}
        >
          ← Back
        </button>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            className="secondary-btn"
            disabled={loading || !agreed}
            onClick={onSaveDraft}
          >
            Save Draft
          </button>

          <button
            className="publish-btn"
            onClick={onPublish}
            disabled={loading || !agreed}
            style={{ opacity: (!agreed || loading) ? 0.5 : 1, cursor: (!agreed || loading) ? "not-allowed" : "pointer" }}
          >
            {loading ? "Uploading..." : "🚀 Publish Content"}
          </button>
        </div>
      </div>
    </div>
  );
}