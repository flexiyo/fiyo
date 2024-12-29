import { createContext, useEffect, useState, useRef } from "react";

const MusicContext = createContext(null);

export const MusicProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState({});
  const [contentQuality, setContentQuality] = useState(
    localStorage.getItem("contentQuality") || "normal",
  );
  const [topTracks, setTopTracks] = useState({});
  const [loopAudio, setLoopAudio] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [previouslyPlayedTracks, setPreviouslyPlayedTracks] = useState([]);
  const [audioProgress, setAudioProgress] = useState(0);
  const [isTrackDeckModalOpen, setIsTrackDeckModalOpen] = useState(false);
  const [isNetworkConnected, setIsNetworkConnected] = useState(false);
  const audioRef = useRef(new Audio());

  useEffect(() => {
    setIsNetworkConnected(navigator.onLine);
    window.addEventListener("online", () => {
      setIsNetworkConnected(true);
    });
    window.addEventListener("offline", () => {
      setIsNetworkConnected(false);
    });
  }, []);

  useEffect(() => {
    localStorage.setItem("contentQuality", contentQuality);
  }, [contentQuality]);

  return (
    <MusicContext.Provider
      value={{
        audioRef,
        currentTrack,
        setCurrentTrack,
        topTracks,
        setTopTracks,
        loopAudio,
        setLoopAudio,
        isAudioLoading,
        setIsAudioLoading,
        isAudioPlaying,
        setIsAudioPlaying,
        previouslyPlayedTracks,
        setPreviouslyPlayedTracks,
        audioProgress,
        setAudioProgress,
        isTrackDeckModalOpen,
        setIsTrackDeckModalOpen,
        contentQuality,
        setContentQuality,
        isNetworkConnected,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export default MusicContext;
