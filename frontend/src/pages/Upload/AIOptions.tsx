import "./CreateContent.css";

interface AIOptionsProps {
  transcript: boolean;
  setTranscript: (value: boolean) => void;

  summary: boolean;
  setSummary: (value: boolean) => void;

  chapters: boolean;
  setChapters: (value: boolean) => void;

  translation: boolean;
  setTranslation: (value: boolean) => void;

  seo: boolean;
  setSeo: (value: boolean) => void;

  aiVoice: boolean;
  setAiVoice: (value: boolean) => void;
  onNext?: () => void;
  onBack?: () => void;
}

export default function AIOptions({
  transcript,
  setTranscript,
  summary,
  setSummary,
  chapters,
  setChapters,
  translation,
  setTranslation,
  seo,
  setSeo,
  aiVoice,
  setAiVoice,
  onNext,
  onBack,
}: AIOptionsProps) {

  const options = [
    {
      title: "Transcript",
      description: "Convert speech into text.",
      icon: "📝",
      checked: transcript,
      setter: setTranscript,
    },
    {
      title: "Summary",
      description: "Generate an AI summary.",
      icon: "📄",
      checked: summary,
      setter: setSummary,
    },
    {
      title: "Chapters",
      description: "Generate smart chapters.",
      icon: "⏱",
      checked: chapters,
      setter: setChapters,
    },
    {
      title: "Translation",
      description: "Translate into other languages.",
      icon: "🌍",
      checked: translation,
      setter: setTranslation,
    },
    {
      title: "SEO Metadata",
      description: "Generate SEO title & description.",
      icon: "🏷",
      checked: seo,
      setter: setSeo,
    },
    {
      title: "AI Voice",
      description: "Narrate article using AI voice.",
      icon: "🎙",
      checked: aiVoice,
      setter: setAiVoice,
    },
  ];

  return (
    <div className="form-group">

      <label>AI Features</label>

      <div className="ai-grid">

        {options.map((item) => (

          <div
            key={item.title}
            className={`ai-card ${item.checked ? "selected" : ""}`}
            onClick={() => item.setter(!item.checked)}
          >

            <input
              type="checkbox"
              checked={item.checked}
              readOnly
            />

            <span className="ai-icon">{item.icon}</span>

            <div>

              <h4>{item.title}</h4>

              <p>{item.description}</p>

            </div>

          </div>

        ))}

      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
        <button className="back-btn" onClick={() => onBack?.()}>Back</button>
        <button className="next-btn" onClick={() => onNext?.()}>Next</button>
      </div>

    </div>
  );
}