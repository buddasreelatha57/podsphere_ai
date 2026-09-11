import React from "react";
import {
  Pause,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
} from "lucide-react";
import { toast } from "react-toastify";

import "./PodcastPlayer.css";

interface Props {
  title: string;
  creator: string;
  thumbnail: string;
  audio: string;
  onValidView?: () => void;
  onNext?: (isShuffle: boolean) => void;
}

export default function PodcastPlayer({
  title,
  creator,
  thumbnail,
  audio,
  onValidView,
  onNext,
}: Props) {
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [volume, setVolume] = React.useState(1);
  const [speed, setSpeed] = React.useState(1);
  const [viewCounted, setViewCounted] = React.useState(false);
  const [isRepeat, setIsRepeat] = React.useState(false);
  const [isShuffle, setIsShuffle] = React.useState(false);

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play().catch((error: Error) => {
        if (error.name !== "AbortError") {
          console.error("Audio playback failed:", error);
          toast.error(`Playback failed: ${error.message} (${error.name})`);
        }
      });
    } else {
      audioRef.current.pause();
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      setCurrentTime(current);
      const total = audioRef.current.duration;
      let shouldCountView = false;
      if (total > 0 && total < 10) {
        if (current >= total * 0.75) {
          shouldCountView = true;
        }
      } else {
        if (current >= 10) {
          shouldCountView = true;
        }
      }

      if (shouldCountView && !viewCounted && onValidView) {
        onValidView();
        setViewCounted(true);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && !isNaN(audioRef.current.duration)) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolume = (newVolume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setVolume(newVolume);
    }
  };

  const handleSpeed = (newSpeed: number) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
      setSpeed(newSpeed);
    }
  };

  // When the audio source changes (e.g. clicking a related podcast), reload and play
  React.useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(e => {
        console.log("Autoplay blocked:", e);
        setIsPlaying(false);
      });
      setCurrentTime(0);
    }
  }, [audio]);

  return (
    <div className="podcast-player">
      <audio
        ref={audioRef}
        src={audio}
        autoPlay
        loop={isRepeat}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
          setIsPlaying(false);
          if (!isRepeat && onNext) {
            onNext(isShuffle);
          }
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        preload="auto"
      />

      <div className="album-container" onClick={handlePlayPause}>
        <img
          src={thumbnail}
          alt={title}
          className={`album-cover ${isPlaying ? "rotating" : ""}`}
        />
        <button className="play-btn">
          {isPlaying ? <Pause size={30} fill="black" /> : <Play size={30} fill="black" style={{ marginLeft: "4px" }} />}
        </button>
      </div>

      <h1 className="podcast-title">{title}</h1>
      <p className="creator-name">{creator}</p>

      {/* Progress */}
      <div className="progress-wrapper">
        <input
          type="range"
          className="progress-slider"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={(e) => handleSeek(Number(e.target.value))}
        />
        <div className="progress-time">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="player-controls">
        <button onClick={() => {
          setIsShuffle(!isShuffle);
          toast.info(isShuffle ? "Shuffle disabled" : "Shuffle enabled");
        }}>
          <Shuffle size={22} color={isShuffle ? "var(--accent)" : "currentColor"} />
        </button>
        <button
          onClick={() => {
            if (audioRef.current) {
              audioRef.current.currentTime -= 10;
            }
          }}
        >
          <SkipBack size={25} />
        </button>
        <button
          onClick={() => {
            if (audioRef.current) {
              audioRef.current.currentTime += 10;
            }
          }}
        >
          <SkipForward size={25} />
        </button>
        <button onClick={() => {
          setIsRepeat(!isRepeat);
          toast.info(isRepeat ? "Repeat disabled" : "Repeat enabled");
        }}>
          <Repeat size={22} color={isRepeat ? "var(--accent)" : "currentColor"} />
        </button>
      </div>

      {/* Volume */}
      <div className="volume-row">
        <Volume2 size={20} />
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => handleVolume(Number(e.target.value))}
        />
        <select value={speed} onChange={(e) => handleSpeed(Number(e.target.value))}>
          <option value={0.5}>0.5x</option>
          <option value={0.75}>0.75x</option>
          <option value={1}>1x</option>
          <option value={1.25}>1.25x</option>
          <option value={1.5}>1.5x</option>
          <option value={2}>2x</option>
        </select>
      </div>
    </div>
  );
}