// 常驻音频播放器（模拟进度，无真实音频文件）。切页不中断。
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export interface Track {
  id: string; // 通常是 nodeId / fragmentId
  title: string;
  subtitle?: string;
  cover?: string;
  duration: number; // 秒
}

interface PlayerValue {
  track: Track | null;
  playing: boolean;
  progress: number; // 0..duration 秒
  play: (t: Track) => void;
  toggle: (t?: Track) => void;
  seek: (sec: number) => void;
  stop: () => void;
  isCurrent: (id: string) => boolean;
}

const PlayerContext = createContext<PlayerValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [track, setTrack] = useState<Track | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (playing && track) {
      timer.current = window.setInterval(() => {
        setProgress((p) => {
          if (p + 0.5 >= track.duration) {
            setPlaying(false);
            return track.duration;
          }
          return p + 0.5;
        });
      }, 500);
    }
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [playing, track]);

  const play = useCallback((t: Track) => {
    setTrack(t);
    setProgress(0);
    setPlaying(true);
  }, []);

  const toggle = useCallback(
    (t?: Track) => {
      if (t && (!track || track.id !== t.id)) {
        play(t);
        return;
      }
      if (!track && !t) return;
      setPlaying((p) => !p);
    },
    [track, play],
  );

  const seek = useCallback((sec: number) => setProgress(sec), []);
  const stop = useCallback(() => {
    setPlaying(false);
    setTrack(null);
    setProgress(0);
  }, []);
  const isCurrent = useCallback(
    (id: string) => track?.id === id && playing,
    [track, playing],
  );

  const value = useMemo<PlayerValue>(
    () => ({ track, playing, progress, play, toggle, seek, stop, isCurrent }),
    [track, playing, progress, play, toggle, seek, stop, isCurrent],
  );

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
}

export function usePlayer(): PlayerValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}

export function fmtTime(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
