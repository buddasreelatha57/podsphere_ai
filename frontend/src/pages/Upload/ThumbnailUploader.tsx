import { useRef } from "react";
import { ImagePlus, X } from "lucide-react";
import "./CreateContent.css";

interface ThumbnailUploaderProps {
  thumbnail: File | null;
  setThumbnail: (file: File | null) => void;
}

export default function ThumbnailUploader({
  thumbnail,
  setThumbnail,
}: ThumbnailUploaderProps) {

  const inputRef = useRef<HTMLInputElement>(null);

  const handleBrowse = () => {
    inputRef.current?.click();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    const file = e.target.files?.[0];

    if (!file) return;

    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowed.includes(file.type)) {
      alert("Only JPG, PNG and WEBP are allowed.");
      return;
    }

    setThumbnail(file);
  };

  return (
    <div className="form-group">

      <label>Thumbnail</label>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleChange}
      />

      {!thumbnail ? (

        <div
          className="thumbnail-upload"
          onClick={handleBrowse}
        >

          <ImagePlus size={42} />

          <p>Upload Thumbnail</p>

          <span>JPG • PNG • WEBP</span>

        </div>

      ) : (

        <div className="thumbnail-preview">

          <img
            src={URL.createObjectURL(thumbnail)}
            alt="Thumbnail"
          />

          <button
            type="button"
            className="remove-thumbnail"
            onClick={() => setThumbnail(null)}
          >
            <X size={18} />
          </button>

        </div>

      )}

    </div>
  );
}