export default async function shareAsImage(dua, paper) {
  await document.fonts.ready;
  const W = 600, PAD = 36;
  const aLines  = dua.arabic.split("\n").filter(l => l.trim());
  const tLines  = (dua.transliteration || "").split("\n").filter(l => l.trim());
  const trLines = (dua.translation || "").split("\n").filter(l => l.trim());
  const H = 80 + aLines.length * 54 + (tLines.length ? tLines.length * 24 + 16 : 0) + (trLines.length ? trLines.length * 22 + 8 : 0) + 60;

  const canvas = document.createElement("canvas");
  canvas.width = W * 2; canvas.height = H * 2;
  const ctx = canvas.getContext("2d");
  ctx.scale(2, 2);

  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  if (paper) { bgGrad.addColorStop(0, "#faf6ec"); bgGrad.addColorStop(1, "#f3ead5"); }
  else        { bgGrad.addColorStop(0, "#1a2a1a"); bgGrad.addColorStop(1, "#0f1f14"); }
  ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = paper ? "rgba(139,94,32,0.3)" : "rgba(201,168,76,0.3)";
  ctx.lineWidth = 1; ctx.strokeRect(0.5, 0.5, W - 1, H - 1);

  const gold = paper ? "#7a4a00" : "#c9a84c";
  // Top ornament line
  ctx.fillStyle = gold; ctx.fillRect(PAD, 14, W - PAD * 2, 0.8);

  // Title
  ctx.font = "600 17px 'Cormorant Garamond', serif";
  ctx.fillStyle = gold; ctx.textAlign = "left"; ctx.direction = "ltr";
  ctx.fillText(dua.title, PAD, 46);

  // Divider
  ctx.strokeStyle = paper ? "rgba(139,94,32,0.15)" : "rgba(201,168,76,0.1)";
  ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(PAD, 56); ctx.lineTo(W - PAD, 56); ctx.stroke();

  let y = 80;
  // Arabic
  ctx.font = "22px 'Amiri', serif";
  ctx.fillStyle = paper ? "#2d1a00" : "#e8dcc8";
  ctx.textAlign = "right"; ctx.direction = "rtl";
  aLines.forEach(line => { ctx.fillText(line, W - PAD, y); y += 54; });

  y += 8;
  // Transliteration
  if (tLines.length) {
    ctx.font = "italic 13px 'Cormorant Garamond', serif";
    ctx.fillStyle = paper ? "#8b5e00" : "#c9a84c";
    ctx.textAlign = "left"; ctx.direction = "ltr";
    tLines.forEach(line => { ctx.fillText(line, PAD, y); y += 24; });
    y += 8;
  }
  // Translation
  if (trLines.length) {
    ctx.font = "13px 'Cormorant Garamond', serif";
    ctx.fillStyle = paper ? "rgba(107,74,0,0.75)" : "rgba(232,220,200,0.6)";
    ctx.textAlign = "left"; ctx.direction = "ltr";
    trLines.forEach(line => { ctx.fillText(line, PAD, y); y += 22; });
    y += 8;
  }
  // Footer
  ctx.strokeStyle = paper ? "rgba(139,94,32,0.15)" : "rgba(201,168,76,0.1)";
  ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(PAD, H - 28); ctx.lineTo(W - PAD, H - 28); ctx.stroke();
  ctx.font = "11px 'Cormorant Garamond', serif";
  ctx.fillStyle = paper ? "rgba(122,74,0,0.4)" : "rgba(201,168,76,0.4)";
  ctx.textAlign = "center"; ctx.direction = "ltr";
  ctx.fillText("daily-dua-kappa.vercel.app", W / 2, H - 10);

  canvas.toBlob(async (blob) => {
    const file = new File([blob], `${dua.title.replace(/\s+/g, "-")}.png`, { type: "image/png" });
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try { await navigator.share({ files: [file], title: dua.title }); return; } catch {}
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = file.name; a.click();
    URL.revokeObjectURL(url);
  }, "image/png");
}
