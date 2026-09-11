import CategorySelector from "./CategorySelector";
import ThumbnailUploader from "./ThumbnailUploader";
import VisibilitySelector from "./VisibilitySelector";

interface ContentDetailsProps {
  title: string;
  setTitle: (value: string) => void;

  description: string;
  setDescription: (value: string) => void;

  category: string;
  setCategory: (value: string) => void;

  thumbnail: File | null;
  setThumbnail: (file: File | null) => void;

  visibility: string;
  setVisibility: (value: string) => void;
  onNext?: () => void;
}

export default function ContentDetails({
  title,
  setTitle,
  description,
  setDescription,
  category,
  setCategory,
  thumbnail,
  setThumbnail,
  visibility,
  setVisibility,
  onNext,
}: ContentDetailsProps) {
  return (
    <div className="content-details">

      <h2>Content Details</h2>

      <div className="form-group">
        <label>Title</label>

        <input
          type="text"
          placeholder="Enter content title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label>Description</label>

        <textarea
          rows={5}
          placeholder="Tell viewers about your content..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="form-textarea"
        />
      </div>

      <CategorySelector
        category={category}
        setCategory={setCategory}
      />

      <ThumbnailUploader
        thumbnail={thumbnail}
        setThumbnail={setThumbnail}
      />

      <VisibilitySelector
        visibility={visibility}
        setVisibility={setVisibility}
      />

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
        <button className="next-btn" onClick={() => onNext?.()}>Next</button>
      </div>

    </div>
  );
}