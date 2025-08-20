// StyleOptionCardVideo.jsx

export default function StyleOptionCard({
  isSelected,
  onSelect,
  title,
  blurb,
  timeSec = 5,
  keyword,
  videoUrl,
}) {
  return (
    <div
      onClick={onSelect}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        textAlign: "center",
        borderRadius: 8,
        border: "1px solid",
        borderColor: "gray",
        cursor: "pointer",
        boxShadow: "0 2px 8px rgba(128, 100, 100, 0.1)",
        padding: 16,
        backgroundColor: isSelected ? "#e0f7fa" : "#ffffff",
      }}
    >
      <video
        src={videoUrl}
        autoPlay
        muted
        loop
        playsInline
        style={{
          width: "100%",
          height: "100px",
          objectFit: "cover",
          display: "block",
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
        }}
      />
      <div
        style={{
          width: "100%",
        }}
      >
        <div
          style={{
            fontSize: "1.2em",
            fontWeight: "bold",
            color: "blue",
          }}
        >
          {title}
        </div>
        <div>{blurb}</div>
        <div
          style={{
            fontWeight: "bold",
          }}
        >
          {timeSec}
        </div>
        <div
          style={{
            fontSize: "0.9em",
            color: "gray",
          }}
        >
          {keyword}
        </div>
      </div>
    </div>
  );
}
