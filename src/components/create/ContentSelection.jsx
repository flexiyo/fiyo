import { useState, useContext } from "react";
import { Gallery } from "react-grid-gallery";
import CreateContext from "@/context/create/CreateContext";

const ContentSelection = () => {
  const { selectedFileType } = useContext(CreateContext);
  const [mediaFiles, setMediaFiles] = useState({});

  return (
    <div className="create-container--content-selection">
      <FileTypeSelector />
      <div className="create-content-selection--container">
        {selectedFileType === "image" ? (
          <ImagesGrid mediaImages={mediaFiles?.images} />
        ) : selectedFileType === "video" ? (
          <VideosGrid mediaVideos={mediaFiles?.videos} />
        ) : selectedFileType === "audio" ? (
          <AudiosGrid mediaAudios={mediaFiles?.audios} />
        ) : null}
      </div>
    </div>
  );
};

const FileTypeSelector = () => {
  const { selectedFileType, setSelectedFileType } = useContext(CreateContext);

  const handleFileTypeSelect = (type) => {
    setSelectedFileType(type);
  };

  return (
    <div className="file-type--selector">
      {["image", "video", "audio"].map((type) => (
        <div
          key={type}
          className="file-type--selector-item"
          style={{
            backgroundColor:
              selectedFileType === type ? "var(--fm-secondary-bg-color)" : "",
          }}
          onClick={() => handleFileTypeSelect(type)}
        >
          {type.charAt(0).toUpperCase() + type.slice(1)}s
        </div>
      ))}
    </div>
  );
};

const ImagesGrid = ({ mediaImages = [] }) => {
  const { setSelectedFilePath } = useContext(CreateContext);
  const [images, setImages] = useState(
    mediaImages.map((image) => ({ ...image, isSelected: false }))
  );

  const handleImageSelect = (index) => {
    const nextImages = images.map((image, i) => ({
      ...image,
      isSelected: i === index,
    }));
    setImages(nextImages);
    setSelectedFilePath(images[index].src);
  };

  return (
    <Gallery
      images={images}
      rowHeight={140}
      onClick={(index) => handleImageSelect(index)}
    />
  );
};

const VideosGrid = ({ mediaVideos = [] }) => {
  const { setSelectedFilePath } = useContext(CreateContext);
  const [videoThumbnails, setVideoThumbnails] = useState(
    mediaVideos.map((video) => ({
      filePath: video.uri,
      isSelected: false,
    }))
  );

  const handleVideoThumbSelect = (index) => {
    const nextVideoThumbs = videoThumbnails.map((videoThumb, i) => ({
      ...videoThumb,
      isSelected: i === index,
    }));
    setVideoThumbnails(nextVideoThumbs);
    setSelectedFilePath(videoThumbnails[index].filePath);
  };

  return videoThumbnails.length > 0 ? (
    <Gallery
      images={videoThumbnails}
      rowHeight={140}
      onClick={(index) => handleVideoThumbSelect(index)}
    />
  ) : (
    <div>No files here, upload one</div>
  );
};

const AudiosGrid = ({ mediaAudios = [] }) => {
  const { setSelectedFilePath } = useContext(CreateContext);
  const [audioThumbnails, setAudioThumbnails] = useState(
    mediaAudios.map((audio) => ({
      filePath: audio.uri,
      isSelected: false,
    }))
  );

  const handleAudioThumbSelect = (index) => {
    const nextAudioThumbs = audioThumbnails.map((audioThumb, i) => ({
      ...audioThumb,
      isSelected: i === index,
    }));
    setAudioThumbnails(nextAudioThumbs);
    setSelectedFilePath(audioThumbnails[index].filePath);
  };

  return audioThumbnails.length > 0 ? (
    <Gallery
      images={audioThumbnails}
      rowHeight={140}
      onClick={(index) => handleAudioThumbSelect(index)}
    />
  ) : (
    <div>No files here, upload one</div>
  );
};

export default ContentSelection;
