import { useRef, useState, useEffect } from "react";
import { Plus } from "lucide-react";
import "./CreateContent.css";

interface UploadBoxProps {
  file: File | null;
  thumbnail: File | null;
  setFile: (file: File | null) => void;
  setThumbnail: (file: File | null) => void;
}

const generateVideoThumbnail = (file: File): Promise<File | null> => {
  if (!file.type.startsWith("video/")) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;

    // Timeout fallback for huge videos without faststart
    const timeout = setTimeout(() => {
      resolve(null);
      URL.revokeObjectURL(video.src);
    }, 3000);

    video.onloadedmetadata = () => {
      video.currentTime = 0.1; // Safest small seek
    };

    video.onseeked = () => {
      clearTimeout(timeout);
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 360;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const thumbnailFile = new File([blob], "thumbnail.jpg", { type: "image/jpeg" });
            resolve(thumbnailFile);
          } else {
            resolve(null);
          }
          URL.revokeObjectURL(video.src); // Cleanup
        }, "image/jpeg", 0.7);
      } else {
        resolve(null);
      }
    };

    video.onerror = () => {
      clearTimeout(timeout);
      resolve(null);
      URL.revokeObjectURL(video.src);
    };

    video.src = URL.createObjectURL(file);
  });
};

export default function UploadBox({
  file,
  thumbnail,
  setFile,
  setThumbnail
}: UploadBoxProps) {

  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (thumbnail) {
      const url = URL.createObjectURL(thumbnail);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [thumbnail]);

  const handleBrowse = () => {
    inputRef.current?.click();
  };

  const handleChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("video/") && !selectedFile.type.startsWith("audio/")) {
      alert("Please upload a video or audio file.");
      return;
    }

    setFile(selectedFile);
    
    // Generate and set thumbnail
    const thumbnailFile = await generateVideoThumbnail(selectedFile);
    if (thumbnailFile) {
      setThumbnail(thumbnailFile);
    }
  };

  return (
    <div
      className="upload-box"
      onClick={handleBrowse}
    >

      <input
        ref={inputRef}
        type="file"
        accept="video/*,audio/*"
        hidden
        onChange={handleChange}
      />

      {!file ? (
        <>
          <div className="upload-circle">

            <Plus size={42} strokeWidth={2.5} />

          </div>

          <h2>Upload Media</h2>

          <p>
            Drag & Drop your Video or Audio here
          </p>

          <span>or click anywhere to browse</span>
        </>
      ) : (
        <>

          <div className="upload-success">
            {previewUrl ? (
              <img 
                src={previewUrl} 
                alt="Media Thumbnail" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }}
              />
            ) : (
              "🎬"
            )}
          </div>

          <h2>{file.name}</h2>

          <p>
            {(file.size / (1024 * 1024)).toFixed(2)} MB
          </p>

          <span>Ready to publish</span>

        </>
      )}

    </div>
  );
}