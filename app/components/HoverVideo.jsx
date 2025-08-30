import { useRef, useEffect } from "react";

export default function HoverVideo({ video }) {
  const videoRef = useRef(null);

  useEffect(() => {
    console.log("video prop changed:", video);
  }, []);

  return (
    <video
      ref={videoRef}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "contain",
      }}
      src={video.video_url}
      muted // important: autoplay works only if muted
      preload="metadata"
      loop
      onMouseEnter={() => {
        console.log("enter");
        if (videoRef.current) {
          videoRef.current.play();
        }
      }}
      onMouseLeave={() => {
        console.log("leave");
        if (videoRef.current) {
          videoRef.current.pause();
          // videoRef.current.currentTime = 0; // optional: reset to start
        }
      }}
    />
  );
}
