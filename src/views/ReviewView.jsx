export default function ReviewView({
  reviewQueue, reviewIdx, setReviewIdx, reviewRevealed, setReviewRevealed,
  duas, setDuas, arabicFontSize, paperMode, setReviewMode, appColor,
}) {
  const goldColor  = paperMode ? "#7a4a00" : "#c9a84c";
  const goldFaint  = paperMode ? "rgba(122,74,0,0.5)" : "rgba(201,168,76,0.5)";
  const cardBg     = paperMode ? "linear-gradient(145deg, #faf6ec 0%, #f3ead5 100%)" : "linear-gradient(145deg, #1a2a1a 0%, #0f1f14 100%)";
  const cardBorder = paperMode ? "rgba(139,94,32,0.25)" : "rgba(201,168,76,0.2)";

  return (
    <div style={{ animation: "fadeIn 0.3s ease-out" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <button onClick={() => setReviewMode(false)} style={{ background: "none", border: "none", color: goldColor, cursor: "pointer", fontSize: "0.9rem", fontFamily: "'Cormorant Garamond', serif", padding: "0.5rem 0" }}>← Exit Review</button>
        <span style={{ fontSize: "0.78rem", color: goldFaint, fontFamily: "'Cormorant Garamond', serif" }}>{reviewIdx + 1} / {reviewQueue.length}</span>
      </div>

      {reviewQueue.length > 0 && reviewIdx < reviewQueue.length ? (() => {
        const rDua = reviewQueue[reviewIdx];
        return (
          <div style={{ background: cardBg, borderRadius: "20px", border: `1px solid ${cardBorder}`, padding: "1.5rem", textAlign: "center", animation: "fadeIn 0.25s ease-out" }}>
            {/* Progress bar */}
            <div style={{ height: "3px", background: paperMode ? "rgba(139,94,32,0.1)" : "rgba(201,168,76,0.08)", borderRadius: "2px", marginBottom: "1.2rem", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${((reviewIdx) / reviewQueue.length) * 100}%`, background: goldColor, transition: "width 0.3s" }} />
            </div>

            {/* Arabic */}
            <p style={{ fontFamily: "'Amiri', serif", fontSize: `${arabicFontSize * 1.2}rem`, lineHeight: 2, color: appColor, direction: "rtl", textAlign: "right", margin: "0 0 1rem" }}>{rDua.arabic}</p>

            {/* Title hint */}
            <p style={{ fontSize: "0.75rem", color: goldFaint, fontFamily: "'Cormorant Garamond', serif", margin: "0 0 1.2rem", fontStyle: "italic" }}>{rDua.title}</p>

            {!reviewRevealed ? (
              <button onClick={() => setReviewRevealed(true)}
                style={{ width: "100%", padding: "0.85rem", background: paperMode ? "rgba(139,94,32,0.08)" : "rgba(201,168,76,0.1)", border: `1px solid ${cardBorder}`, borderRadius: "50px", color: goldColor, cursor: "pointer", fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: "0.95rem", letterSpacing: "1px" }}>
                Show Answer
              </button>
            ) : (
              <>
                {/* Revealed content */}
                <div style={{ marginBottom: "1.2rem", padding: "0.9rem", background: paperMode ? "rgba(139,94,32,0.05)" : "rgba(201,168,76,0.04)", borderRadius: "12px", border: `1px solid ${cardBorder}`, textAlign: "left" }}>
                  {rDua.transliteration && <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.9rem", color: paperMode ? "#8b5e00" : "#c9a84c", fontStyle: "italic", margin: "0 0 0.5rem" }}>{rDua.transliteration.replace(/\n/g, " · ")}</p>}
                  {rDua.translation && <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.85rem", color: appColor, margin: 0, opacity: 0.75 }}>{rDua.translation.replace(/\n/g, " · ")}</p>}
                </div>

                {/* Grade buttons */}
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button onClick={() => { const u=[...duas]; const ri=duas.findIndex(d=>d.id===rDua.id); if(ri>=0){u[ri]={...u[ri],status:"new"};setDuas(u);} setReviewRevealed(false); setReviewIdx(i=>i+1); if(navigator.vibrate)navigator.vibrate(30); }}
                    style={{ flex: 1, padding: "0.6rem", background: "rgba(100,160,255,0.12)", border: "1px solid rgba(100,160,255,0.25)", borderRadius: "50px", color: "#7ab4ff", cursor: "pointer", fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: "0.8rem" }}>
                    🔄 Review Again
                  </button>
                  <button onClick={() => { const u=[...duas]; const ri=duas.findIndex(d=>d.id===rDua.id); if(ri>=0){u[ri]={...u[ri],status:"learning"};setDuas(u);} setReviewRevealed(false); setReviewIdx(i=>i+1); if(navigator.vibrate)navigator.vibrate(30); }}
                    style={{ flex: 1, padding: "0.6rem", background: "rgba(255,190,60,0.12)", border: "1px solid rgba(255,190,60,0.25)", borderRadius: "50px", color: "#ffbe3c", cursor: "pointer", fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: "0.8rem" }}>
                    🔆 Almost
                  </button>
                  <button onClick={() => { const u=[...duas]; const ri=duas.findIndex(d=>d.id===rDua.id); if(ri>=0){u[ri]={...u[ri],status:"memorized"};setDuas(u);} setReviewRevealed(false); setReviewIdx(i=>i+1); if(navigator.vibrate)navigator.vibrate([30,50,30]); }}
                    style={{ flex: 1, padding: "0.6rem", background: "rgba(100,210,120,0.12)", border: "1px solid rgba(100,210,120,0.25)", borderRadius: "50px", color: "#7ec97e", cursor: "pointer", fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: "0.8rem" }}>
                    ✓ Know It
                  </button>
                </div>
              </>
            )}
          </div>
        );
      })() : (
        <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
          <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🌟</p>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", color: goldColor }}>Review complete!</p>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "0.85rem", color: goldFaint, margin: "0.5rem 0 1.5rem" }}>{reviewQueue.length} duas reviewed</p>
          <button onClick={() => setReviewMode(false)} style={{ padding: "0.7rem 2rem", background: "linear-gradient(135deg, #c9a84c 0%, #a8883a 100%)", border: "none", borderRadius: "50px", color: "#0a1a0e", cursor: "pointer", fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: "0.95rem" }}>Done</button>
        </div>
      )}
    </div>
  );
}
