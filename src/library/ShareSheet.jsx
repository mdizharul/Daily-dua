import { useEffect, useState } from "react";
import { T, FONT, h2, primaryButton, secondaryButton, segOption, segTrack } from "../theme/tokens";
import { CARD_SIZES, CARD_THEMES, renderDuaImage, saveImage, shareImage } from "../utils/shareAsImage";
import { useBackHandler } from "../hooks/useBackHandler";
import { duaTitle } from "./duaUtils";

const STYLE_KEY = "share-card-style";

function loadStyle(night) {
  try {
    const s = JSON.parse(localStorage.getItem(STYLE_KEY) || "null");
    if (s && CARD_THEMES[s.theme] && CARD_SIZES[s.size]) return s;
  } catch {
    // ignore
  }
  return { theme: night ? "midnight" : "emerald", size: "fit" };
}

/** Bottom sheet: choose a card theme and size, preview it, then Share or Save image. */
export default function ShareSheet({ dua, show, night, onClose }) {
  const [style, setStyleState] = useState(() => loadStyle(night));
  const [blob, setBlob] = useState(null);
  const [url, setUrl] = useState(null);
  const [status, setStatus] = useState("");
  const title = duaTitle(dua, show?.lang);
  useBackHandler(true, onClose);

  // Build on the latest choice, so quick taps (theme then size) don't undo each other.
  const setStyle = (patch) => {
    setStatus("");
    setStyleState((prev) => ({ ...prev, ...patch }));
  };

  useEffect(() => {
    try {
      localStorage.setItem(STYLE_KEY, JSON.stringify(style));
    } catch {
      // storage blocked
    }
  }, [style]);

  useEffect(() => {
    let alive = true;
    let objectUrl;
    renderDuaImage(dua, { ...style, show }).then((b) => {
      if (!alive || !b) return;
      objectUrl = URL.createObjectURL(b);
      setBlob(b);
      setUrl(objectUrl);
    });
    return () => {
      alive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [dua, style, show]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const share = async () => {
    const result = await shareImage(blob, title);
    if (result === "saved") setStatus("Image saved to your downloads");
    else if (result === "shared") onClose();
  };

  const save = () => {
    saveImage(blob, title);
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
          maxHeight: "94svh",
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

        <div style={{ borderRadius: "18px", border: `1px solid ${T.border}`, background: T.divider, padding: "12px", minHeight: "160px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {url ? (
            <img
              src={url}
              alt={`Share card for ${title}`}
              style={{ display: "block", width: style.size === "tall" ? "60%" : "100%", maxHeight: "46svh", objectFit: "contain", borderRadius: "12px", boxShadow: T.shadow }}
            />
          ) : (
            <span style={{ color: T.muted, fontSize: "13px" }}>Preparing card…</span>
          )}
        </div>

        <div role="radiogroup" aria-label="Card theme" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "8px" }}>
          {Object.entries(CARD_THEMES).map(([id, t]) => {
            const on = style.theme === id;
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setStyle({ theme: id })}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: FONT, color: on ? T.accent : T.muted, fontSize: "12px", fontWeight: 600 }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: "100%",
                    height: "44px",
                    borderRadius: "12px",
                    background: `linear-gradient(150deg, ${t.top}, ${t.bottom})`,
                    border: on ? `2px solid ${T.accent}` : `1px solid ${T.border}`,
                    boxShadow: on ? `0 0 0 2px ${T.bg} inset` : "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ width: "10px", height: "10px", transform: "rotate(45deg)", background: t.gold, borderRadius: "2px" }} />
                </span>
                {t.label}
              </button>
            );
          })}
        </div>

        <div role="radiogroup" aria-label="Card size" style={segTrack(3)}>
          {Object.entries(CARD_SIZES).map(([id, sz]) => (
            <button key={id} type="button" role="radio" aria-checked={style.size === id} onClick={() => setStyle({ size: id })} style={{ ...segOption(style.size === id), fontSize: "12px" }}>
              {sz.label}
            </button>
          ))}
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
