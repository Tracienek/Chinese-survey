import { useState } from "react";

export default function ExpandableText({ text, lines = 3 }) {
  const [open, setOpen] = useState(false);
  if (!text) return null;

  const isLong = text.length > 120; // điều kiện để hiện nút "Xem hết"

  return (
    <div style={{ maxWidth: 320, whiteSpace: "pre-wrap" }}>
      <div className={open ? "" : `clamp-${lines}`}>{text}</div>
      {isLong && (
        <button
          type="button"
          className="btn btn-link p-0 mt-1"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Thu gọn" : "Xem hết"}
        </button>
      )}
    </div>
  );
}
