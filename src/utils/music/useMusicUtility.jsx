import { useContext, useEffect, useCallback } from "react";
import axios from "axios";
import MusicContext from "@/context/music/MusicContext";

const openDb = async () => {
  const request = indexedDB.open("MusicCacheDB", 1);

  request.onupgradeneeded = (event) => {
    const db = event.target.result;
    if (!db.objectStoreNames.contains("tracks")) {
      const store = db.createObjectStore("tracks", { keyPath: "id" });
      store.createIndex("by_track_id", "id");
    }
  };

  return new Promise((resolve, reject) => {
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

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

  const getTrackData = async (trackId) => {
    try {
      const db = await openDb();
      const tx = db.transaction("tracks", "readonly");
      const store = tx.objectStore("tracks");

      const cachedTrackData = await new Promise((resolve, reject) => {
        const request = store.get(trackId);
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
      });

      if (cachedTrackData) {
        return {
          id: cachedTrackData.id,
          name: cachedTrackData.name,
          album: cachedTrackData.album,
          artists: cachedTrackData.artists,
          image: cachedTrackData.image,
          link: cachedTrackData.link,
          audioBlob: cachedTrackData.audioBlob,
          hasLyrics: cachedTrackData.hasLyrics,
        };
      } else {
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
          hasLyrics: resultData.hasLyrics,
        };

        const txWrite = db.transaction("tracks", "readwrite");
        const storeWrite = txWrite.objectStore("tracks");
        storeWrite.put(trackData);

        return trackData;
      }
    } catch (error) {
      console.error("Error fetching track data:", error);
      return null;
    }
  };

  const getTrack = async (trackId) => {
    setIsAudioLoading(true);
    const db = await openDb();

    const tx = db.transaction("tracks", "readonly");
    const store = tx.objectStore("tracks");
    const cachedTrackData = await new Promise((resolve, reject) => {
      const request = store.get(trackId);
      request.onsuccess = (event) => resolve(event.target.result);
      request.onerror = (event) => reject(event.target.error);
    });

    if (cachedTrackData) {
      setCurrentTrack({
        id: trackId,
        name: cachedTrackData.name,
        album: cachedTrackData.album,
        artists: cachedTrackData.artists,
        image: cachedTrackData.image,
        link: cachedTrackData.audioBlob || cachedTrackData.link,
        hasLyrics: cachedTrackData.hasLyrics,
      });
      setIsAudioLoading(false);
      setPreviouslyPlayedTracks((prevTracks) => [...prevTracks, trackId]);
    } else {
      const trackData = await getTrackData(trackId);
      setCurrentTrack(trackData);
      cacheTrackData(trackData);
      setIsAudioLoading(false);
      setPreviouslyPlayedTracks((prevTracks) => [...prevTracks, trackId]);
    }
  };

  const getTrackLyrics = async () => {
    let currentTrackLyrics;
    if (currentTrack.hasLyrics) {
      const { data } = await axios.get(
        `${fiyosaavnApiBaseUri}/songs/${currentTrack.id}/lyrics`,
      );
      return {
        trackId: currentTrack.id,
        lyrics: data.data.lyrics.replace("<br>", "<br/>"),
      };
    } else {
      try {
        const { data } = await axios.get(
          `https://lyrist.vercel.app/api/${
            currentTrack.name
          }/${currentTrack.artists.split(",")[0].trim()}`,
        );
        if (data.lyrics) {
          return {
            trackId: currentTrack.id,
            lyrics: data.lyrics,
          };
        } else return null;
      } catch (error) {
        console.error(error);
        return null;
      }
    }
  };

  const cacheTrackData = async (trackData) => {
    const db = await openDb();
    const tx = db.transaction("tracks", "readwrite");
    const store = tx.objectStore("tracks");

    store.put({
      id: trackData.id,
      name: trackData.name,
      album: trackData.album,
      artists: trackData.artists,
      image: trackData.image,
      link: trackData.link,
      hasLyrics: trackData.hasLyrics,
      audioBlob: null,
    });
  };

  const deleteCachedAudioData = async () => {
    try {
      const db = await openDb();
      const tx = db.transaction("tracks", "readwrite");
      const store = tx.objectStore("tracks");
      store.clear();
      tx.oncomplete = () => {
        alert("All Cached Audio Data deleted successfully");
      };
    } catch (e) {
      console.error("Unable to delete Cached Audio Data", e);
    }
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
        let trackIdToFetch = await getSuggestedTrackId();

        if (loopAudio && callType === "auto") {
          audio.currentTime = 0;
          audio.play();
          setIsAudioPlaying(true);
          await getTrack(currentTrack.id);
        } else if ((!loopAudio && callType === "auto") || callType !== "auto") {
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
    const { data } = await axios.get(
      `${fiyosaavnApiBaseUri}/songs/${currentTrack.id}/suggestions`,
      { params: { limit: 10 } },
    );

    let suggestedTrackId;
    do {
      suggestedTrackId = data.data[Math.floor(Math.random() * 10)].id;
    } while (previouslyPlayedTracks.includes(suggestedTrackId));

    return suggestedTrackId;
  };

  useEffect(() => {
    const audio = audioRef.current;

    if (currentTrack.id) {
      if ("mediaSession" in navigator) {
        navigator.mediaSession.metadata = new window.MediaMetadata({
          title: currentTrack.name,
          artist: currentTrack.artists,
          album: currentTrack.album,
          artwork: [
            {
              src: currentTrack.image.replace(/(50x50|150x150)/, "500x500"),
              sizes: "500x500",
              type: "image/jpg",
            },
          ],
        });

        navigator.mediaSession.setActionHandler("play", handleAudioPlay);

        navigator.mediaSession.setActionHandler("pause", handleAudioPause);

        navigator.mediaSession.setActionHandler(
          "nexttrack",
          handleNextAudioTrack,
        );

        navigator.mediaSession.setActionHandler("stop", () => {
          audio.pause();
          setIsAudioPlaying(false);
        });
      }
    }
  }, [currentTrack, handleAudioPlay, handleAudioPause, handleNextAudioTrack]);

  return {
    getTrackData,
    getTrack,
    getTrackLyrics,
    deleteCachedAudioData,
    handleAudioPlay,
    handleAudioPause,
    handleNextAudioTrack,
  };
};

export default useMusicUtility;
