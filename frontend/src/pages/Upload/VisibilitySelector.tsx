import "./CreateContent.css";
interface VisibilitySelectorProps {
  visibility: string;
  setVisibility: (value: string) => void;
}

const options = [
  {
    id: "public",
    title: "Public",
    description: "Anyone can discover and watch your content.",
    icon: "🌍",
  },
  {
    id: "private",
    title: "Private",
    description: "Only you can access this content.",
    icon: "🔒",
  },
];

export default function VisibilitySelector({
  visibility,
  setVisibility,
}: VisibilitySelectorProps) {
  return (
    <div className="form-group">

      <label>Visibility</label>

      <div className="visibility-list">

        {options.map((item) => (

          <label
            key={item.id}
            className={`visibility-card ${
              visibility === item.id ? "selected" : ""
            }`}
          >

            <input
              type="radio"
              name="visibility"
              value={item.id}
              checked={visibility === item.id}
              onChange={(e) => setVisibility(e.target.value)}
            />

            <div className="visibility-content">

              <span className="visibility-icon">
                {item.icon}
              </span>

              <div>

                <h4>{item.title}</h4>

                <p>{item.description}</p>

              </div>

            </div>

          </label>

        ))}

      </div>

    </div>
  );
}