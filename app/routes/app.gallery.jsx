import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { Page } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import "../style/gallery.css";
import "../style/credits.css";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import {
  getVideoList,
  updateVideo,
  deleteVideo,
  uploadVideo,
  regenerateVideo,
} from "../api/api";
import HoverVideo from "../components/HoverVideo";

const PlayIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="5,3 19,12 5,21"></polygon>
  </svg>
);

const DownloadIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7,10 12,15 17,10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

const TrashIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3,6 5,6 21,6"></polyline>
    <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
  </svg>
);

const CalendarIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const ClockIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12,6 12,12 16,14"></polyline>
  </svg>
);

const FileVideoIcon = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
    <polyline points="14,2 14,8 20,8"></polyline>
    <path d="M10,11l5,3-5,3Z"></path>
  </svg>
);

const UploadIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17,8 12,3 7,8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
  </svg>
);

// Card component
const Card = ({ className = "", children, ...props }) => {
  const classes = `card ${className}`;
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

// Button component
const Button = ({
  className = "",
  variant = "default",
  size = "default",
  children,
  ...props
}) => {
  const baseClasses = "button";
  const variantClasses = {
    default: "button-default",
    secondary: "button-secondary",
    outline: "button-outline",
    ghost: "button-ghost",
    destructive: "button-destructive",
  };
  const sizeClasses = {
    default: "button-default-size",
    sm: "button-sm",
    lg: "button-lg",
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};

// Badge component
const Badge = ({ className = "", variant = "default", children, ...props }) => {
  const baseClasses = "badge";
  const variantClasses = {
    default: "badge-default",
    secondary: "badge-secondary",
    destructive: "badge-destructive",
    outline: "badge-outline",
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export async function loader({ request }) {
  const { admin, session } = await authenticate.admin(request);
  const accessToken = session.accessToken;
  const shop = session.shop;

  return json({ shop, accessToken });
}

export default function GalleryPage() {
  const { shop, accessToken } = useLoaderData();
  const [hoveredVideo, setHoveredVideo] = useState(null);
  const [videos, setVideos] = useState([]);
  const [videoShow, setVideoShow] = useState(false);
  const videosRef = useRef(videos);
  const videoShowRef = useRef(null);

  const handleVideoDelete = (id) => {
    try {
      deleteVideo(id, shop, accessToken);
      setVideos([...videos.filter((row) => row.id != id)]);
      // You can add toast notification here
      console.log("Video deleted successfully");
    } catch (error) {
      console.error("Error deleting video:", error);
    }
  };

  const handleVideoDownload = async (video_url) => {
    const response = await axios.get(video_url, {
      responseType: "blob",
    });

    const urlBlob = window.URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = urlBlob;
    link.download = getFilenameFromUrl(video_url);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(urlBlob);

    console.log("Video download started");
  };

  const handleRegenerate = async (video) => {
    const data = [...videos];
    data.find((row) => row.id === video.id).status = "processing";
    setVideos(data);
    await regenerateVideo(video.id);
    await getVideo();
  };

  const handleVideoUpload = async (video) => {
    const data = [...videos];
    data.find((row) => row.id === video.id).status = "uploading";
    setVideos(data);
    await uploadVideo(
      shop,
      accessToken,
      video.id,
      video.video_url,
      video.product_id,
    );
  };

  const handleVideoPlay = (video_url) => {
    console.log(video_url);
    setVideoShow(true);
    if (videoShowRef) {
      console.log(videoShowRef);
      videoShowRef.current.src = video_url;
      videoShowRef.current.load();
      videoShowRef.current.play().catch((err) => {
        console.error("Video failed to play:", err);
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "uploaded":
        return "status-uploaded";
      case "uploading":
        return "status-uploading";
      case "completed":
        return "status-completed";
      case "processing":
        return "status-processing";
      case "failed":
        return "status-failed";
      default:
        return "status-unknown";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "uploaded":
        return "Uploaded";
      case "uploading":
        return "Uploading";
      case "completed":
        return "Ready to Upload";
      case "processing":
        return "Processing";
      case "failed":
        return "Failed";
      default:
        return "Unknown";
    }
  };

  // Utility function to get filename from URL
  function getFilenameFromUrl(url) {
    const parsedUrl = new URL(url);
    const pathname = parsedUrl.pathname; // e.g. /bs2/.../filename.mp4
    const parts = pathname.split("/");
    return parts[parts.length - 1]; // Last part is the filename
  }

  const getVideo = async () => {
    const res = await getVideoList(shop);
    console.log(res);
    setVideos(
      res.data.map((row) => ({
        id: row.id,
        product_id: row.product_id,
        video_url: row.video_url,
        duration: row.duration,
        thumbnail: row.thumbnail,
        createdAt: row.created_at.substr(0, 10),
        status: row.status,
      })),
    );
  };

  useEffect(() => {
    videosRef.current = videos;
  }, [videos]);

  useEffect(() => {
    getVideo();

    const intervalId = setInterval(() => {
      updateVideos();
    }, 10000);

    return () => clearInterval(intervalId);
  }, []);

  const updateVideos = async () => {
    const data = videosRef.current.filter(
      (row) => row.status !== "uploaded" && row.status != "failed",
    );
    console.log("Updating videos:", data);
    if (data.length === 0) return;
    for (let i = 0; i < data.length; i++) {
      const res = await updateVideo(data[i].id);
      data[i].video_url = res.data.video_url;
      data[i].duration = res.data.duration;
      data[i].thumbnail = res.data.thumbnail;
      data[i].status = res.data.status;
    }
    const currentVideos = videosRef.current;
    setVideos([
      ...currentVideos.map((aItem) => {
        const match = data.find((bItem) => bItem.id === aItem.id);
        return match ? match : aItem;
      }),
    ]);
  };

  return (
    <div className="gallery">
        <div
          style={{
            position: "fixed",
            visibility: `${videoShow ? "visible" : "hidden"}`,
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            zIndex: 30,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <button
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                zIndex: 20,
                background: "rgba(0, 0, 0, 0.6)",
                color: "#fff",
                border: "none",
                padding: "0.5rem 0.75rem",
                cursor: "pointer",
                fontSize: "1.2rem",
              }}
              onClick={() => setVideoShow(false)}
            >
              ✕
            </button>
            <video
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                background: "black",
              }}
              controls
              ref={videoShowRef}
            />
          </div>
        </div>
      <Page>
        <TitleBar title="Gallery page" />
        <div className="video-gallery">
          <div className="video-gallery-header">
            <div>
              <h2 className="video-gallery-title">Generated Videos</h2>
              <p className="video-gallery-subtitle">
                Manage and download your created videos
              </p>
            </div>
            <Badge variant="default" className="video-count-badge">
              {videos.length} video{videos.length !== 1 ? "s" : ""}
            </Badge>
          </div>

          {videos.length === 0 ? (
            <Card className="empty-state-card">
              <FileVideoIcon />
              <h3 className="empty-state-title">No videos yet</h3>
              <p className="empty-state-description">
                Upload some images and generate your first video to get started
              </p>
            </Card>
          ) : (
            <div className="video-grid">
              {videos.map((video) => (
                <Card
                  key={video.id}
                  style={{
                    overflow: "visible",
                  }}
                  className={`video-card ${hoveredVideo === video.id ? "video-card-hovered" : ""}`}
                  onClick={() => handleVideoPlay(video.video_url)}
                  onMouseEnter={(e) => {
                    setHoveredVideo(video.id);
                  }}
                  onMouseLeave={(e) => {
                    setHoveredVideo(null);
                  }}
                >
                  {/* Video Thumbnail */}
                  <div
                    className="video-thumbnail"
                    style={{
                      overflow: "visible",
                    }}
                  >
                    {video.thumbnail ? (
                      <HoverVideo video={video} />
                    ) : (
                      <FileVideoIcon />
                    )}

                    {/* Play overlay */}
                    <div
                      style={{
                        pointerEvents: "none",
                      }}
                      className={`play-overlay ${hoveredVideo === video.id ? "play-overlay-visible" : ""}`}
                    >
                      <Button
                        size="lg"
                        className="play-button"
                      >
                        <PlayIcon />
                      </Button>
                    </div>

                    {/* Status indicator */}
                    <div
                      className="status-indicator"
                      style={{ pointerEvents: "none" }}
                    >
                      <div className="status-content">
                        <div
                          className={`status-dot ${getStatusColor(video.status)}`}
                        />
                        <span className="status-text">
                          {getStatusText(video.status)}
                        </span>
                      </div>
                    </div>

                    {/* Actions menu */}
                    <div
                      className="actions-menu"
                      style={{ pointerEvents: "auto" }}
                    >
                      {video.status === "completed" && (
                        <>
                          <div className="tooltip">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="action-button"
                              onClick={() => handleVideoUpload(video)}
                            >
                              <UploadIcon />
                            </Button>
                            <span className="tooltip-text">
                              Upload To Shopify
                            </span>
                          </div>
                          <div className="tooltip">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="action-button"
                              onClick={() => handleRegenerate(video)}
                            >
                              <UploadIcon />
                            </Button>
                            <span className="tooltip-text">Re-Generate</span>
                          </div>
                          <div className="tooltip">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="action-button"
                              onClick={() =>
                                handleVideoDownload(video.video_url)
                              }
                            >
                              <DownloadIcon />
                            </Button>
                            <span className="tooltip-text">Download</span>
                          </div>
                        </>
                      )}
                      <div className="tooltip">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="action-button"
                          onClick={() => handleVideoDelete(video.id)}
                        >
                          <TrashIcon />
                        </Button>
                        <span className="tooltip-text">Delete</span>
                      </div>
                    </div>
                  </div>

                  {/* Video Info */}
                  <div className="video-info">
                    <div className="video-meta">
                      <div className="meta-item">
                        <ClockIcon />
                        {video.duration}s
                      </div>
                      <div className="meta-item">
                        <CalendarIcon />
                        {video.createdAt}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Page>
    </div>
  );
}
