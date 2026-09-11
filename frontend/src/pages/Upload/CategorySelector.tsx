import { FolderOpen } from "lucide-react";
import "./CreateContent.css";

interface CategorySelectorProps {
  category: string;
  setCategory: (value: string) => void;
}

const categories = [
  "Technology",
  "Artificial Intelligence",
  "Programming",
  "Education",
  "Business",
  "Finance",
  "Health",
  "Science",
  "News",
  "Lifestyle",
  "Comedy",
  "Motivation",
  "History",
  "Music",
  "Sports",
  "Gaming",
  "Travel",
  "Food",
  "Books",
  "Others",
];

export default function CategorySelector({
  category,
  setCategory,
}: CategorySelectorProps) {
  return (
    <div className="creator-field">

      <label className="creator-label">
        Category
      </label>

      <div className="select-wrapper">

        <FolderOpen className="select-icon" size={18} />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="creator-select"
        >
          <option value="">
            Select a Category
          </option>

          {categories.map((item) => (
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          ))}

        </select>

      </div>

    </div>
  );
}