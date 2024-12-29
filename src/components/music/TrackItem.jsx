import { useState, useContext } from "react";
import MusicContext from "@/context/music/MusicContext";
import useMusicUtility from "@/utils/music/useMusicUtility";
const TrackItem = ({ id, track, index, onOpenDownloadModal }) => {
  const { contentQuality } = useContext(MusicContext);
  const { getTrack } = useMusicUtility();
  const [isDownloadLoading, setIsDownloadLoading] = useState(false);

  const handleItemClick = (event) => {
    if (!event.target.classList.contains("fa-arrow-circle-down")) {
      getTrack(track.id);
    }
  };

  const handleDownloadClick = async (trackId) => {
    setIsDownloadLoading(true);
    await onOpenDownloadModal(trackId);
    setIsDownloadLoading(false);
  };

  return (
    <div
      className="transition-all duration-200 cursor-pointer active:scale-98"
      onClick={handleItemClick}
      id={`trackItem${index}`}
    >
      <div className="grid grid-cols-[20%_70%_10%] mb-4 h-16 items-center place-items-center">
        <img
          className="overflow-hidden mx-auto w-14 h-14 object-cover rounded-sm"
          src={
            Array.isArray(track.image)
              ? contentQuality === "low"
                ? track.image[0].url
                : contentQuality === "normal"
                ? track.image[1].url
                : contentQuality === "high"
                ? track.image[2].url
                : track.image[1].url
              : track.image
          }
          alt="Track"
        />
        <div className="w-full flex flex-col pl-2 font-[SpotifyMedium] pr-5">
          <span className="text-sm truncate whitespace-nowrap overflow-hidden w-2/10">
            {track.name}
          </span>
          <span
            className="text-xs text-gray-400 truncate whitespace-nowrap overflow-hidden w-9/10"
            key={index}
          >
            {track.artists.primary
              ? track.artists.primary.length > 1
                ? track.artists.primary.map((artist) => artist.name).join(", ")
                : track.artists.primary.map((artist) => artist.name)
              : track.artists}
          </span>
        </div>
        <div className="track-item--details-download">
          {isDownloadLoading && (
            <div className="track-item--details-download-preloader"></div>
          )}
          <i
            className="far fa-arrow-circle-down fm-small-icon"
            style={{ fontSize: "1.3rem" }}
            onClick={() => handleDownloadClick(track.id)}
          ></i>
        </div>
      </div>
    </div>
  );
};

export default TrackItem;
