import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import Sidebar from "../../components/dashboard/Sidebar";
import Navbar from "../../components/dashboard/Navbar";

import UploadBox from "./UploadBox";
import ContentDetails from "./ContentDetails";
import AIOptions from "./AIOptions";
import PublishOptions from "./PublishOptions";

import { uploadContent } from "../../services/content.service";

import "./CreateContent.css";

export default function CreateContent() {
  const navigate = useNavigate();

  // ==========================
  // Upload
  // ==========================

  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);

  // ==========================
  // Content Details
  // ==========================

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [visibility, setVisibility] = useState("public");

  // ==========================
  // Publish Options
  // ==========================

  const [publishVideo, setPublishVideo] = useState(true);
  const [publishAudio, setPublishAudio] = useState(true);
  const [publishArticle, setPublishArticle] = useState(true);

  // ==========================
  // AI Options
  // ==========================

  const [transcript, setTranscript] = useState(true);
  const [summary, setSummary] = useState(true);
  const [chapters, setChapters] = useState(true);
  const [translation, setTranslation] = useState(false);
  const [seo, setSeo] = useState(true);
  const [aiVoice, setAiVoice] = useState(false);

  // ==========================
  // Page State
  // ==========================

  const [step, setStep] = useState<"details" | "publish">("details");
  const [loading, setLoading] = useState(false);

  // ==========================
  // Publish Content
  // ==========================

  const handlePublish = async (publishStatus: "published" | "draft" = "published") => {
    if (!file) {
      toast.error("Please upload a video or audio file.");
      return;
    }

    if (!title.trim()) {
      toast.error("Please enter a title.");
      return;
    }

    if (!category) {
      toast.error("Please select a category.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      // Files
      formData.append("video", file);

      if (thumbnail) {
        formData.append("thumbnail", thumbnail);
      }

      // Details
      formData.append("title", title);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("visibility", visibility);

      // Publish Options
      formData.append("publishVideo", publishVideo.toString());
      formData.append("publishPodcast", publishAudio.toString());
      formData.append("publishArticle", publishArticle.toString());

      // AI Options
      formData.append("aiTranscript", transcript.toString());
      formData.append("aiSummary", summary.toString());
      formData.append("aiChapters", chapters.toString());
      formData.append("aiTranslation", translation.toString());
      formData.append("aiSEO", seo.toString());
      formData.append("aiVoice", aiVoice.toString());
      formData.append("status", publishStatus);

      await uploadContent(formData);

      toast.success("Content uploaded successfully!");

      navigate("/dashboard");
    } catch (error: any) {
      console.error(error);

      toast.error(
        error?.response?.data?.message || "Upload failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="main-content create-content-page">
        <Navbar />

        <div className="page-body">
          <div className="page-header">
            <h1>Create New Content</h1>

            <p>
              Upload once • Publish Video • Podcast • Article with AI
            </p>
          </div>

          <div className="upload-layout">
            {/* Left */}
            <div className="glass-card">
              <UploadBox
                file={file}
                thumbnail={thumbnail}
                setFile={setFile}
                setThumbnail={setThumbnail}
              />
            </div>

            {/* Right */}
            <div className="glass-card">
              {step === "details" && (
                <ContentDetails
                  title={title}
                  setTitle={setTitle}
                  description={description}
                  setDescription={setDescription}
                  category={category}
                  setCategory={setCategory}
                  thumbnail={thumbnail}
                  setThumbnail={setThumbnail}
                  visibility={visibility}
                  setVisibility={setVisibility}
                  onNext={() => setStep("publish")}
                />
              )}

              {step === "publish" && (
                <PublishOptions
                  publishVideo={publishVideo}
                  setPublishVideo={setPublishVideo}
                  publishAudio={publishAudio}
                  setPublishAudio={setPublishAudio}
                  publishArticle={publishArticle}
                  setPublishArticle={setPublishArticle}
                  loading={loading}
                  onBack={() => setStep("details")}
                  onPublish={() => handlePublish("published")}
                  onSaveDraft={() => handlePublish("draft")}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}