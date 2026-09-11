import { Clock3 } from "lucide-react";
import "./ChapterList.css";

interface Chapter {
  title: string;
  startTime: number;
}

interface Props {
  chapters: Chapter[];
}

export default function ChapterList({
  chapters,
}: Props) {

  const jumpToChapter = (time: number) => {

    const player = document.querySelector(
      ".video-player"
    ) as HTMLVideoElement;

    if (!player) return;

    player.currentTime = time;

    player.play();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  };

  const formatTime = (seconds: number) => {

    const mins = Math.floor(seconds / 60);

    const secs = Math.floor(seconds % 60);

    return `${mins}:${secs
      .toString()
      .padStart(2, "0")}`;

  };

  if (!chapters || chapters.length === 0)
    return null;

  return (

    <section className="chapter-card">

      <h2>📑 Chapters</h2>

      <div className="chapter-list">

        {chapters.map((chapter, index) => (

          <div
            key={index}
            className="chapter-item"
            onClick={() =>
              jumpToChapter(chapter.startTime)
            }
          >

            <div className="chapter-time">

              <Clock3 size={16} />

              {formatTime(chapter.startTime)}

            </div>

            <div className="chapter-title">

              {chapter.title}

            </div>

          </div>

        ))}

      </div>

    </section>

  );
}