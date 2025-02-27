import { useContext, useEffect, useState, useCallback, useRef } from "react";
import AppContext from "@/context/app/AppContext";
import MusicContext from "@/context/music/MusicContext";
import useMusicUtility from "@/utils/music/useMusicUtility";
import { openDB } from "idb";

const TrackDeck = () => {
  const {
    getTrack,
    getTrackLyrics,
    handleAudioPlay,
    handleAudioPause,
    handleNextAudioTrack,
  } = useMusicUtility();
  const {
    currentTrack,
    audioRef,
    loopAudio,
    setLoopAudio,
    isAudioPlaying,
    isAudioLoading,
    audioProgress,
    setAudioProgress,
    setCurrentTrack,
  } = useContext(MusicContext);

  const lyricsWrapperRef = useRef(null);
  const { isMobile } = useContext(AppContext);
  const [isDragging, setIsDragging] = useState(false);
  const [touchStartPosition, setTouchStartPosition] = useState(0);
  const [isLyricsCopied, setIsLyricsCopied] = useState(false);

  const openMusicCacheDb = async () => {
    return openDB("MusicCacheDB", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("tracks")) {
          const store = db.createObjectStore("tracks", { keyPath: "id" });
          store.createIndex("by_track_id", "id");
        }
      },
    });
  };

  const handleCopyLyrics = () => {
    navigator.clipboard
      .writeText(lyricsWrapperRef.current.innerText)
      .then(() => {
        setIsLyricsCopied(true);
        setTimeout(() => {
          setIsLyricsCopied(false);
        }, 2000);
      });
  };

  const cacheTrackData = async (trackData) => {
    try {
      const db = await openMusicCacheDb();
      await db.put("tracks", {
        id: trackData.id,
        name: trackData.name,
        album: trackData.album,
        artists: trackData.artists,
        image: trackData.image,
        link: trackData.link,
        lyrics: trackData.lyrics,
      });
    } catch (error) {
      console.error("Error in cacheTrackData:", error);
    }
  };

  useEffect(() => {
    const fetchLyricsAndCache = async () => {
      if (currentTrack && currentTrack.id) {
        const db = await openMusicCacheDb();
        const cachedTrackData = await db.get("tracks", currentTrack.id);
        if (cachedTrackData && cachedTrackData.lyrics) {
          lyricsWrapperRef.current.innerHTML = cachedTrackData.lyrics;
          setCurrentTrack((prevTrack) => ({
            ...prevTrack,
            lyrics: cachedTrackData.lyrics,
          }));
          return;
        }
        try {
          const lyrics = await getTrackLyrics(currentTrack);
          lyricsWrapperRef.current.innerHTML = lyrics
            ? lyrics?.replace(/<br>/g, "<br/>")
            : "Couldn't load lyrics for this song.";
          setCurrentTrack((prevTrack) => ({
            ...prevTrack,
            lyrics: lyrics,
          }));
          await cacheTrackData({ ...currentTrack, lyrics: lyrics });
        } catch (error) {
          console.error("Error fetching and setting lyrics:", error);
          lyricsWrapperRef.current.innerHTML =
            "Couldn't load lyrics for this song.";
          setCurrentTrack((prevTrack) => ({
            ...prevTrack,
            lyrics: null,
          }));
        }
      } else if (currentTrack && currentTrack.lyrics) {
        lyricsWrapperRef.current.innerHTML = currentTrack.lyrics?.replace(
          /<br>/g,
          "<br/>",
        );
      } else {
        lyricsWrapperRef.current.innerHTML =
          "Couldn't load lyrics for this song.";
      }
    };

    fetchLyricsAndCache();
  }, [currentTrack?.id]);

  const progressBarRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      if (!isDragging) {
        const newPosition = (audio.currentTime / audio.duration) * 100;
        setAudioProgress(newPosition);
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [isDragging, setAudioProgress]);

  const handleProgressBarClick = (e) => {
    const audio = audioRef.current;
    const progressBar = progressBarRef.current;
    const newPosition = (e.nativeEvent.offsetX / progressBar.clientWidth) * 100;
    setAudioProgress(newPosition);
    audio.currentTime = (newPosition / 100) * audio.duration;
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setTouchStartPosition(e.touches[0].clientX);
  };

  const handleTouchMove = useCallback(
    (e) => {
      if (isDragging) {
        const audio = audioRef.current;
        const progressBar = progressBarRef.current;
        const touchPosition = e.touches[0].clientX;
        const progressBarRect = progressBar.getBoundingClientRect();
        const newPosition =
          ((touchPosition - progressBarRect.left) / progressBarRect.width) *
          100;

        const clampedPosition = Math.max(0, Math.min(100, newPosition));

        setAudioProgress(clampedPosition);
        audio.currentTime = (clampedPosition / 100) * audio.duration;

        if (
          touchPosition < progressBarRect.left ||
          touchPosition > progressBarRect.right
        ) {
          setIsDragging(false);
        }
      }
    },
    [isDragging, setAudioProgress],
  );

  const handleTouchEnd = useCallback(() => {
    if (isDragging) {
      const audio = audioRef.current;
      setIsDragging(false);
      if (isAudioPlaying) {
        audio.play();
      }
    }
  }, [isDragging, isAudioPlaying, audioRef]);

  useEffect(() => {
    const handleGlobalTouchMove = (e) => {
      handleTouchMove(e);
    };
    const handleGlobalTouchEnd = () => {
      handleTouchEnd();
    };

    document.addEventListener("touchmove", handleGlobalTouchMove, {
      passive: false,
    });
    document.addEventListener("touchend", handleGlobalTouchEnd);

    return () => {
      document.removeEventListener("touchmove", handleGlobalTouchMove);
      document.removeEventListener("touchend", handleGlobalTouchEnd);
    };
  }, [handleTouchMove, handleTouchEnd]);

  return (
    <div className="track-deck">
      <div className="track-deck--cover">
        <img
          src={`${currentTrack?.image?.replace(/(50x50|150x150)/, "500x500")}`}
          alt="player-image"
        />
      </div>
      <div className="track-deck--details">
        <label className="track-deck--details-name">{currentTrack?.name}</label>
        <label className="track-deck--details-artists">
          {currentTrack?.artists}
        </label>
      </div>
      <div
        ref={progressBarRef}
        onClick={handleProgressBarClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          width: "90%",
          height: "4px",
          backgroundColor: "#4e4e4e",
          borderRadius: "5px",
          margin: "0 0",
          position: "relative",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            height: "4px",
            borderRadius: "4px",
            backgroundColor: "#fff",
            width: `${audioProgress}%`,
          }}
        ></div>
        <div
          style={{
            position: "absolute",
            top: "-3px",
            left: `${audioProgress}%`,
            transform: "translateX(-50%)",
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            backgroundColor: "#fff",
            boxShadow: "0 0 5px rgba(0, 0, 0, 0.3)",
            cursor: "pointer",
          }}
        ></div>
      </div>
      <div className="track-deck--controls">
        <span
          className="track-deck--controls-item"
          style={{ width: "2rem", height: "2rem" }}
          onClick={() => (loopAudio ? setLoopAudio(false) : setLoopAudio(true))}
        >
          <i
            className="fas fa-repeat"
            style={{
              fontSize: "1.5rem",
              color: loopAudio ? "#1ED760" : "#ffffff",
            }}
          />
        </span>
        {isAudioPlaying && !isAudioLoading ? (
          <span
            className="track-deck--controls-item"
            style={{
              width: isMobile ? "4rem" : "3rem",
              height: isMobile ? "4rem" : "3rem",
              backgroundColor: "#ffffff",
              padding: isMobile ? "1.2rem" : ".8rem",
            }}
            onClick={handleAudioPause}
          >
            <svg role="img" aria-hidden="true" viewBox="0 0 24 24">
              <path d="M5.7 3a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7H5.7zm10 0a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7h-2.6z"></path>
            </svg>
          </span>
        ) : (
          <span
            className="track-deck--controls-item"
            style={{
              width: isMobile ? "4rem" : "3rem",
              height: isMobile ? "4rem" : "3rem",
              backgroundColor: "#ffffff",
              padding: isMobile ? "1.2rem" : ".8rem",
            }}
            onClick={() => {
              if (!currentTrack.link) {
                getTrack(currentTrack.id);
              } else {
                handleAudioPlay();
              }
            }}
          >
            <svg role="img" aria-hidden="true" viewBox="0 0 24 24">
              <path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path>
            </svg>
          </span>
        )}
        <span
          className="track-deck--controls-item"
          onClick={handleNextAudioTrack}
        >
          <svg role="img" aria-hidden="true" viewBox="0 0 16 16" fill="#ffffff">
            <path d="M12.7 1a.7.7 0 0 0-.7.7v5.15L2.05 1.107A.7.7 0 0 0 1 1.712v12.575a.7.7 0 0 0 1.05.607L12 9.149V14.3a.7.7 0 0 0 .7.7h1.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-1.6z"></path>
          </svg>
        </span>
      </div>
      <div className="track-deck--lyrics">
        <div className="track-deck--lyrics-header">
          <label>Lyrics</label>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            onClick={handleCopyLyrics}
          >
            {isLyricsCopied ? (
              <path stroke="#fff" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            ) : (
              <path
                stroke="#fff"
                strokeWidth="2"
                d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2m-6 4h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2"
              ></path>
            )}
          </svg>
        </div>
        <div
          className="track-deck--lyrics-wrapper"
          ref={lyricsWrapperRef}
          style={{ whiteSpace: "pre-wrap" }}
        ></div>
      </div>
    </div>
  );
};

export default TrackDeck;
