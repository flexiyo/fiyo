import React, { useState, useEffect, useContext, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { Menu, MenuItem } from "@mui/material";
import axios from "axios";
import Modal from "react-modal";
import Headroom from "react-headroom";
import CustomTopNavbar from "@/layout/items/CustomTopNavbar";
import TrackItem from "@/components/music/TrackItem";
import TrackDeck from "@/components/music/TrackDeck";
import AppContext from "@/context/app/AppContext";
import MusicContext from "@/context/music/MusicContext";
import useMusicUtility from "@/utils/music/useMusicUtility";
import jioSaavnLogo from "@/assets/media/img/logo/jioSaavn.svg";
import WebSpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

Modal.setAppElement("#root");
const Music = ({ connectedToInternet }) => {
  const {
    audioRef,
    topTracks,
    setTopTracks,
    currentTrack,
    isAudioPlaying,
    setIsAudioPlaying,
    setCurrentTrack,
    setLoopAudio,
    isTrackDeckModalOpen,
    setIsTrackDeckModalOpen,
    contentQuality,
    setContentQuality,
  } = useContext(MusicContext);

  document.title = currentTrack.id
    ? `${currentTrack.name} - Flexiyo Music`
    : "Flexiyo Music";
  const location = useLocation();

  const { getTrack, getTrackData, handleAudioPlay, handleAudioPause } =
    useMusicUtility();

  const fiyosaavnApiBaseUri = import.meta.env.VITE_FIYOSAAVN_API_BASE_URI;

  const { isMobile } = useContext(AppContext);
  const [searchText, setSearchText] = useState("");
  const [printError, setPrintError] = useState("");
  const [apiError, setApiError] = useState(false);
  const [apiLoading, setApiLoading] = useState(false);
  const [tracks, setTracks] = useState([]);
  const [isDownloadLoading, setIsDownloadLoading] = useState(false);
  const [modalDownloadData, setModalDownloadData] = useState("");
  const [isMusicSettingsModalOpen, setIsMusicSettingsModalOpen] =
    useState(false);
  const [isDownlodModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isSpeechModalOpen, setIsSpeechModalOpen] = useState(false);
  const [speechListening, setSpeechListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState("");
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);

  const searchTracks = useCallback(
    async (searchTerm) => {
      try {
        setApiLoading(true);
        const { data: response } = await axios.get(
          `${fiyosaavnApiBaseUri}/search/songs`,
          {
            params: {
              query: searchTerm,
              page: 1,
              limit: 30,
            },
          },
        );
        setTracks(response.data.results);
        setApiError(false);
        setApiLoading(false);
        return response.data.results;
      } catch (error) {
        setApiError(true);
        setPrintError(`${error.code} : ${error.message}`);
        setApiLoading(false);
      }
    },
    [fiyosaavnApiBaseUri],
  );

  const openDb = async () => {
    const request = indexedDB.open("MusicCacheDB", 1);
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = (e) => reject(e);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains("tracks")) {
          db.createObjectStore("tracks", { keyPath: "id" });
        }
      };
    });
  };

  const getTopTracks = useCallback(async () => {
    setApiLoading(true);

    if (!connectedToInternet) {
      try {
        const db = await openDb();
        const transaction = db.transaction("tracks", "readonly");
        const store = transaction.objectStore("tracks");
        const cachedTracks = await new Promise((resolve, reject) => {
          const request = store.getAll();
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });

        if (cachedTracks.length) {
          setTopTracks(cachedTracks);
          setTracks(cachedTracks);
        } else {
          console.warn("No tracks found in IndexedDB.");
        }
      } catch (err) {
        console.error("Error fetching tracks from IndexedDB:", err);
      } finally {
        setApiLoading(false);
      }
      return;
    }
    try {
      let tracks;
      if (topTracks.length > 0) {
        tracks = topTracks;
      } else {
        const { data: response } = await axios.get(
          `${fiyosaavnApiBaseUri}/playlists?id=1134543272&limit=40`,
        );
        tracks = response.data.songs.sort(() => Math.random() - 0.5);
      }
      setTopTracks(tracks);
      setTracks(tracks);
    } catch (error) {
      console.error("Error fetching top tracks from API:", error);
    } finally {
      setApiLoading(false);
    }
  }, [fiyosaavnApiBaseUri, connectedToInternet]);

  const downloadTrack = async (modalDownloadData) => {
    try {
      setDownloadProgress(0);

      const response = await axios.get(modalDownloadData.fileUrl, {
        responseType: "blob",
        onDownloadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded / progressEvent.total) * 100,
          );
          setDownloadProgress(progress);
        },
      });

      const audioBlob = response.data;
      const finalBlob = new Blob([audioBlob], { type: "audio/mpeg" });

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(finalBlob);
      link.download = modalDownloadData.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloadProgress(100);
    } catch (error) {
      console.error(`Error downloading track: ${error.message}`);
      setDownloadProgress(0);
    } finally {
      setIsDownloadModalOpen(false);
      setDownloadProgress(0);
    }
  };

  const playTrack = async (trackId) => {
    if (isAudioPlaying) return;
    try {
      await getTrack(trackId);
      setIsAudioPlaying(true);
    } catch (error) {
      console.error("Error playing track:", error);
      setIsAudioPlaying(false);
    }
  };

  useEffect(() => {
    const fetchTrackData = async () => {
      const queryParams = new URLSearchParams(location.search);
      const trackParam = queryParams.get("track");

      if (trackParam) {
        try {
          playTrack(trackParam);
          setIsTrackDeckModalOpen(true);
        } catch (error) {
          console.error("Error fetching track data:", error);
        }
      }
    };

    fetchTrackData();
  }, [location.search, setCurrentTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    document.addEventListener("keydown", (event) => {
      if (event.target.tagName === "INPUT") return;

      event.preventDefault();
      if (event.code === "Space") {
        if (audio.paused) {
          handleAudioPlay();
        } else {
          handleAudioPause();
        }
      }
    });
  }, [handleAudioPlay, handleAudioPause]);

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchText(value);
    if (value.trim() !== "") {
      searchTracks(value);
    } else {
      getTopTracks();
    }
  };

  const openDownloadModal = async (trackId) => {
    try {
      setIsDownloadLoading(true);
      let trackData;
      if (currentTrack.id !== trackId) {
        trackData = await getTrackData(trackId);
      } else {
        trackData = currentTrack;
      }
      setModalDownloadData({
        fileUrl: trackData.link,
        fileName: `${trackData.name} - ${trackData.artists
          .split(",")[0]
          .trim()}.mp4`,
        fileImage: trackData.image,
      });
      setIsDownloadModalOpen(true);
      setApiError(false);
    } catch (error) {
      setApiError(true);
      setPrintError(`${error.code} : ${error.message}`);
    } finally {
      setIsDownloadLoading(false);
    }
  };

  const closeDownloadModal = () => {
    setIsDownloadModalOpen(false);
  };

  const { transcript, browserSupportsSpeechRecognition } =
    useSpeechRecognition();

  const openSpeechModal = () => {
    setIsSpeechModalOpen(true);
    startSpeechRecognition();
    handleAudioPause();
  };

  const closeSpeechModal = useCallback(() => {
    setIsSpeechModalOpen(false);
    stopSpeechRecognition();
  }, []);

  useEffect(() => {
    if (transcript) {
      setSpeechTranscript(transcript);
    }
  }, [transcript]);

  const startSpeechRecognition = async () => {
    setSpeechListening(true);
    if (!browserSupportsSpeechRecognition) setSpeechListening(false);
    try {
      WebSpeechRecognition.startListening({
        language: "en-IN",
      });
      setSpeechListening(true);
    } catch (error) {
      console.error("Error starting web speech recognition:", error);
    }
    setTimeout(() => {
      closeSpeechModal();
    }, 10000);
  };

  const stopSpeechRecognition = async () => {
    try {
      setSpeechListening(false);
      await WebSpeechRecognition.stopListening();
    } catch (error) {
      console.error("Error stopping speech recognition:", error);
    }
  };

  const speechModalWaves = document.querySelectorAll(
    ".speechWaveBox1, .speechWaveBox2, .speechWaveBox3, .speechWaveBox4, .speechWaveBox5",
  );
  if (speechListening) {
    speechModalWaves.forEach((element) => {
      element.style.animationPlayState = "running";
    });
  } else {
    speechModalWaves.forEach((element) => {
      element.style.animationPlayState = "paused";
    });
  }

  useEffect(() => {
    if (!speechListening && speechTranscript) {
      searchTracks(speechTranscript);
      setSearchText(speechTranscript);
      setSpeechTranscript("");
      const searchTts = new Audio(
        `https://www.google.com/speech-api/v1/synthesize?text=${encodeURIComponent(
          speechTranscript,
        )}&enc=mpeg&lang=hi-in&speed=.5&client=lr-language-tts&use_google_only_voices=1`,
      );
      searchTts.play();
      closeSpeechModal();
    }
  }, [speechListening, speechTranscript, closeSpeechModal, searchTracks]);

  const openMusicSettings = async () => {
    setIsMusicSettingsModalOpen(true);
  };

  const closeMusicSettingsModal = async () => {
    setIsMusicSettingsModalOpen(false);
  };

  const customModalStyles = {
    content: {
      top: "45%",
      left: "50%",
      maxWidth: "600px",
      width: "90%",
      transform: "translate(-50%, -50%)",
      border: "0",
      borderRadius: "1rem",
      height: "20rem",
      fontFamily: "SpotifyMedium",
      color: "var(--fm-primary-link)",
      backgroundColor: "var(--fm-secondary-bg-color)",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      padding: "2rem",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.4)",
      zIndex: "1",
    },
  };

  const trackDeckModalStyles = {
    content: {
      inset: "0",
      padding: "0",
      zIndex: "1",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.4)",
      zIndex: "1",
    },
  };

  const renderTracks = () => {
    return tracks.map((track, index) => (
      <TrackItem
        key={index}
        index={index}
        track={track}
        onGetTrack={getTrack}
        onOpenDownloadModal={(trackId) => openDownloadModal(trackId)}
        isDownloadLoading={isDownloadLoading}
      />
    ));
  };

  return (
    <section id="music">
      <div className="music-container">
        {isMobile ? (
          <Headroom>
            <CustomTopNavbar
              navbarCover={jioSaavnLogo}
              navbarTitle="Music"
              navbarSecondIcon="fa fa-gear"
              onSecondIconClick={openMusicSettings}
            />
          </Headroom>
        ) : null}
        <div className="flex justify-center items-center">
          <div className="flex items-center w-full bg-gray-900 rounded-lg px-3 py-2 my-3 mx-3">
            <input
              type="text"
              placeholder="Search for tracks..."
              value={searchText}
              onChange={handleSearchChange}
              className="flex-grow bg-transparent outline-none text-gray-100 placeholder-gray-500"
            />
            <button>
              <i
                className="text-gray-200 mx-3 py-1 px-2 rounded fa fa-microphone hover:bg-slate-700"
                onClick={openSpeechModal}
              ></i>
            </button>
            <i
              className={`text-gray-500 ${
                apiLoading ? "fa fa-ellipsis" : "fa fa-search"
              }`}
            ></i>
          </div>
        </div>
        <div
          className={`print-error alert alert-danger ${
            apiError ? "" : "hidden"
          }`}
        >
          {printError}
        </div>
        <div className="render-tracks">{renderTracks()}</div>
        <Modal
          isOpen={isMusicSettingsModalOpen}
          onRequestClose={closeMusicSettingsModal}
          contentLabel="Music Settings Modal"
          style={customModalStyles}
        >
          <h2 className="text-white text-lg font-bold">Settings</h2>
          <hr className="mt-2 text-gray-500" />
          <div className="flex justify-between py-3">
            <h2 className="font-semibold text-gray-400">Content Quality</h2>
            <div className="text-white">
              <select
                className="bg-gray-800 p-2 rounded"
                defaultValue={contentQuality}
                onChange={(e) => setContentQuality(e.target.value)}
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
        </Modal>
        <Modal
          isOpen={isDownlodModalOpen}
          onRequestClose={closeDownloadModal}
          contentLabel="Download Modal"
          style={customModalStyles}
        >
          <h4>Do you want to download?</h4>
          <div className="flex my-4 items-center bg-gray-800 p-2 rounded">
            <img
              src={modalDownloadData.fileImage}
              className="w-14 h-14 rounded"
              alt="File Image"
            />
            <p className="text-[--fm-primary-text] mx-2">
              {modalDownloadData.fileName}
            </p>
          </div>
          <p className="mb-3">Download in progress: {downloadProgress}%</p>
          <progress value={downloadProgress} max="100"></progress>
          <button
            className="fm-primary-btn-inverse mt-3"
            onClick={closeDownloadModal}
            style={{
              position: "absolute",
              bottom: "2rem",
              left: "2rem",
              padding: "1rem",
              width: "8rem",
              borderRadius: ".5rem",
            }}
          >
            Cancel
          </button>
          <button
            className="fm-primary-btn"
            onClick={() => downloadTrack(modalDownloadData)}
            style={{
              position: "absolute",
              bottom: "2rem",
              right: "2rem",
              padding: "1rem",
              width: "8rem",
              borderRadius: ".5rem",
            }}
          >
            Download
          </button>
        </Modal>
        <Modal
          isOpen={isSpeechModalOpen}
          onRequestClose={closeSpeechModal}
          contentLabel="Speech Recognition Modal"
          style={customModalStyles}
        >
          <div className="speechWave">
            <div
              className="speechWaveBoxContainer"
              style={{
                outline:
                  !speechTranscript && !speechListening
                    ? ".5rem solid red"
                    : "0",
              }}
              onClick={startSpeechRecognition}
            >
              <div className="speechWaveBox speechWaveBox1"></div>
              <div className="speechWaveBox speechWaveBox2"></div>
              <div className="speechWaveBox speechWaveBox3"></div>
              <div className="speechWaveBox speechWaveBox4"></div>
              <div className="speechWaveBox speechWaveBox5"></div>
            </div>
          </div>
          <br />
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              color: "var(--fm-primary-text)",
              textAlign: "center",
              fontFamily: "SpotifyMedium",
              fontSize: "1.3rem",
            }}
          >
            {!browserSupportsSpeechRecognition
              ? "Your browser doesn't support this feature."
              : !speechTranscript && !speechListening
              ? "Didn't Catch, Speak again"
              : !speechTranscript
              ? `Say "${topTracks[0] && topTracks[0].name}"`
              : speechTranscript}
            <br />
            <br />
            {!speechTranscript && !speechListening ? (
              <button
                className="fm-primary-btn-outline"
                style={{
                  padding: ".5rem",
                  width: "8rem",
                  borderRadius: ".5rem",
                  fontSize: ".9rem",
                }}
                onClick={startSpeechRecognition}
              >
                Try Again
              </button>
            ) : null}
          </div>
        </Modal>
      </div>
      {!isMobile ? (
        currentTrack.id ? (
          <TrackDeck />
        ) : (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              height: "100vh",
              width: "100%",
            }}
          >
            <svg
              className="music-icon"
              title="Play Music"
              width="35px"
              height="35px"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                width: "7rem",
                height: "7rem",
                padding: "1.5rem",
                border: ".2rem solid var(--fm-primary-text)",
                borderRadius: "50%",
              }}
            >
              <path
                d="M29 6V35"
                fill="#fff"
                stroke="#ffffff"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M15 36.04C15 33.2565 17.2565 31 20.04 31H29V36.96C29 39.7435 26.7435 42 23.96 42H20.04C17.2565 42 15 39.7435 15 36.96V36.04Z"
                fill="none"
                stroke="#ffffff"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              <path
                fill="none"
                fillRule="evenodd"
                clipRule="evenodd"
                d="M29 14.0664L41.8834 17.1215V9.01339L29 6V14.0664Z"
                stroke="#ffffff"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6 8H20"
                fill="#fff"
                stroke="#ffffff"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6 16H20"
                fill="#fff"
                stroke="#ffffff"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6 24H16"
                fill="#fff"
                stroke="#ffffff"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <br />
            <p className="text-[--fm-primary-text-muted] mb-3">
              Play a track to feel the vibe.
            </p>
            <button
              className="p-2 text-xs border-none rounded bg-blue-600"
              onClick={() => getTrack(tracks[0].id)}
            >
              Play the first track
            </button>
          </div>
        )
      ) : (
        <Modal
          className="track-deck--modal"
          style={trackDeckModalStyles}
          isOpen={isTrackDeckModalOpen}
          onRequestClose={() => setIsTrackDeckModalOpen(false)}
        >
          <div className="track-deck--modal-header">
            <i
              className="fal fa-times"
              onClick={() => setIsTrackDeckModalOpen(false)}
            />
            <i
              className="fal fa-share-alt"
              onClick={(event) => setIsShareMenuOpen(event.currentTarget)}
            />
            <Menu
              className="track-deck--modal-menu"
              anchorEl={isShareMenuOpen}
              open={isShareMenuOpen}
              onClose={() => setIsShareMenuOpen(false)}
            >
              <MenuItem
                onClick={() => {
                  setIsShareMenuOpen(false);
                  navigator.clipboard.writeText(
                    `https://flexiyo.web.app/music?track=${currentTrack.id}`,
                  );
                }}
              >
                Copy Link
              </MenuItem>
            </Menu>
          </div>
          <TrackDeck />
        </Modal>
      )}
    </section>
  );
};

export default Music;
