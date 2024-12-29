import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useContext,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AppContext from "@/context/app/AppContext";
import UserContext from "@/context/user/UserContext";
import MusicContext from "@/context/music/MusicContext";
import useMusicUtility from "@/utils/music/useMusicUtility";

const TrackPlayer = () => {
  const { isMobile } = useContext(AppContext);
  const { isUserAuthenticated } = useContext(UserContext);

  const {
    currentTrack,
    audioRef,
    isAudioLoading,
    setIsAudioLoading,
    isAudioPlaying,
    setIsAudioPlaying,
    audioProgress,
    setAudioProgress,
    isTrackDeckModalOpen,
    setIsTrackDeckModalOpen,
  } = useContext(MusicContext);
  const { getTrack, handleAudioPlay, handleAudioPause, handleNextAudioTrack } =
    useMusicUtility();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMusicRoute, setIsMusicRoute] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [touchStartPosition, setTouchStartPosition] = useState(0);
  const [showTrackPlayer, setShowTrackPlayer] = useState(true);
  const [isMinimized, setIsMinimized] = useState(true);

  useEffect(() => {
    if (location.pathname === "/music") {
      setIsMusicRoute(true);
    } else {
      setIsMusicRoute(false);
    }
  }, [currentTrack.id, location.pathname, setIsMusicRoute]);

  const progressBarRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      if (!isDragging) {
        const newPosition = (audio.currentTime / audio.duration) * 100;
        setAudioProgress(newPosition);
      }
    };

    const handleEnded = () => {
      handleNextAudioTrack("auto");
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioRef, setAudioProgress, handleNextAudioTrack, isDragging]);

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
    return touchStartPosition;
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
    [audioRef, setAudioProgress, isDragging],
  );

  const handleTouchEnd = useCallback(() => {
    if (isDragging) {
      const audio = audioRef.current;
      setIsDragging(false);
      if (isAudioPlaying) {
        audio.play();
      }
    }
  }, [audioRef, isDragging, isAudioPlaying]);

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

  useEffect(() => {
    const playAudio = async () => {
      setIsAudioLoading(true);

      if (currentTrack.link) {
        try {
          const audio = audioRef.current;
          audio.src = currentTrack.link;
          await audio.play();
          setIsAudioPlaying(true);
          setIsAudioLoading(false);
        } catch (error) {
          console.error("Error playing audio:", error);
          setIsAudioPlaying(false);
          setIsAudioLoading(false);
        }
      }
    };
    playAudio();
  }, [currentTrack.link, currentTrack.id]);

  const handleShowTrackPlayer = () => {
    setShowTrackPlayer(true);
  };

  const handleTrackPlayerBoxClick = async () => {
    if (!isMusicRoute) {
      await navigate("/music");
    }
    setIsTrackDeckModalOpen(true);
  };

  const expandedPlayer = () => (
    <div
      className={`fixed flex justify-center items-center max-w-[550px] w-full transition-all duration-500 ease-in-out z-10 backdrop-blur-sm ${
        isUserAuthenticated ? "bottom-[3rem]" : "bottom-0"
      }`}
    >
      <div className="flex flex-col justify-between items-center bg-gray-900 rounded-md outline outline-1 outline-gray-800 w-[95%] mb-2 p-2">
        <div className="flex flex-row justify-between items-center w-full">
          <div
            className="track-player--image"
            onClick={handleTrackPlayerBoxClick}
          >
            <img src={currentTrack.image} alt="player-image" />
          </div>
          <div className="track-player--details">
            <span
              className="track-player--details-name"
              onClick={handleTrackPlayerBoxClick}
            >
              {currentTrack.name}
            </span>
            <span
              className="track-player--details-artists"
              onClick={handleTrackPlayerBoxClick}
            >
              {currentTrack.artists}
            </span>
          </div>
          <div className="track-player--controls">
            <span className="track-player--controls-item">
              {isAudioLoading && (
                <div className="track-player--controls-preloader"></div>
              )}
              {isAudioPlaying && !isAudioLoading ? (
                <svg
                  role="img"
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  onClick={handleAudioPause}
                >
                  <path d="M5.7 3a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7H5.7zm10 0a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7h-2.6z"></path>
                </svg>
              ) : (
                <svg
                  role="img"
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  onClick={() => {
                    handleAudioPlay();
                    if (!currentTrack.link) {
                      getTrack(currentTrack.id);
                    }
                  }}
                >
                  <path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path>
                </svg>
              )}
            </span>
            <span
              className="track-player--controls-item"
              onClick={handleNextAudioTrack}
            >
              <svg role="img" aria-hidden="true" viewBox="0 0 24 24">
                <path d="M17.7 3a.7.7 0 0 0-.7.7v6.805L5.05 3.606A.7.7 0 0 0 4 4.212v15.576a.7.7 0 0 0 1.05.606L17 13.495V20.3a.7.7 0 0 0 .7.7h1.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7h-1.6z"></path>
              </svg>
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const minimalPlayer = () => (
    <div
      className={`fixed flex justify-center items-center max-w-36 w-full transition-all duration-500 ease-in-out z-10 backdrop-blur-sm ${
        isUserAuthenticated ? "bottom-[3rem]" : "bottom-0"
      }`}
    >
      <div className="flex flex-row justify-between items-center bg-gray-900 rounded-md outline outline-1 outline-gray-800 w-[85%] mb-2 p-2">
        <div className="track-player--image">
          <img
            src={currentTrack.image}
            alt="Track image"
            className="w-12 h-12 rounded-md opacity-60"
          />
          {isAudioPlaying ? (
            <button
              onClick={handleAudioPause}
              className="bg-transparent ml-3 fixed"
              aria-label="Pause"
            >
              <svg
                role="img"
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="w-6 h-6"
                fill="#ffffff"
              >
                <path d="M5.7 3a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7H5.7zm10 0a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7h-2.6z"></path>
              </svg>
            </button>
          ) : (
            <button
              onClick={() => {
                handleAudioPlay();
                if (!currentTrack.link) {
                  getTrack(currentTrack.id);
                }
              }}
              className="bg-transparent ml-3 fixed"
              aria-label="Play"
            >
              <svg
                role="img"
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="w-6 h-6"
                fill="#ffffff"
              >
                <path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path>
              </svg>
            </button>
          )}
        </div>
        <button
          onClick={handleNextAudioTrack}
          className="bg-transparent mx-2"
          aria-label="Next Track"
        >
          <svg
            role="img"
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="w-6 h-6"
            fill="#ffffff"
          >
            <path d="M17.7 3a.7.7 0 0 0-.7.7v6.805L5.05 3.606A.7.7 0 0 0 4 4.212v15.576a.7.7 0 0 0 1.05.606L17 13.495V20.3a.7.7 0 0 0 .7.7h1.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7h-1.6z"></path>
          </svg>
        </button>
      </div>
    </div>
  );

  return (
    (showTrackPlayer || isMusicRoute) &&
    currentTrack.id &&
    !isTrackDeckModalOpen &&
    isMobile &&
    (isMinimized && !isMusicRoute ? minimalPlayer() : expandedPlayer())
  );
};

export default TrackPlayer;
