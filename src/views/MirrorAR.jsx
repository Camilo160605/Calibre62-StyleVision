/*
  Actividad complementaria de la guia de la semana 5.
  Esta vista deja evidencia de ciclos `for` para dibujar patrones repetitivos,
  condicionales para controlar fases del flujo y manejo de errores con
  `try/catch` durante la deteccion facial y el acceso a la camara.
*/
import { useState, useEffect, useRef, useCallback } from "react";
import { Navigate } from "react-router-dom";

// ── Google Fonts ──────────────────────────────────────────────────────────────
(() => {
  const l = document.createElement("link");
  l.rel = "stylesheet";
  l.href =
    "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=Syne:wght@600;700&family=DM+Sans:wght@300;400&display=swap";
  document.head.appendChild(l);
})();

// ── Color utils ───────────────────────────────────────────────────────────────
function tint(hex, amt) {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, ((n >> 16) & 255) + amt);
  const g = Math.min(255, ((n >> 8) & 255) + amt);
  const b = Math.min(255, (n & 255) + amt);
  return `rgb(${r},${g},${b})`;
}

// ── Hair Color Presets ────────────────────────────────────────────────────────
const COLORS = [
  { label: "Negro",    value: "#0d0805" },
  { label: "Castaño",  value: "#3d1f0d" },
  { label: "Rubio",    value: "#b07820" },
  { label: "Rojo",     value: "#6b1a0a" },
  { label: "Gris",     value: "#606060" },
  { label: "Blanco",   value: "#c8c0b0" },
];

