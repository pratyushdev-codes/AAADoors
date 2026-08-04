/* helpers */

export const uid = (p = "x") => p + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
export const pad = (n, w = 4) => String(n).padStart(w, "0");
export const todayISO = () => new Date().toISOString().slice(0, 10);
export const YY = () => String(new Date().getFullYear()).slice(2);

export function fmtNum(n) {
  const v = Number(n) || 0;
  return v.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}
export function fmtMoney(n, cur = "₹") {
  const v = Number(n) || 0;
  return cur + v.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}
export function fmtMoneyShort(n, cur = "₹") {
  const v = Math.abs(Number(n) || 0);
  if (v >= 1e7) return cur + (v / 1e7).toFixed(2) + " Cr";
  if (v >= 1e5) return cur + (v / 1e5).toFixed(2) + " L";
  if (v >= 1e3) return cur + (v / 1e3).toFixed(1) + "k";
  return cur + Math.round(v);
}
export function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
export function fmtDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) + ", " +
    d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}
export function relTime(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return Math.floor(diff / 60) + "m ago";
  if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
  if (diff < 604800) return Math.floor(diff / 86400) + "d ago";
  return fmtDate(iso);
}
export function initials(name) {
  return (name || "?").split(/\s+/).slice(0, 2).map((w) => w[0] || "").join("").toUpperCase();
}
export function daysAgoISO(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}
export function compressImage(file, maxW = 1100, q = 0.6) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onerror = () => reject(new Error("read"));
    fr.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("decode"));
      img.onload = () => {
        const sc = Math.min(1, maxW / img.width);
        const w = Math.round(img.width * sc), h = Math.round(img.height * sc);
        const c = document.createElement("canvas");
        c.width = w; c.height = h;
        const cx = c.getContext("2d");
        cx.fillStyle = "#fff"; cx.fillRect(0, 0, w, h);
        cx.drawImage(img, 0, 0, w, h);
        resolve(c.toDataURL("image/jpeg", q));
      };
      img.src = fr.result;
    };
    fr.readAsDataURL(file);
  });
}

/** Read an image or video file into a data URL attachment. Videos capped by maxBytes. */
export function readMediaFile(file, { maxBytes = 8 * 1024 * 1024 } = {}) {
  const isVideo = (file.type || "").startsWith("video/");
  const isImage = (file.type || "").startsWith("image/") || /\.(jpe?g|png|gif|webp|heic)$/i.test(file.name || "");
  if (!isImage && !isVideo) return Promise.reject(new Error("type"));
  if (isVideo) {
    if (file.size > maxBytes) return Promise.reject(new Error("size"));
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onerror = () => reject(new Error("read"));
      fr.onload = () => resolve({ kind: "video", data: fr.result, name: file.name || "video", mime: file.type || "video/mp4" });
      fr.readAsDataURL(file);
    });
  }
  return compressImage(file).then((data) => ({ kind: "image", data, name: file.name || "photo", mime: "image/jpeg" }));
}
export function toCSV(rows) {
  return rows.map((r) => r.map((c) => {
    const s = c === null || c === undefined ? "" : String(c);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }).join(",")).join("\n");
}
export function downloadCSV(name, rows) {
  try {
    const blob = new Blob(["\ufeff" + toCSV(rows)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 500);
    return true;
  } catch (e) { return false; }
}


