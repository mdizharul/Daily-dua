import { useEffect, useState } from "react";
import { T, FONT, h2, primaryButton, secondaryButton } from "../theme/tokens";
import { renderDuaImage, saveImage, shareImage } from "../utils/shareAsImage";

/** Bottom sheet: previews the share card, then Share or Save image. */
export default function ShareSheet({ dua, night, onClose }) {
  const [blob, setBlob] = useState(null);
  const [url, setUrl] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    let alive = true;
    let objectUrl;
    renderDuaImage(dua, night).then((b) => {
      if (!alive || !b) return;
      objectUrl = URL.createObjectURL(b);
      setBlob(b);
      setUrl(objectUrl);
    });
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      alive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      window.removeEventListener("keydown", onKey);
    };
  }, [dua, night, onClose]);

  const share = async () => {
    const result = await shareImage(blob, dua.title);
    if (result === "saved") setStatus("Image saved to your downloads");
    else if (result === "shared") onClose();
  };

  const save = () => {
    saveImage(blob, dua.title);
    setStatus("Image saved to your downloads");
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="Share card" style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <button type="button" aria-label="Close" onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", border: "none", cursor: "pointer" }} />
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "480px",
          maxHeight: "92svh",
          overflowY: "auto",
          background: T.bg,
          color: T.text,
          fontFamily: FONT,
          borderRadius: "24px 24px 0 0",
          padding: "12px 20px calc(20px + env(safe-area-inset-bottom))",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          animation: "fadeIn 0.2s ease-out",
        }}
      >
        <span aria-hidden="true" style={{ alignSelf: "center", width: "40px", height: "4px", borderRadius: "999px", background: T.border }} />
        <h2 style={{ ...h2, fontSize: "17px" }}>Share card</h2>

        <div style={{ borderRadius: "18px", overflow: "hidden", border: `1px solid ${T.border}`, background: T.card, minHeight: "160px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {url ? <img src={url} alt={`Share card for ${dua.title}`} style={{ width: "100%", display: "block" }} /> : <span style={{ color: T.muted, fontSize: "13px" }}>Preparing card…</span>}
        </div>

        {status && (
          <p role="status" style={{ margin: 0, fontSize: "13px", color: T.accent, textAlign: "center" }}>
            {status}
          </p>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <button type="button" onClick={save} disabled={!blob} style={{ ...secondaryButton, height: "52px" }}>
            Save image
          </button>
          <button type="button" onClick={share} disabled={!blob} style={{ ...primaryButton(Boolean(blob)), height: "52px" }}>
            Share
          </button>
        </div>
      </div>
    </div>
  );
}