// ── Hairstyle Draw Functions ──────────────────────────────────────────────────
// Signature: draw(ctx, cx, topY, faceW, faceH, hexColor)
const HAIRSTYLES = [
  {
    id: "fade", name: "Fade", icon: "◈",
    draw(ctx, cx, ty, fw, fh, color) {
      ctx.save();
      // Cap
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(cx - fw * 0.49, ty + fh * 0.04);
      ctx.bezierCurveTo(cx - fw * 0.51, ty - fh * 0.07, cx - fw * 0.3, ty - fh * 0.22, cx, ty - fh * 0.25);
      ctx.bezierCurveTo(cx + fw * 0.3, ty - fh * 0.22, cx + fw * 0.51, ty - fh * 0.07, cx + fw * 0.49, ty + fh * 0.04);
      ctx.closePath();
      ctx.fill();
      // Texture lines
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = tint(color, 28);
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 8; i++) {
        const sx = cx - fw * 0.36 + (fw * 0.72 / 7) * i;
        ctx.beginPath();
        ctx.moveTo(sx, ty + fh * 0.02);
        ctx.quadraticCurveTo(sx, ty - fh * 0.1, sx + fw * 0.01, ty - fh * 0.2);
        ctx.stroke();
      }
      ctx.restore();
    },
  },
  {
    id: "pompadour", name: "Pompadour", icon: "◉",
    draw(ctx, cx, ty, fw, fh, color) {
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(cx - fw * 0.45, ty + fh * 0.03);
      ctx.bezierCurveTo(cx - fw * 0.47, ty - fh * 0.12, cx - fw * 0.12, ty - fh * 0.54, cx + fw * 0.1, ty - fh * 0.58);
      ctx.bezierCurveTo(cx + fw * 0.36, ty - fh * 0.5,  cx + fw * 0.51, ty - fh * 0.28, cx + fw * 0.47, ty + fh * 0.02);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 0.4;
      ctx.strokeStyle = tint(color, 38);
      ctx.lineWidth = 1.6;
      for (let i = 0; i < 6; i++) {
        const t = i / 5;
        ctx.beginPath();
        ctx.moveTo(cx - fw * 0.3 + fw * 0.18 * t, ty + fh * 0.01);
        ctx.quadraticCurveTo(cx - fw * 0.04 + fw * 0.14 * t, ty - fh * 0.3, cx + fw * 0.09 + fw * 0.18 * t, ty - fh * 0.52);
        ctx.stroke();
      }
      ctx.restore();
    },
  },
  {
    id: "afro", name: "Afro", icon: "◎",
    draw(ctx, cx, ty, fw, fh, color) {
      ctx.save();
      ctx.globalAlpha = 0.88;
      ctx.fillStyle = color;
      const r = fw * 0.66;
      const acy = ty - fh * 0.1;
      ctx.beginPath();
      const segs = 22;
      for (let i = 0; i <= segs; i++) {
        const angle = Math.PI + (Math.PI * i) / segs;
        const bump = r + Math.sin(i * 3.7) * fw * 0.045;
        const x = cx + Math.cos(angle) * bump;
        const y = acy + Math.sin(angle) * bump * 0.88;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.lineTo(cx + fw * 0.52, ty + fh * 0.04);
      ctx.lineTo(cx - fw * 0.52, ty + fh * 0.04);
      ctx.closePath();
      ctx.fill();
      // Coil texture
      ctx.globalAlpha = 0.28;
      ctx.strokeStyle = tint(color, 45);
      ctx.lineWidth = 1;
      for (let i = 0; i < 14; i++) {
        const angle = Math.PI + (Math.PI * i) / 13;
        const rx = cx + Math.cos(angle) * r * 0.54;
        const ry = acy + Math.sin(angle) * r * 0.5;
        ctx.beginPath();
        ctx.arc(rx, ry, fw * 0.038, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    },
  },
  {
    id: "undercut", name: "Undercut", icon: "◇",
    draw(ctx, cx, ty, fw, fh, color) {
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(cx - fw * 0.47, ty + fh * 0.03);
      ctx.bezierCurveTo(cx - fw * 0.45, ty - fh * 0.24, cx - fw * 0.08, ty - fh * 0.38, cx + fw * 0.06, ty - fh * 0.42);
      ctx.bezierCurveTo(cx + fw * 0.29, ty - fh * 0.37, cx + fw * 0.51, ty - fh * 0.18, cx + fw * 0.48, ty + fh * 0.03);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 0.42;
      ctx.strokeStyle = tint(color, 32);
      ctx.lineWidth = 1.8;
      for (let i = 0; i < 7; i++) {
        const t = i / 6;
        ctx.beginPath();
        ctx.moveTo(cx - fw * 0.36 + fw * 0.72 * t, ty + fh * 0.01);
        ctx.quadraticCurveTo(cx - fw * 0.08 + fw * 0.2 * t, ty - fh * 0.19, cx + fw * 0.06 + fw * 0.16 * t, ty - fh * 0.37);
        ctx.stroke();
      }
      ctx.restore();
    },
  },
  {
    id: "longhair", name: "Larga", icon: "◌",
    draw(ctx, cx, ty, fw, fh, color) {
      ctx.save();
      ctx.globalAlpha = 0.86;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(cx - fw * 0.51, ty + fh * 0.08);
      ctx.bezierCurveTo(cx - fw * 0.53, ty - fh * 0.1, cx - fw * 0.28, ty - fh * 0.3, cx, ty - fh * 0.32);
      ctx.bezierCurveTo(cx + fw * 0.28, ty - fh * 0.3,  cx + fw * 0.53, ty - fh * 0.1, cx + fw * 0.51, ty + fh * 0.08);
      ctx.bezierCurveTo(cx + fw * 0.55, ty + fh * 0.55, cx + fw * 0.52, ty + fh * 0.85, cx + fw * 0.48, ty + fh * 1.05);
      ctx.lineTo(cx - fw * 0.48, ty + fh * 1.05);
      ctx.bezierCurveTo(cx - fw * 0.52, ty + fh * 0.85, cx - fw * 0.55, ty + fh * 0.55, cx - fw * 0.51, ty + fh * 0.08);
      ctx.closePath();
      ctx.fill();
      // Strand lines down
      ctx.globalAlpha = 0.38;
      ctx.strokeStyle = tint(color, 30);
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 8; i++) {
        const t = i / 7;
        const sx = cx - fw * 0.42 + fw * 0.84 * t;
        const drift = (t - 0.5) * fw * 0.1;
        ctx.beginPath();
        ctx.moveTo(sx, ty);
        ctx.bezierCurveTo(sx + drift * 0.5, ty + fh * 0.4, sx + drift, ty + fh * 0.75, sx + drift * 0.8, ty + fh * 1.0);
        ctx.stroke();
      }
      ctx.restore();
    },
  },
];

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
  @keyframes fadeIn { from{opacity:0}to{opacity:1} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)} }
  @keyframes shimmer { 0%{background-position:-200% center}100%{background-position:200% center} }
  @keyframes scanDown { 0%{top:0%;opacity:.8}100%{top:100%;opacity:0} }
  @keyframes pulseRing {
    0%{transform:scale(.95);opacity:.6}
    70%{transform:scale(1.1);opacity:0}
    100%{transform:scale(.95);opacity:0}
  }
  @keyframes blink { 0%,100%{opacity:.4}50%{opacity:1} }

  *{box-sizing:border-box;margin:0;padding:0}

  .root {
    width:100%;min-height:100vh;
    background:#060402;
    font-family:'DM Sans',sans-serif;
    color:#e8dcc8;
    display:flex;flex-direction:column;
    position:relative;overflow:hidden;
  }

  /* ambient lights */
  .amb {
    position:fixed;width:500px;height:500px;border-radius:50%;
    filter:blur(110px);pointer-events:none;z-index:0;
  }
  .amb-gold { background:radial-gradient(circle,rgba(196,160,96,.1) 0%,transparent 70%);top:-150px;right:-100px; }
  .amb-cop  { background:radial-gradient(circle,rgba(160,80,40,.07) 0%,transparent 70%);bottom:-180px;left:-120px; }

  /* ── IDLE ── */
  .idle {
    flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;
    gap:0;padding:48px 24px;position:relative;z-index:1;
    animation:fadeIn .5s ease;
  }
  .idle-logo {
    font-family:'Cormorant Garamond',serif;
    font-size:clamp(80px,15vw,130px);
    font-weight:300;letter-spacing:-3px;line-height:1;
    background:linear-gradient(135deg,#c4a060 0%,#e8c87a 40%,#a07840 70%,#c4a060 100%);
    background-size:200% auto;
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
    animation:shimmer 4s linear infinite;
  }
  .idle-sub {
    font-family:'Syne',sans-serif;font-size:11px;letter-spacing:6px;
    color:#5a4a2a;text-transform:uppercase;margin-bottom:52px;
  }
  .idle-card {
    border:1px solid rgba(196,160,96,.12);
    padding:40px 48px;text-align:center;
    max-width:400px;position:relative;margin-bottom:40px;
  }
  .idle-card::before {
    content:'';position:absolute;top:0;left:0;right:0;height:1px;
    background:linear-gradient(90deg,transparent,#c4a060,transparent);
  }
  .idle-icon-wrap {
    position:relative;width:72px;height:72px;
    display:flex;align-items:center;justify-content:center;
    margin:0 auto 24px;
  }
  .idle-ring {
    position:absolute;inset:0;border:1px solid rgba(196,160,96,.25);
    border-radius:50%;animation:pulseRing 2.5s ease-out infinite;
  }
  .idle-ring:nth-child(2){animation-delay:.8s}
  .idle-ring:nth-child(3){animation-delay:1.6s}
  .idle-icon-inner {
    width:48px;height:48px;border-radius:50%;
    border:1px solid rgba(196,160,96,.4);
    background:rgba(196,160,96,.05);
    display:flex;align-items:center;justify-content:center;
    position:relative;z-index:1;
  }
  .idle-desc {
    font-size:13px;color:#4a3820;line-height:1.8;letter-spacing:.3px;
    margin-bottom:32px;
  }
  .idle-features {
    display:flex;gap:24px;justify-content:center;margin-bottom:0;
  }
  .feat {
    display:flex;flex-direction:column;align-items:center;gap:4px;
    font-size:10px;letter-spacing:2px;color:#3a2a10;text-transform:uppercase;
  }
  .feat-dot {
    width:6px;height:6px;border-radius:50%;
    background:rgba(196,160,96,.4);
  }
  .idle-btn {
    background:transparent;border:1px solid rgba(196,160,96,.45);
    color:#c4a060;font-family:'Syne',sans-serif;
    font-size:11px;letter-spacing:4px;text-transform:uppercase;
    padding:16px 52px;cursor:pointer;transition:all .3s;
    position:relative;overflow:hidden;
  }
  .idle-btn::before {
    content:'';position:absolute;inset:0;
    background:linear-gradient(135deg,rgba(196,160,96,.08),transparent);
    opacity:0;transition:opacity .3s;
  }
  .idle-btn:hover::before{opacity:1}
  .idle-btn:hover{border-color:rgba(196,160,96,.9);box-shadow:0 0 32px rgba(196,160,96,.18)}

  /* ── AR VIEW ── */
  .ar-view {
    flex:1;display:flex;flex-direction:column;
    position:relative;min-height:100vh;
    animation:fadeIn .4s ease;
  }
  .canvas-wrap {
    flex:1;position:relative;background:#000;
    display:flex;align-items:center;justify-content:center;
    overflow:hidden;min-height:0;
  }
  .ar-canvas {
    max-width:100%;max-height:calc(100vh - 192px);
    display:block;
    transform:scaleX(-1); /* mirror flip */
    object-fit:cover;
  }
  .scan-overlay {
    position:absolute;inset:0;pointer-events:none;
    border:1px solid rgba(196,160,96,.06);
  }
  .scan-line {
    position:absolute;left:0;right:0;height:1px;
    background:linear-gradient(90deg,transparent,rgba(196,160,96,.35),transparent);
    animation:scanDown 3.5s ease-in-out infinite;
  }
  .corner {
    position:absolute;width:18px;height:18px;
    border-color:rgba(196,160,96,.35);border-style:solid;
  }
  .corner-tl{top:12px;left:12px;border-width:1.5px 0 0 1.5px}
  .corner-tr{top:12px;right:12px;border-width:1.5px 1.5px 0 0}
  .corner-bl{bottom:12px;left:12px;border-width:0 0 1.5px 1.5px}
  .corner-br{bottom:12px;right:12px;border-width:0 1.5px 1.5px 0}

  .ar-header {
    position:absolute;top:0;left:0;right:0;
    display:flex;align-items:center;justify-content:space-between;
    padding:14px 20px;
    background:linear-gradient(to bottom,rgba(0,0,0,.65),transparent);
    pointer-events:none;
  }
  .ar-logo { font-family:'Cormorant Garamond',serif;font-size:18px;color:#c4a060;letter-spacing:2px; }
  .face-status {
    font-family:'Syne',sans-serif;font-size:9px;letter-spacing:3px;
    text-transform:uppercase;padding:5px 11px;
    border:1px solid rgba(196,160,96,.25);
    background:rgba(0,0,0,.5);color:#c4a060;
  }
  .face-dot {
    display:inline-block;width:5px;height:5px;border-radius:50%;
    margin-right:6px;vertical-align:middle;
    animation:blink 1.5s ease-in-out infinite;
  }
  .dot-on{background:#4a9060}
  .dot-off{background:#6a4a2a}

  /* ── PANEL ── */
  .panel {
    background:#080603;
    border-top:1px solid rgba(196,160,96,.1);
    flex-shrink:0;padding:14px 0 16px;
  }
  .styles-scroll {
    display:flex;gap:8px;overflow-x:auto;
    padding:0 16px 12px;scrollbar-width:none;
  }
  .styles-scroll::-webkit-scrollbar{display:none}
  .chip {
    flex-shrink:0;background:transparent;
    border:1px solid rgba(196,160,96,.14);
    color:#5a4a28;font-family:'Syne',sans-serif;
    font-size:9px;letter-spacing:2px;text-transform:uppercase;
    padding:8px 14px;cursor:pointer;transition:all .2s;
    display:flex;flex-direction:column;align-items:center;gap:3px;
    min-width:60px;
  }
  .chip.on{border-color:rgba(196,160,96,.65);color:#c4a060;background:rgba(196,160,96,.06)}
  .chip:hover:not(.on){border-color:rgba(196,160,96,.32);color:#9a7a38}
  .chip-icon{font-size:15px}
  .chip-lbl{font-size:8px}

  .controls-row {
    display:flex;align-items:center;justify-content:space-between;
    padding:0 16px;gap:10px;
  }
  .back-btn {
    background:transparent;border:none;
    color:#3a2a10;font-family:'Syne',sans-serif;
    font-size:9px;letter-spacing:3px;text-transform:uppercase;
    cursor:pointer;transition:color .2s;padding:8px 4px;flex-shrink:0;
  }
  .back-btn:hover{color:#c4a060}

  .color-row {
    display:flex;gap:6px;align-items:center;
  }
  .cdot {
    width:18px;height:18px;border-radius:50%;
    cursor:pointer;transition:transform .2s;
    border:1.5px solid transparent;flex-shrink:0;
  }
  .cdot:hover{transform:scale(1.2)}
  .cdot.on{border-color:#c4a060;transform:scale(1.2)}

  .capture-btn {
    width:52px;height:52px;border-radius:50%;
    background:transparent;
    border:2px solid rgba(196,160,96,.55);
    cursor:pointer;display:flex;align-items:center;justify-content:center;
    transition:all .3s;flex-shrink:0;position:relative;
  }
  .capture-btn::before {
    content:'';position:absolute;inset:5px;border-radius:50%;
    background:rgba(196,160,96,.12);transition:background .3s;
  }
  .capture-btn:hover::before{background:rgba(196,160,96,.3)}
  .capture-btn:hover{border-color:#c4a060;box-shadow:0 0 22px rgba(196,160,96,.28)}
  .capture-btn:active{transform:scale(.95)}

  .upload-btn {
    background:transparent;
    border:1px solid rgba(196,160,96,.14);
    color:#4a3818;font-family:'Syne',sans-serif;
    font-size:8px;letter-spacing:2px;text-transform:uppercase;
    padding:7px 11px;cursor:pointer;transition:all .2s;
    white-space:nowrap;flex-shrink:0;
  }
  .upload-btn:hover{border-color:rgba(196,160,96,.38);color:#c4a060}

  /* ── CAPTURED ── */
  .captured {
    flex:1;display:flex;flex-direction:column;align-items:center;
    justify-content:center;gap:20px;padding:36px 20px;
    animation:fadeUp .45s ease;
  }
  .cap-title {
    font-family:'Cormorant Garamond',serif;
    font-size:clamp(24px,5vw,38px);
    color:#c4a060;font-weight:300;letter-spacing:2px;text-align:center;
  }
  .cap-sub {
    font-size:11px;letter-spacing:3px;color:#4a3818;
    text-transform:uppercase;margin-top:-12px;
  }
  .cap-img {
    max-width:min(100%, 520px);
    border:1px solid rgba(196,160,96,.2);
    display:block;
    transform:scaleX(-1);
  }
  .cap-actions {
    display:flex;gap:10px;flex-wrap:wrap;justify-content:center;
  }
  .act {
    background:transparent;cursor:pointer;
    font-family:'Syne',sans-serif;
    font-size:9px;letter-spacing:3px;text-transform:uppercase;
    padding:11px 26px;transition:all .3s;
    border:1px solid rgba(196,160,96,.18);
    color:#4a3818;
  }
  .act:hover{border-color:rgba(196,160,96,.5);color:#c4a060}
  .act.gold{border-color:rgba(196,160,96,.5);color:#c4a060}
  .act.gold:hover{background:rgba(196,160,96,.08);box-shadow:0 0 20px rgba(196,160,96,.15)}

  /* ── PERMISSION ERROR ── */
  .err {
    flex:1;display:flex;flex-direction:column;align-items:center;
    justify-content:center;gap:16px;padding:40px 20px;
    text-align:center;
  }
  .err-title{font-family:'Cormorant Garamond',serif;font-size:28px;color:#c4a060;font-weight:300;}
  .err-msg{font-size:13px;color:#4a3818;line-height:1.7;max-width:300px;}
  .err-btn{
    background:transparent;border:1px solid rgba(196,160,96,.3);
    color:#c4a060;font-family:'Syne',sans-serif;
    font-size:10px;letter-spacing:3px;text-transform:uppercase;
    padding:12px 32px;cursor:pointer;transition:all .3s;margin-top:8px;
  }
  .err-btn:hover{border-color:#c4a060;box-shadow:0 0 20px rgba(196,160,96,.15)}
`;

  // ── Component ─────────────────────────────────────────────────────────────────
  export default function MirrorAR() {
    const [phase, setPhase]           = useState("idle"); // idle|ar|captured|error
    const [styleIdx, setStyleIdx]     = useState(0);
    const [colorIdx, setColorIdx]     = useState(0);
    const [faceOn, setFaceOn]         = useState(false);
    const [capturedUrl, setCapturedUrl] = useState(null);
    const [customs, setCustoms]       = useState([]);

    const videoRef    = useRef(null);
    const canvasRef   = useRef(null);
    const animRef     = useRef(null);
    const detectorRef = useRef(null);
    const faceBoxRef  = useRef(null); // { cx, ty, fw, fh } in video coords
    const streamRef   = useRef(null);
    const uploadRef   = useRef(null);

    // ── Camera ─────────────────────────────────────────────────────────────────
    const startCamera = useCallback(async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setPhase("ar");
      } catch {
        setPhase("error");
      }
    }, []);

    const stopCamera = useCallback(() => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      cancelAnimationFrame(animRef.current);
    }, []);

    // ── Face Detection Loop ────────────────────────────────────────────────────
    useEffect(() => {
      if (phase !== "ar") return;
      let active = true;

      const loop = async () => {
        if (!active) return;
        const vid = videoRef.current;
        if (!vid || vid.readyState < 2) { setTimeout(loop, 200); return; }

        const vw = vid.videoWidth || 640;
        const vh = vid.videoHeight || 480;

        if ("FaceDetector" in window) {
          if (!detectorRef.current)
            detectorRef.current = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
          try {
            const faces = await detectorRef.current.detect(vid);
            if (faces.length > 0) {
              const f = faces[0].boundingBox;
              // Mirror-adjust X because canvas is CSS-flipped
              faceBoxRef.current = {
                cx: vw - (f.x + f.width / 2),
                ty: f.y,
                fw: f.width,
                fh: f.height,
              };
              if (active) setFaceOn(true);
            } else {
              faceBoxRef.current = null;
              if (active) setFaceOn(false);
            }
          } catch {
            faceBoxRef.current = null;
            if (active) setFaceOn(false);
          }
        } else {
          // Fallback — center estimate
          faceBoxRef.current = {
            cx: vw / 2,
            ty: vh * 0.2,
            fw: vw * 0.38,
            fh: vh * 0.55,
          };
          if (active) setFaceOn(false);
        }
        if (active) setTimeout(loop, 260);
      };

      loop();
      return () => { active = false; };
    }, [phase]);

    // ── Draw Loop ──────────────────────────────────────────────────────────────
    useEffect(() => {
      if (phase !== "ar") return;

      const draw = () => {
        const canvas = canvasRef.current;
        const vid    = videoRef.current;
        if (!canvas || !vid || vid.readyState < 2) {
          animRef.current = requestAnimationFrame(draw);
          return;
        }
        const vw = vid.videoWidth;
        const vh = vid.videoHeight;
        if (canvas.width !== vw)  canvas.width  = vw;
        if (canvas.height !== vh) canvas.height = vh;

        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, vw, vh);
        ctx.drawImage(vid, 0, 0, vw, vh);

        const fb = faceBoxRef.current;
        if (fb) {
          const color = COLORS[colorIdx].value;
          if (styleIdx < HAIRSTYLES.length) {
            HAIRSTYLES[styleIdx].draw(ctx, fb.cx, fb.ty, fb.fw, fb.fh, color);
          } else {
            const custom = customs[styleIdx - HAIRSTYLES.length];
            if (custom) {
              const w = fb.fw * 1.4;
              const h = fb.fh * 0.9;
              ctx.save();
              ctx.globalAlpha = 0.88;
              ctx.drawImage(custom.img, fb.cx - w / 2, fb.ty - h * 0.3, w, h);
              ctx.restore();
            }
          }
        }
        animRef.current = requestAnimationFrame(draw);
      };

      animRef.current = requestAnimationFrame(draw);
      return () => cancelAnimationFrame(animRef.current);
    }, [phase, styleIdx, colorIdx, customs]);

    // ── Capture ────────────────────────────────────────────────────────────────
    const capture = useCallback(() => {
      const url = canvasRef.current?.toDataURL("image/jpeg", 0.93);
      if (!url) return;
      setCapturedUrl(url);
      stopCamera();
      setPhase("captured");
    }, [stopCamera]);

    // ── Upload custom hairstyle ────────────────────────────────────────────────
    const onUpload = useCallback((e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          setCustoms((prev) => {
            const next = [...prev, { name: file.name.replace(/\.[^.]+$/, ""), img }];
            setStyleIdx(HAIRSTYLES.length + next.length - 1);
            return next;
          });
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    }, []);

    // ── Download ───────────────────────────────────────────────────────────────
    const download = () => {
      const a = document.createElement("a");
      a.href = capturedUrl;
      a.download = "calibre62-look.jpg";
      a.click();
    };

    const retryAR = async () => {
      setCapturedUrl(null);
      await startCamera();
    };

    // ── Cleanup ────────────────────────────────────────────────────────────────
    useEffect(() => () => stopCamera(), [stopCamera]);

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
      <>
        <style>{CSS}</style>
        <video ref={videoRef} style={{ display: "none" }} playsInline muted />
        <input ref={uploadRef} type="file" accept="image/png,image/webp" style={{ display: "none" }} onChange={onUpload} />

        <div className="root">
          <div className="amb amb-gold" />
          <div className="amb amb-cop"  />

          {/* ── IDLE ── */}
          {phase === "idle" && (
            <div className="idle">
              <div className="idle-logo">62</div>
              <div className="idle-sub">Calibre · Espejo Virtual</div>

              <div className="idle-card">
                <div className="idle-icon-wrap">
                  <div className="idle-ring" />
                  <div className="idle-ring" />
                  <div className="idle-ring" />
                  <div className="idle-icon-inner">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="8" r="4" stroke="#c4a060" strokeWidth="1.2"/>
                      <path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke="#c4a060" strokeWidth="1.2" strokeLinecap="round"/>
                      <path d="M19 3l2 2-2 2M19 3h-3" stroke="#c4a060" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>

                <p className="idle-desc">
                  Activa la cámara y prueba diferentes<br/>
                  estilos de corte en tiempo real,<br/>
                  sin necesidad de cortarte el cabello.
                </p>

                <div className="idle-features">
                  <div className="feat"><div className="feat-dot"/><span>5 Estilos</span></div>
                  <div className="feat"><div className="feat-dot"/><span>6 Colores</span></div>
                  <div className="feat"><div className="feat-dot"/><span>Captura</span></div>
                </div>
              </div>

              <button className="idle-btn" onClick={startCamera}>
                ◈ &nbsp; Activar Espejo
              </button>
            </div>
          )}

          {/* ── AR VIEW ── */}
          {phase === "ar" && (
            <div className="ar-view">
              <div className="canvas-wrap">
                <canvas ref={canvasRef} className="ar-canvas" />
                <div className="scan-overlay">
                  <div className="scan-line" />
                  <div className="corner corner-tl" />
                  <div className="corner corner-tr" />
                  <div className="corner corner-bl" />
                  <div className="corner corner-br" />
                </div>
                <div className="ar-header">
                  <div className="ar-logo">CALIBRE 62</div>
                  <div className="face-status">
                    <span className={`face-dot ${faceOn ? "dot-on" : "dot-off"}`} />
                    {faceOn ? "Rostro detectado" : "Centra tu rostro"}
                  </div>
                </div>
              </div>

              {/* Bottom panel */}
              <div className="panel">
                {/* Hairstyle chips */}
                <div className="styles-scroll">
                  {HAIRSTYLES.map((s, i) => (
                    <button key={s.id} className={`chip ${styleIdx === i ? "on" : ""}`} onClick={() => setStyleIdx(i)}>
                      <span className="chip-icon">{s.icon}</span>
                      <span className="chip-lbl">{s.name}</span>
                    </button>
                  ))}
                  {customs.map((s, i) => (
                    <button key={`c${i}`} className={`chip ${styleIdx === HAIRSTYLES.length + i ? "on" : ""}`} onClick={() => setStyleIdx(HAIRSTYLES.length + i)}>
                      <span className="chip-icon">◆</span>
                      <span className="chip-lbl">{s.name.slice(0, 8)}</span>
                    </button>
                  ))}
                </div>

                {/* Colors + Capture + Back */}
                <div className="controls-row">
                  <button className="back-btn" onClick={() => { stopCamera(); setPhase("idle"); }}>
                    ← Salir
                  </button>

                  <div className="color-row">
                    {COLORS.map((c, i) => (
                      <div
                        key={c.value}
                        className={`cdot ${colorIdx === i ? "on" : ""}`}
                        style={{ background: c.value === "#0d0805" ? "#1c1008" : c.value }}
                        title={c.label}
                        onClick={() => setColorIdx(i)}
                      />
                    ))}
                  </div>

                  <button className="capture-btn" onClick={capture} title="Capturar look">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" style={{position:"relative",zIndex:1}}>
                      <circle cx="12" cy="12" r="4.5" stroke="#c4a060" strokeWidth="1.4"/>
                      <path d="M3 9a2 2 0 012-2h1.5L8 4h8l1.5 3H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="#c4a060" strokeWidth="1.4"/>
                    </svg>
                  </button>

                  <button className="upload-btn" onClick={() => uploadRef.current.click()}>
                    + Subir PNG
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── CAPTURED ── */}
          {phase === "captured" && capturedUrl && (
            <div className="captured">
              <div className="cap-title">Tu Nuevo Look</div>
              <div className="cap-sub">{HAIRSTYLES[styleIdx]?.name ?? "Estilo personalizado"} · {COLORS[colorIdx].label}</div>
              <img src={capturedUrl} className="cap-img" alt="Look capturado" />
              <div className="cap-actions">
                <button className="act gold" onClick={download}>↓ Descargar</button>
                <button className="act"      onClick={retryAR}>↺ Probar otro</button>
                <button className="act"      onClick={() => { setCapturedUrl(null); setPhase("idle"); }}>← Inicio</button>
              </div>
            </div>
          )}

          {/* ── ERROR ── */}
          {phase === "error" && (
            <div className="err">
              <div className="err-title">Sin acceso a cámara</div>
              <p className="err-msg">
                Para usar el espejo virtual necesitas permitir el acceso a la cámara en tu navegador.
              </p>
              <button className="err-btn" onClick={() => setPhase("idle")}>← Volver al inicio</button>
            </div>
          )}
        </div>
      </>
    );
  }
