import { useRef, useState, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings } from "lucide-react";
import "./VideoPlayer.css";

interface Props {
  title: string;
  thumbnail: string;
  video: string;
  hashtags?: string[];
  summary?: string;
  article?: string;
  transcript?: string;
  onValidView?: () => void;
}

export default function VideoPlayer({
  title,
  thumbnail,
  video,
  hashtags = [],
  summary,
  article,
  transcript,
  onValidView
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("0:00");
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [viewCounted, setViewCounted] = useState(false);

  const [showSettings, setShowSettings] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isLooping, setIsLooping] = useState(false);
  const [quality, setQuality] = useState("Auto");

  const handleSpeedChange = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
  };

  const toggleLoop = () => {
    if (videoRef.current) {
      videoRef.current.loop = !isLooping;
      setIsLooping(!isLooping);
    }
  };

  const handleQualityChange = (q: string) => {
    setQuality(q);
    // Real quality switching requires HLS. This is UI-only for now.
  };

  // formatting time function
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch((error: Error) => {
          if (error.name !== "AbortError") {
            console.error("Video playback failed:", error);
            alert(`Playback failed: ${error.message} (${error.name}). Please try again.`);
          }
        });
      } else {
        videoRef.current.pause();
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      if (!isNaN(total)) {
        setProgress((current / total) * 100);
      }
      setCurrentTime(formatTime(current));

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
    if (videoRef.current && !isNaN(videoRef.current.duration)) {
      setDuration(formatTime(videoRef.current.duration));
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const bar = e.currentTarget;
      const clickPosition = e.clientX - bar.getBoundingClientRect().left;
      const newProgress = clickPosition / bar.offsetWidth;
      videoRef.current.currentTime = newProgress * videoRef.current.duration;
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      if (isMuted) {
        videoRef.current.volume = volume;
      } else {
        videoRef.current.volume = 0;
      }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      if (newVolume === 0) {
        setIsMuted(true);
      } else {
        setIsMuted(false);
        videoRef.current.muted = false;
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // When the video source changes (e.g. clicking a related video), reload and play
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(e => {
        console.log("Autoplay blocked:", e);
        setIsPlaying(false);
      });
      setProgress(0);
      setCurrentTime("0:00");
    }
  }, [video]);

  // Hide controls after 3s of inactivity
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const resetTimer = () => {
      setShowControls(true);
      clearTimeout(timeout);
      if (isPlaying) {
        timeout = setTimeout(() => {
            if(!showSettings) setShowControls(false)
        }, 3000);
      }
    };

    const container = containerRef.current;
    container?.addEventListener("mousemove", resetTimer);
    container?.addEventListener("mouseleave", () => {
      if (isPlaying && !showSettings) setShowControls(false);
    });

    return () => {
      container?.removeEventListener("mousemove", resetTimer);
      clearTimeout(timeout);
    };
  }, [isPlaying, showSettings]);

  return (
    <section className="video-section">
      <div
        className="custom-video-container"
        ref={containerRef}
        onDoubleClick={toggleFullscreen}
      >
        <video
          className="custom-video-player"
          ref={videoRef}
          src={video}
          poster={thumbnail}
          autoPlay
          onClick={(e) => {
              if(showSettings) setShowSettings(false);
              else togglePlay(e);
          }}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          playsInline
          preload="auto"
        />

        {/* Big Center Play Button overlay (only when paused) */}
        {!isPlaying && !showSettings && (
          <div className="center-play-button" onClick={togglePlay}>
            <Play size={48} fill="white" />
          </div>
        )}

        {/* Settings Menu Popup */}
        {showSettings && (
            <div className="settings-popup">
                <div className="settings-popup-header">
                    <h4>Settings</h4>
                </div>
                <div className="settings-popup-body">
                    <div className="setting-row">
                        <span>Quality</span>
                        <select value={quality} onChange={(e) => handleQualityChange(e.target.value)}>
                            <option value="Auto">Auto</option>
                            <option value="1080p">1080p</option>
                            <option value="720p">720p</option>
                            <option value="480p">480p</option>
                        </select>
                    </div>
                    <div className="setting-row">
                        <span>Speed</span>
                        <select value={playbackSpeed} onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}>
                            <option value={0.5}>0.5x</option>
                            <option value={1}>Normal</option>
                            <option value={1.5}>1.5x</option>
                            <option value={2}>2x</option>
                        </select>
                    </div>
                    <div className="setting-row">
                        <span>Loop Video</span>
                        <label className="switch">
                            <input type="checkbox" checked={isLooping} onChange={toggleLoop} />
                            <span className="slider round"></span>
                        </label>
                    </div>
                </div>
            </div>
        )}

        <div className={`video-controls-overlay ${showControls || showSettings ? "visible" : "hidden"}`}>
          {/* Progress Bar */}
          <div className="progress-container" onClick={handleProgressClick}>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>

          <div className="controls-row">
            <div className="controls-left">
              <button onClick={togglePlay} className="control-btn">
                {isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" />}
              </button>

              <div className="volume-container">
                <button onClick={toggleMute} className="control-btn">
                  {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="volume-slider"
                />
              </div>

              <span className="time-display">
                {currentTime} / {duration}
              </span>
            </div>

            <div className="controls-right">
              <button className={`control-btn ${showSettings ? "active-btn" : ""}`} onClick={() => setShowSettings(!showSettings)}>
                <Settings size={20} />
              </button>
              <button onClick={toggleFullscreen} className="control-btn">
                {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {hashtags.length > 0 && (
        <div className="video-hashtags" style={{ marginTop: '15px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {hashtags.map((tag, idx) => (
            <a key={idx} href={`/search?q=${encodeURIComponent(tag)}`} style={{ color: '#0fb3a0', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}>
              {tag}
            </a>
          ))}
        </div>
      )}
      <h1 className="video-title" style={{ marginTop: hashtags.length > 0 ? '5px' : '15px' }}>{title}</h1>

      <div className="ai-tags">
        {summary && <span>✨ AI Summary</span>}
        {article && <span>📄 AI Article</span>}
        {transcript && <span>🎙 Transcript</span>}
      </div>
    </section>
  );
}