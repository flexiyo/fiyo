import { useContext, useEffect, useCallback } from "react";
import axios from "axios";
import MusicContext from "@/context/music/MusicContext";
import { MediaSession } from "@jofr/capacitor-media-session";
import { openDB } from "idb";

const useMusicUtility = () => {
  const {
    audioRef,
    currentTrack,
    setCurrentTrack,
    loopAudio,
    setIsAudioLoading,
    contentQuality,
    setIsAudioPlaying,
    previouslyPlayedTracks,
    setPreviouslyPlayedTracks,
  } = useContext(MusicContext);

  const fiyosaavnApiBaseUri = import.meta.env.VITE_FIYOSAAVN_API_BASE_URI;
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

  const getTrackData = async (trackId) => {
    try {
      const { data } = await axios.get(
        `${fiyosaavnApiBaseUri}/songs/${trackId}`,
      );
      const resultData = data.data[0];

      const trackData = {
        id: resultData.id,
        name: resultData.name,
        album: resultData.album.name,
        artists: resultData.artists.primary
          .map((artist) => artist.name)
          .join(", "),
        image:
          contentQuality === "low"
            ? resultData.image[0].url
            : contentQuality === "normal"
            ? resultData.image[1].url
            : contentQuality === "high"
            ? resultData.image[2].url
            : resultData.image[1].url,
        link:
          contentQuality === "low"
            ? resultData.downloadUrl[1].url
            : contentQuality === "normal"
            ? resultData.downloadUrl[3].url
            : contentQuality === "high"
            ? resultData.downloadUrl[4].url
            : resultData.downloadUrl[3].url,
        lyrics: null,
      };

      return trackData;
    } catch (error) {
      console.error("Error fetching track data:", error);
      return null;
    }
  };

  const getTrack = async (trackId) => {
    setIsAudioLoading(true);
    const db = await openMusicCacheDb();
    const cachedTrackData = await db.get("tracks", trackId);
    if (cachedTrackData) {
      setCurrentTrack(cachedTrackData);
      setIsAudioLoading(false);
      setPreviouslyPlayedTracks((prevTracks) => [...prevTracks, trackId]);
      return;
    }
    const trackData = await getTrackData(trackId);
    setCurrentTrack({ ...trackData, link: trackData.link });
    cacheTrackData(trackData);
    setIsAudioLoading(false);
    setPreviouslyPlayedTracks((prevTracks) => [...prevTracks, trackId]);
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
        lyrics: null,
      });
    } catch (error) {
      console.error("Error in cacheTrackData:", error);
    }
  };

  const getTrackLyrics = async (trackData) => {
    try {
      let data;
      try {
        const lyristResponse = await axios.get(
          `https://lyrist.vercel.app/api/${trackData.name}/${trackData.artists
            ?.split(",")[0]
            .trim()}`,
        );

        if (lyristResponse && lyristResponse.data.lyrics) {
          data = lyristResponse.data;
        } else {
          const saavnResponse = await axios.get(
            `${fiyosaavnApiBaseUri}/songs/${trackData.id}/lyrics`,
          );
          data = saavnResponse.data.data;
        }
      } catch (error) {
        if (error.code === "ERR_NETWORK") {
          const saavnResponse = await axios.get(
            `${fiyosaavnApiBaseUri}/songs/${trackData.id}/lyrics`,
          );
          data = saavnResponse.data.data;
        } else {
          throw new Error(`Error in getTrackLyrics: ${error}`);
        }
      }

      setCurrentTrack((prevTrack) => ({
        ...prevTrack,
        lyrics: data.lyrics || null,
      }));

      return data.lyrics || null;
    } catch (error) {
      setCurrentTrack((prevTrack) => ({
        ...prevTrack,
        lyrics: null,
      }));
      throw new Error(`Error in getTrackLyrics: ${error}`);
    }
  };

  const deleteCachedAudioData = async () => {
    if (!navigator.serviceWorker?.controller) {
      return;
    }
    navigator.serviceWorker.controller.postMessage({ type: "CLEAR_CACHE" });
    alert("All Cached Audio Data deleted successfully");
  };

  const handleAudioPlay = useCallback(() => {
    const audio = audioRef.current;
    audio.play();
    setIsAudioPlaying(true);
  }, []);

  const handleAudioPause = useCallback(() => {
    const audio = audioRef.current;
    audio.pause();
    setIsAudioPlaying(false);
  }, []);

  const handleNextAudioTrack = useCallback(
    async (callType) => {
      const audio = audioRef.current;

      try {
        if (loopAudio && callType === "auto") {
          audio.currentTime = 0;
          audio.play();
          setIsAudioPlaying(true);
          await getTrack(currentTrack.id);
        } else if ((!loopAudio && callType === "auto") || callType !== "auto") {
          const trackIdToFetch = await getSuggestedTrackId();
          audio.currentTime = 0;
          audio.pause();
          setIsAudioPlaying(false);
          await getTrack(trackIdToFetch);
        }
      } catch (error) {
        console.error("Error handling next track:", error);
      }
    },
    [getTrack, loopAudio, previouslyPlayedTracks],
  );

  const getSuggestedTrackId = async () => {
    try {
      if (!navigator.onLine) {
        const db = await openMusicCacheDb();
        const cachedTracks = await db.getAll("tracks");

        if (cachedTracks.length === 0) {
          throw new Error("No cached tracks available");
        }

        return cachedTracks[Math.floor(Math.random() * cachedTracks.length)].id;
      }
      const { data } = await axios.get(
        `${fiyosaavnApiBaseUri}/songs/${currentTrack.id}/suggestions`,
        { params: { limit: 10 } },
      );

      let suggestedTrackId;
      do {
        suggestedTrackId = data.data[Math.floor(Math.random() * 10)].id;
      } while (previouslyPlayedTracks.includes(suggestedTrackId));

      return suggestedTrackId;
    } catch (error) {
      throw new Error(`Error in getSuggestedTrackId: ${error}`);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;

    if (currentTrack.id && audio) {
      const artworkUrl = currentTrack.image.replace(
        /(50x50|150x150)/,
        "500x500",
      );

      const updatePlaybackState = () => {
        const playbackState = audio.paused ? "paused" : "playing";
        MediaSession.setPlaybackState(playbackState);
      };

      MediaSession.setMetadata({
        title: currentTrack.name,
        artist: currentTrack.artists,
        album: currentTrack.album,
        artwork: [
          {
            src: artworkUrl,
            sizes: "500x500",
            type: "image/jpg",
          },
        ],
      });

      audio.addEventListener("play", updatePlaybackState);
      audio.addEventListener("pause", updatePlaybackState);

      MediaSession.setActionHandler({ action: "play" }, async () => {
        await audio.play();
        handleAudioPlay();
      });

      MediaSession.setActionHandler({ action: "pause" }, () => {
        audio.pause();
        handleAudioPause();
      });

      MediaSession.setActionHandler({ action: "nexttrack" }, () => {
        handleNextAudioTrack("manual");
      });

      return () => {
        audio.removeEventListener("pause", updatePlaybackState);
      };
    }
  }, [currentTrack, audioRef]);

  return {
    getTrack,
    getTrackLyrics,
    getTrackData,
    deleteCachedAudioData,
    handleAudioPlay,
    handleAudioPause,
    handleNextAudioTrack,
  };
};

export default useMusicUtility;
