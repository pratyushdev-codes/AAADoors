"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { store, K_DB, K_MOV, K_PHOTO, K_TICKETS, K_TICKET_MEDIA } from "@/lib/store";
import {
  uid, pad, todayISO, YY, fmtNum, fmtMoney, fmtMoneyShort, fmtDate, fmtDateTime,
  relTime, initials, daysAgoISO, compressImage, readMediaFile, downloadCSV,
} from "@/lib/helpers";
import {
  CATS, catLabel, UNITS, MOVE, PERMS, ROLES, presetPerms, can, visibleFacilities,
} from "@/lib/domain";
import { seedDB, seedMovements } from "@/lib/seed";
import { buildStock, availableAt, lineTotal, movementValue, movementQty } from "@/lib/stock";


/* ---------------------------------------------------------------- brand mark */
function Logo({ h = 30, mono = false }) {
  return (
    <img
      src="/logo.png"
      alt="AAA Doors LTD"
      height={h}
      style={{
        display: "block",
        height: h,
        width: "auto",
        maxWidth: "100%",
        ...(mono
          ? { background: "#fff", borderRadius: 8, padding: "6px 10px", boxSizing: "content-box" }
          : null),
      }}
    />
  );
}

/* ---------------------------------------------------------------- icons */
const I = {
  grid: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  inbox: "M12 3v12m0 0l-4-4m4 4l4-4M4 15v4a2 2 0 002 2h12a2 2 0 002-2v-4",
  truck: "M3 7h11v10H3zM14 10h4l3 3v4h-7zM7.5 20a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM17.5 20a1.5 1.5 0 100-3 1.5 1.5 0 000 3z",
  layers: "M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 17l9 5 9-5",
  list: "M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01",
  tag: "M3 3h8l10 10-8 8L3 11V3zM7.5 7.5h.01",
  home: "M3 10.5L12 3l9 7.5M5.5 9.5V20a1 1 0 001 1h11a1 1 0 001-1V9.5",
  users: "M16 20v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 10a4 4 0 100-8 4 4 0 000 8zM22 20v-2a4 4 0 00-3-3.87M16 3.13A4 4 0 0119 7a4 4 0 01-3 3.87",
  gear: "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 008.6 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 8.6a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z",
  plus: "M12 5v14M5 12h14",
  x: "M18 6L6 18M6 6l12 12",
  cam: "M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2zM12 17a4 4 0 100-8 4 4 0 000 8z",
  chk: "M20 6L9 17l-5-5",
  warn: "M12 9v4m0 4h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z",
  print: "M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z",
  down: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3",
  search: "M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35",
  edit: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4z",
  trash: "M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6",
  lock: "M5 11h14v10H5zM8 11V7a4 4 0 018 0v4",
  out: "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9",
  bldg: "M3 21h18M5 21V5a2 2 0 012-2h6a2 2 0 012 2v16M15 21V11h4a2 2 0 012 2v8M8 7h2M8 11h2M8 15h2",
  arrow: "M5 12h14M13 6l6 6-6 6",
  clock: "M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2",
  eye: "M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7zM12 15a3 3 0 100-6 3 3 0 000 6z",
  ticket: "M3 9a2 2 0 012-2h14a2 2 0 012 2v1a2 2 0 00-2 2 2 2 0 002 2v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1a2 2 0 002-2 2 2 0 00-2-2V9zM9 7v10",
  clip: "M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48",
};
function Ic({ d, s = 18, w = 1.9, cls = "ic" }) {
  return (
    <svg className={cls} width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

/* ---------------------------------------------------------------- primitives */
function Modal({ title, sub, onClose, children, footer, wide, id }) {
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div className="ovl" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={"modal" + (wide ? " wide" : "")} id={id} role="dialog" aria-modal="true">
        {title && (
          <div className="modal-h no-print">
            <div style={{ minWidth: 0 }}>
              <h3 className="h-page" style={{ fontSize: 20 }}>{title}</h3>
              {sub && <div className="tiny dim" style={{ marginTop: 2 }}>{sub}</div>}
            </div>
            <div className="spacer" />
            <button className="x" onClick={onClose} aria-label="Close"><Ic d={I.x} s={19} /></button>
          </div>
        )}
        {children}
        {footer && <div className="modal-f no-print">{footer}</div>}
      </div>
    </div>
  );
}

function Field({ label, req, hint, error, children }) {
  return (
    <div className="f">
      {label && <label>{label}{req && <span className="req"> *</span>}</label>}
      {children}
      {error ? <div className="hint e">{error}</div> : hint ? <div className="hint">{hint}</div> : null}
    </div>
  );
}

function Stat({ label, value, unit, sub, tone, icon }) {
  return (
    <div className={"stat" + (tone ? " " + tone : "")}>
      <div className="eyebrow">{label}</div>
      <div className="stat-v">{value}{unit && <span className="u">{unit}</span>}</div>
      {sub && <div className="stat-s">{icon && <Ic d={icon} s={13} />}{sub}</div>}
    </div>
  );
}

function Chip({ type, children }) {
  return <span className={"chip " + (type || "")}>{children}</span>;
}

function MoveChip({ type }) {
  const m = MOVE[type] || MOVE.IN;
  return <span className={"chip " + m.chip}>{m.label}</span>;
}

function Empty({ icon, title, body, action }) {
  return (
    <div className="empty">
      <div className="ei"><Ic d={icon || I.inbox} s={44} w={1.4} cls="" /></div>
      <h4>{title}</h4>
      <p>{body}</p>
      {action}
    </div>
  );
}

function useToasts() {
  const [list, setList] = useState([]);
  const push = useCallback((msg, bad) => {
    const id = uid("t");
    setList((l) => [...l, { id, msg, bad }]);
    setTimeout(() => setList((l) => l.filter((t) => t.id !== id)), 3600);
  }, []);
  const node = (
    <div className="toasts no-print" aria-live="polite">
      {list.map((t) => (
        <div key={t.id} className={"toast" + (t.bad ? " bad" : "")}>
          <Ic d={t.bad ? I.warn : I.chk} s={17} />
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
  return [push, node];
}

/* --------- charts (hand drawn svg, no deps) --------- */
function FlowChart({ data, cur }) {
  // data: [{label, inQty, outQty}]
  const max = Math.max(1, ...data.map((d) => Math.max(d.inQty, d.outQty)));
  const W = 100 / data.length;
  return (
    <div>
      <svg viewBox="0 0 100 42" preserveAspectRatio="none" style={{ width: "100%", height: 150, display: "block", overflow: "visible" }} role="img" aria-label="Stock in and out over the last 14 days">
        {[0, 1, 2].map((g) => (
          <line key={g} x1="0" x2="100" y1={2 + g * 12} y2={2 + g * 12} stroke="#E8E8E8" strokeWidth=".3" vectorEffect="non-scaling-stroke" />
        ))}
        {data.map((d, i) => {
          const bw = W * 0.32;
          const x = i * W + W * 0.16;
          const hIn = (d.inQty / max) * 36;
          const hOut = (d.outQty / max) * 36;
          return (
            <g key={i}>
              <rect x={x} y={38 - hIn} width={bw} height={Math.max(hIn, d.inQty ? 0.6 : 0)} fill="#8C2528" rx=".4" />
              <rect x={x + bw + W * 0.05} y={38 - hOut} width={bw} height={Math.max(hOut, d.outQty ? 0.6 : 0)} fill="#AF3034" rx=".4" />
            </g>
          );
        })}
        <line x1="0" x2="100" y1="38" y2="38" stroke="#D4D4D4" strokeWidth=".5" vectorEffect="non-scaling-stroke" />
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        {data.map((d, i) => (
          <div key={i} className="mono" style={{ fontSize: 9.5, color: "var(--faint)", flex: 1, textAlign: "center" }}>
            {i % 2 === 0 ? d.label : ""}
          </div>
        ))}
      </div>
    </div>
  );
}

function FacilityBars({ rows, showValue, cur }) {
  const max = Math.max(1, ...rows.map((r) => r.qty));
  return (
    <div className="grid" style={{ gap: 13 }}>
      {rows.map((r) => (
        <div key={r.id}>
          <div className="row" style={{ marginBottom: 5 }}>
            <span style={{ fontWeight: 600, fontSize: 13 }}>{r.name}</span>
            <div className="spacer" />
            <span className="mono tiny">{fmtNum(r.qty)} units</span>
            {showValue && <span className="mono tiny dim" style={{ marginLeft: 10 }}>{fmtMoneyShort(r.value, cur)}</span>}
          </div>
          <div className="bar-t"><div className="bar-f" style={{ width: Math.max(2, (r.qty / max) * 100) + "%" }} /></div>
        </div>
      ))}
    </div>
  );
}

/* --------- photo capture --------- */
function PhotoPicker({ photos, setPhotos, max = 4, onError }) {
  const camRef = useRef(null);
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const handle = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    setBusy(true);
    try {
      const room = max - photos.length;
      const picked = files.slice(0, Math.max(0, room));
      const outs = [];
      for (const f of picked) {
        try { outs.push(await compressImage(f)); }
        catch (err) { onError && onError("Could not read that image. Try another file."); }
      }
      if (outs.length) setPhotos([...photos, ...outs]);
      if (files.length > room) onError && onError("Only " + max + " photos per entry. Extras were skipped.");
    } finally { setBusy(false); }
  };

  return (
    <div>
      <input ref={camRef} type="file" accept="image/*" capture="environment" multiple onChange={handle} className="sr" tabIndex={-1} />
      <input ref={fileRef} type="file" accept="image/*" multiple onChange={handle} className="sr" tabIndex={-1} />
      <div className="row wrap-r" style={{ marginBottom: photos.length ? 11 : 0 }}>
        <button type="button" className="btn line sm" disabled={busy || photos.length >= max} onClick={() => camRef.current && camRef.current.click()}>
          <Ic d={I.cam} s={15} /> {busy ? "Working…" : "Take photo"}
        </button>
        <button type="button" className="btn ghost sm" disabled={busy || photos.length >= max} onClick={() => fileRef.current && fileRef.current.click()}>
          Choose file
        </button>
        <span className="hint">{photos.length}/{max}</span>
      </div>
      {photos.length > 0 && (
        <div className="photo-strip">
          {photos.map((p, i) => (
            <div key={i} style={{ position: "relative" }}>
              <img src={p} alt={"Loading photo " + (i + 1)} />
              <button type="button" className="x" onClick={() => setPhotos(photos.filter((_, j) => j !== i))}
                style={{ position: "absolute", top: 5, right: 5, background: "rgba(255,255,255,.94)", boxShadow: "var(--shadow-s)" }}
                aria-label={"Remove photo " + (i + 1)}>
                <Ic d={I.x} s={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Lightbox({ src, onClose }) {
  if (!src) return null;
  return (
    <div className="ovl no-print" style={{ alignItems: "center", zIndex: 300 }} onMouseDown={onClose}>
      <img src={src} alt="Loading photo" style={{ maxWidth: "100%", maxHeight: "86vh", borderRadius: 12, boxShadow: "var(--shadow-l)" }} />
    </div>
  );
}

function MediaAttach({ files, setFiles, max = 4, onError }) {
  const camRef = useRef(null);
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const handle = async (e) => {
    const pickedFiles = Array.from(e.target.files || []);
    e.target.value = "";
    if (!pickedFiles.length) return;
    setBusy(true);
    try {
      const room = max - files.length;
      const picked = pickedFiles.slice(0, Math.max(0, room));
      const outs = [];
      for (const f of picked) {
        try {
          outs.push(await readMediaFile(f));
        } catch (err) {
          const msg = err && err.message === "size"
            ? "Videos must be under 8 MB. Try a shorter clip."
            : "Could not read that file. Use a photo or a short video.";
          onError && onError(msg);
        }
      }
      if (outs.length) setFiles([...files, ...outs]);
      if (pickedFiles.length > room) onError && onError("Only " + max + " attachments per ticket. Extras were skipped.");
    } finally { setBusy(false); }
  };

  return (
    <div>
      <input ref={camRef} type="file" accept="image/*,video/*" capture="environment" multiple onChange={handle} className="sr" tabIndex={-1} />
      <input ref={fileRef} type="file" accept="image/*,video/*" multiple onChange={handle} className="sr" tabIndex={-1} />
      <div className="row wrap-r" style={{ marginBottom: files.length ? 11 : 0 }}>
        <button type="button" className="btn line sm" disabled={busy || files.length >= max} onClick={() => camRef.current && camRef.current.click()}>
          <Ic d={I.cam} s={15} /> {busy ? "Working…" : "Camera"}
        </button>
        <button type="button" className="btn ghost sm" disabled={busy || files.length >= max} onClick={() => fileRef.current && fileRef.current.click()}>
          <Ic d={I.clip} s={15} /> Photo or video
        </button>
        <span className="hint">{files.length}/{max}</span>
      </div>
      {files.length > 0 && (
        <div className="photo-strip">
          {files.map((p, i) => (
            <div key={i} style={{ position: "relative" }}>
              {p.kind === "video"
                ? <video src={p.data} muted playsInline controls={false} />
                : <img src={p.data} alt={"Attachment " + (i + 1)} />}
              <button type="button" className="x" onClick={() => setFiles(files.filter((_, j) => j !== i))}
                style={{ position: "absolute", top: 5, right: 5, background: "rgba(255,255,255,.94)", boxShadow: "var(--shadow-s)" }}
                aria-label={"Remove attachment " + (i + 1)}>
                <Ic d={I.x} s={14} />
              </button>
              {p.kind === "video" && (
                <span className="chip" style={{ position: "absolute", left: 6, bottom: 6, background: "rgba(0,0,0,.7)", color: "#fff", border: 0 }}>Video</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Confirm({ text, body, danger, onYes, onNo, yes }) {
  return (
    <Modal title={text} onClose={onNo}
      footer={<>
        <button className="btn line" onClick={onNo}>Cancel</button>
        <button className={"btn" + (danger ? " red" : "")} onClick={onYes}>{yes || "Confirm"}</button>
      </>}>
      <div className="modal-b"><p className="dim">{body}</p></div>
    </Modal>
  );
}

/* ---------------------------------------------------------------- login */
function Login({ users, onLogin }) {
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");

  const submit = () => {
    const u = users.find((x) => x.username.toLowerCase() === username.trim().toLowerCase());
    if (!u) { setErr("No account with that username."); return; }
    if (!u.active) { setErr("This account is switched off. Ask an admin to turn it back on."); return; }
    if (String(u.pin) !== pin.trim()) { setErr("That PIN doesn't match."); return; }
    setErr("");
    onLogin(u);
  };

  return (
    <div className="login">
      <div className="login-l">
        <Logo h={54} mono />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 430 }}>
          <div className="eyebrow" style={{ color: "rgba(231,238,232,.6)" }}>Stock control</div>
          <h1 style={{ fontFamily: "var(--fd)", fontWeight: 700, textTransform: "uppercase", fontSize: "clamp(34px,5vw,52px)", lineHeight: .96, letterSpacing: ".01em", margin: "10px 0 14px" }}>
            Every door<br />accounted for.
          </h1>
          <p style={{ color: "rgba(231,238,232,.72)", fontSize: 15, lineHeight: 1.5 }}>
            Book goods in, dispatch with a photographed gate pass, and see live stock across every warehouse, yard and showroom.
          </p>
        </div>
        <div className="row" style={{ gap: 22, position: "relative", zIndex: 2 }}>
          {[["Serialised", "entries"], ["Photo", "proof"], ["Role", "based access"]].map(([a, b]) => (
            <div key={a}>
              <div style={{ fontFamily: "var(--fd)", fontWeight: 700, textTransform: "uppercase", fontSize: 17, letterSpacing: ".04em" }}>{a}</div>
              <div className="tiny" style={{ color: "rgba(231,238,232,.55)" }}>{b}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="login-r">
        <div className="login-card">
          <h2 className="h-page" style={{ marginBottom: 4 }}>Sign in</h2>
          <p className="dim tiny" style={{ marginBottom: 20 }}>Use the username and PIN your admin gave you.</p>

          <div className="grid" style={{ gap: 14 }}>
            <Field label="Username">
              <input className={"inp" + (err ? " err" : "")} value={username} autoCapitalize="none" autoCorrect="off"
                onChange={(e) => { setUsername(e.target.value); setErr(""); }}
                onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="admin" />
            </Field>
            <Field label="PIN" error={err}>
              <input className={"inp pin" + (err ? " err" : "")} value={pin} type="password" inputMode="numeric" maxLength={8}
                onChange={(e) => { setPin(e.target.value.replace(/\D/g, "")); setErr(""); }}
                onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="••••" />
            </Field>
            <button className="btn blk" onClick={submit} style={{ padding: "11px 14px" }}>
              <Ic d={I.lock} s={16} /> Sign in
            </button>
          </div>

          <div className="h-sec" style={{ margin: "24px 0 9px" }}>Demo accounts</div>
          <div className="demo">
            {users.filter((u) => u.active).slice(0, 4).map((u) => (
              <button key={u.id} className="demo-i" onClick={() => { setUsername(u.username); setPin(String(u.pin)); setErr(""); }}>
                <span className="avatar" style={{ width: 28, height: 28, fontSize: 12, background: u.role === "admin" ? "var(--red)" : "var(--ink)" }}>{initials(u.name)}</span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "block", fontWeight: 600, fontSize: 13 }}>{u.name}</span>
                  <span className="tiny dim">{ROLES[u.role] ? ROLES[u.role].label : u.role}</span>
                </span>
                <span className="spacer" />
                <span className="mono tiny faint">{u.username} / {u.pin}</span>
              </button>
            ))}
            <div className="hint" style={{ padding: "6px 8px 0" }}>Tap a row to fill the form. Change these PINs in Users before you go live.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- dashboard */
function Dashboard({ db, movements, stock, user, go, openMovement }) {
  const cur = db.company.currency;
  const showCost = can(user, "costs");
  const facs = visibleFacilities(user, db.facilities);
  const facIds = facs.map((f) => f.id);
  const scoped = !user.facilityIds || user.facilityIds.length === 0;

  const mine = useMemo(() => movements.filter((m) =>
    scoped || facIds.includes(m.fromFacility) || facIds.includes(m.toFacility)), [movements, facIds, scoped]);

  const itemById = useMemo(() => Object.fromEntries(db.items.map((i) => [i.id, i])), [db.items]);

  const totals = useMemo(() => {
    let units = 0, value = 0, low = 0, out = 0;
    db.items.forEach((it) => {
      const e = stock[it.id];
      if (!e) return;
      const q = scoped ? e.total : facIds.reduce((s, f) => s + (e.byFac[f] || 0), 0);
      units += q;
      value += q * (Number(it.cost) || 0);
      if (q <= 0) out += 1;
      else if (it.min && q < it.min) low += 1;
    });
    return { units, value, low, out };
  }, [db.items, stock, facIds, scoped]);

  const monthStart = new Date(); monthStart.setDate(1);
  const inMonth = mine.filter((m) => new Date(m.date) >= new Date(monthStart.toISOString().slice(0, 10)));
  const monthIn = inMonth.filter((m) => m.type === "IN").reduce((s, m) => s + movementQty(m), 0);
  const monthOut = inMonth.filter((m) => m.type === "OUT").reduce((s, m) => s + movementQty(m), 0);
  const trucks = new Set(inMonth.filter((m) => m.truckNo).map((m) => m.truckNo)).size;

  const flow = useMemo(() => {
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const iso = daysAgoISO(i);
      const d = new Date(iso);
      const dayMoves = mine.filter((m) => m.date === iso);
      days.push({
        label: String(d.getDate()),
        inQty: dayMoves.filter((m) => m.type === "IN").reduce((s, m) => s + movementQty(m), 0),
        outQty: dayMoves.filter((m) => m.type === "OUT").reduce((s, m) => s + movementQty(m), 0),
      });
    }
    return days;
  }, [mine]);

  const facRows = facs.map((f) => {
    let qty = 0, value = 0;
    db.items.forEach((it) => {
      const q = (stock[it.id] && stock[it.id].byFac[f.id]) || 0;
      qty += q; value += q * (Number(it.cost) || 0);
    });
    return { id: f.id, name: f.name, qty, value };
  }).sort((a, b) => b.qty - a.qty);

  const watch = db.items.map((it) => {
    const e = stock[it.id] || { total: 0, byFac: {} };
    const q = scoped ? e.total : facIds.reduce((s, f) => s + (e.byFac[f] || 0), 0);
    return { it, q };
  }).filter((r) => r.q <= 0 || (r.it.min && r.q < r.it.min))
    .sort((a, b) => (a.q / (a.it.min || 1)) - (b.q / (b.it.min || 1))).slice(0, 5);

  const recent = mine.slice(0, 7);

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div className="stats">
        <Stat label="Total live stock" value={fmtNum(totals.units)} unit="units" sub={facs.length + " " + (facs.length === 1 ? "facility" : "facilities")} icon={I.bldg} />
        {showCost && <Stat label="Stock value" value={fmtMoneyShort(totals.value, cur)} sub="At current item cost" icon={I.tag} />}
        <Stat label="In this month" value={fmtNum(monthIn)} unit="units" tone="" sub={inMonth.filter((m) => m.type === "IN").length + " receipts"} icon={I.inbox} />
        <Stat label="Out this month" value={fmtNum(monthOut)} unit="units" tone="r" sub={trucks + " trucks used"} icon={I.truck} />
        <Stat label="Needs attention" value={fmtNum(totals.low + totals.out)} unit="items" tone="a" sub={totals.out + " out of stock, " + totals.low + " running low"} icon={I.warn} />
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-h">
            <div>
              <h3 className="h-sec">Movement, last 14 days</h3>
              <div className="tiny dim">Units booked in against units dispatched</div>
            </div>
            <div className="spacer" />
            <span className="row" style={{ gap: 6 }}><span className="dot" style={{ color: "var(--ink)" }} /><span className="tiny">In</span></span>
            <span className="row" style={{ gap: 6 }}><span className="dot" style={{ color: "var(--red)" }} /><span className="tiny">Out</span></span>
          </div>
          <div className="card-b">
            <FlowChart data={flow} cur={cur} />
          </div>
        </div>

        <div className="card">
          <div className="card-h"><h3 className="h-sec">Stock by facility</h3></div>
          <div className="card-b">
            {facRows.length ? <FacilityBars rows={facRows} showValue={showCost} cur={cur} />
              : <Empty icon={I.bldg} title="No facilities" body="Add a warehouse or yard to start tracking stock by location." />}
          </div>
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-h">
            <h3 className="h-sec">Recent entries</h3>
            <div className="spacer" />
            {can(user, "reports") && <button className="btn ghost sm" onClick={() => go("log")}>Open full log <Ic d={I.arrow} s={14} /></button>}
          </div>
          {recent.length === 0 ? (
            <Empty icon={I.list} title="Nothing booked yet" body="Your first stock entry will show up here with its serial number."
              action={can(user, "stockIn") ? <button className="btn" onClick={() => go("new")}><Ic d={I.plus} s={15} /> Record stock in</button> : null} />
          ) : (
            <div className="tw">
              <table className="t">
                <thead><tr>
                  <th>Serial</th><th>Type</th><th>Item lines</th><th className="r-align">Qty</th><th>Route</th><th>When</th>
                </tr></thead>
                <tbody>
                  {recent.map((m) => (
                    <tr key={m.id} className="clk" onClick={() => openMovement(m)}>
                      <td className="mono tiny">{m.serial}</td>
                      <td><MoveChip type={m.type} /></td>
                      <td>
                        <div className="cellname" style={{ fontSize: 13 }}>
                          {(itemById[m.lines[0].itemId] || {}).name || "Deleted item"}
                        </div>
                        {m.lines.length > 1 && <div className="cellsub">+{m.lines.length - 1} more</div>}
                      </td>
                      <td className="r-align mono">{fmtNum(movementQty(m))}</td>
                      <td className="tiny dim">{routeLabel(m, db.facilities)}</td>
                      <td className="tiny dim">{relTime(m.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-h">
            <h3 className="h-sec">Reorder watchlist</h3>
            <div className="spacer" />
            <button className="btn ghost sm" onClick={() => go("stock")}>Stock <Ic d={I.arrow} s={14} /></button>
          </div>
          {watch.length === 0 ? (
            <div className="card-b"><div className="row" style={{ gap: 10 }}>
              <span className="chip ok"><Ic d={I.chk} s={12} /> All good</span>
              <span className="tiny dim">Everything is above its reorder level.</span>
            </div></div>
          ) : (
            <div className="card-b grid" style={{ gap: 13 }}>
              {watch.map(({ it, q }) => (
                <div key={it.id}>
                  <div className="row" style={{ marginBottom: 5 }}>
                    <span style={{ fontWeight: 600, fontSize: 13, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.name}</span>
                    <div className="spacer" />
                    <span className={"chip " + (q <= 0 ? "zero" : "low")}>{q <= 0 ? "Out" : "Low"}</span>
                  </div>
                  <div className="bar-t"><div className={"bar-f " + (q <= 0 ? "r" : "a")} style={{ width: Math.max(2, Math.min(100, (q / (it.min || 1)) * 100)) + "%" }} /></div>
                  <div className="row tiny dim" style={{ marginTop: 4 }}>
                    <span className="mono">{fmtNum(q)} {it.unit}</span>
                    <div className="spacer" />
                    <span>reorder at {fmtNum(it.min)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function routeLabel(m, facs) {
  const fname = (id) => (facs.find((f) => f.id === id) || {}).name;
  if (m.type === "IN") return (m.party || "Supplier") + " → " + (fname(m.toFacility) || "—");
  if (m.type === "OUT") return (fname(m.fromFacility) || "—") + " → " + (m.party || "Customer");
  if (m.type === "TRF") return (fname(m.fromFacility) || "—") + " → " + (fname(m.toFacility) || "—");
  return fname(m.toFacility || m.fromFacility) || "—";
}

/* ---------------------------------------------------------------- live stock */
function LiveStock({ db, stock, user, go, exportCSV }) {
  const cur = db.company.currency;
  const showCost = can(user, "costs");
  const facs = visibleFacilities(user, db.facilities);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [fac, setFac] = useState("");
  const [onlyLow, setOnlyLow] = useState(false);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return db.items.filter((i) => i.active !== false)
      .map((it) => {
        const e = stock[it.id] || { total: 0, byFac: {} };
        const qty = fac ? (e.byFac[fac] || 0) : facs.reduce((s, f) => s + (e.byFac[f.id] || 0), 0);
        return { it, qty, byFac: e.byFac, value: qty * (Number(it.cost) || 0) };
      })
      .filter((r) => !cat || r.it.cat === cat)
      .filter((r) => !onlyLow || r.qty <= 0 || (r.it.min && r.qty < r.it.min))
      .filter((r) => !term || (r.it.name + " " + r.it.code + " " + (r.it.desc || "")).toLowerCase().includes(term))
      .sort((a, b) => a.it.name.localeCompare(b.it.name));
  }, [db.items, stock, q, cat, fac, onlyLow, facs]);

  const sumQty = rows.reduce((s, r) => s + r.qty, 0);
  const sumVal = rows.reduce((s, r) => s + r.value, 0);

  const doExport = () => {
    const head = ["Code", "Item name", "Description", "Category", "Unit", ...facs.map((f) => f.name), "Total qty"];
    if (showCost) head.push("Unit cost", "Stock value");
    const body = rows.map((r) => {
      const line = [r.it.code, r.it.name, r.it.desc || "", catLabel(r.it.cat), r.it.unit,
        ...facs.map((f) => r.byFac[f.id] || 0), r.qty];
      if (showCost) line.push(r.it.cost, r.value);
      return line;
    });
    exportCSV("aaa-live-stock-" + todayISO() + ".csv", [head, ...body]);
  };

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="stats">
        <Stat label="Items listed" value={fmtNum(rows.length)} sub={db.items.length + " in the master"} />
        <Stat label="Units on hand" value={fmtNum(sumQty)} sub={fac ? (db.facilities.find((f) => f.id === fac) || {}).name : "All my facilities"} />
        {showCost && <Stat label="Value of listed stock" value={fmtMoneyShort(sumVal, cur)} sub="Qty × item cost" />}
      </div>

      <div className="card">
        <div className="card-h" style={{ flexWrap: "wrap", gap: 10 }}>
          <div style={{ position: "relative", flex: "1 1 210px", minWidth: 180 }}>
            <input className="inp" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search item or code"
              style={{ paddingLeft: 34 }} />
            <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--faint)", pointerEvents: "none" }}>
              <Ic d={I.search} s={16} cls="" />
            </span>
          </div>
          <select className="sel" style={{ width: "auto", minWidth: 140 }} value={fac} onChange={(e) => setFac(e.target.value)}>
            <option value="">All facilities</option>
            {facs.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          <select className="sel" style={{ width: "auto", minWidth: 130 }} value={cat} onChange={(e) => setCat(e.target.value)}>
            <option value="">All categories</option>
            {CATS.map((c) => <option key={c.k} value={c.k}>{c.label}</option>)}
          </select>
          <button className={"btn sm " + (onlyLow ? "red" : "line")} onClick={() => setOnlyLow(!onlyLow)}>
            <Ic d={I.warn} s={14} /> Low only
          </button>
          {can(user, "reports") && <button className="btn line sm" onClick={doExport}><Ic d={I.down} s={14} /> CSV</button>}
        </div>

        {rows.length === 0 ? (
          <Empty icon={I.layers} title="No stock matches" body="Try clearing the filters, or add the item to your master first."
            action={can(user, "items") ? <button className="btn line" onClick={() => go("items")}>Open item master</button> : null} />
        ) : (
          <div className="tw">
            <table className="t">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Unit</th>
                  {!fac && facs.map((f) => <th key={f.id} className="r-align">{f.code || f.name}</th>)}
                  <th className="r-align">On hand</th>
                  {showCost && <th className="r-align">Cost</th>}
                  {showCost && <th className="r-align">Value</th>}
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ it, qty, byFac, value }) => {
                  const st = qty <= 0 ? "zero" : (it.min && qty < it.min) ? "low" : "ok";
                  return (
                    <tr key={it.id}>
                      <td>
                        <div className="cellname">{it.name}</div>
                        <div className="cellsub"><span className="code">{it.code}</span> · {catLabel(it.cat)}{it.desc ? " · " + it.desc : ""}</div>
                      </td>
                      <td className="tiny dim">{it.unit}</td>
                      {!fac && facs.map((f) => (
                        <td key={f.id} className="r-align mono" style={{ color: (byFac[f.id] || 0) ? "inherit" : "var(--faint)" }}>
                          {fmtNum(byFac[f.id] || 0)}
                        </td>
                      ))}
                      <td className="r-align mono" style={{ fontWeight: 600 }}>{fmtNum(qty)}</td>
                      {showCost && <td className="r-align mono tiny dim">{fmtMoney(it.cost, cur)}</td>}
                      {showCost && <td className="r-align mono">{fmtMoney(value, cur)}</td>}
                      <td><span className={"chip " + st}>{st === "zero" ? "Out" : st === "low" ? "Low" : "In stock"}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- new entry */
function NewEntry({ db, movements, stock, user, onSave, toast, go, initialType }) {
  const cur = db.company.currency;
  const showCost = can(user, "costs");
  const facs = visibleFacilities(user, db.facilities).filter((f) => f.active !== false);
  const items = db.items.filter((i) => i.active !== false);

  const allowed = [
    can(user, "stockIn") ? "IN" : null,
    can(user, "stockOut") ? "OUT" : null,
    can(user, "transfer") && facs.length > 1 ? "TRF" : null,
  ].filter(Boolean);

  const [type, setType] = useState(allowed.includes(initialType) ? initialType : allowed[0] || "IN");
  const [date, setDate] = useState(todayISO());
  const [fromFacility, setFromFacility] = useState(facs.length === 1 ? facs[0].id : "");
  const [toFacility, setToFacility] = useState(facs.length === 1 ? facs[0].id : "");
  const [party, setParty] = useState("");
  const [truckNo, setTruckNo] = useState("");
  const [driver, setDriver] = useState("");
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState([]);
  const [lines, setLines] = useState([{ key: uid("l"), itemId: "", qty: "", cost: "" }]);
  const [errs, setErrs] = useState({});
  const [saving, setSaving] = useState(false);

  const parties = useMemo(() => {
    const s = new Set(movements.filter((m) => m.type === type && m.party).map((m) => m.party));
    return Array.from(s).slice(0, 40);
  }, [movements, type]);
  const trucks = useMemo(() => Array.from(new Set(movements.filter((m) => m.truckNo).map((m) => m.truckNo))).slice(0, 30), [movements]);

  const sourceFac = type === "IN" ? null : fromFacility;
  const itemById = Object.fromEntries(items.map((i) => [i.id, i]));

  const setLine = (key, patch) => setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  const addLine = () => setLines((ls) => [...ls, { key: uid("l"), itemId: "", qty: "", cost: "" }]);
  const delLine = (key) => setLines((ls) => (ls.length === 1 ? ls : ls.filter((l) => l.key !== key)));

  const pickItem = (key, itemId) => {
    const it = itemById[itemId];
    setLine(key, { itemId, cost: it ? String(it.cost) : "" });
  };

  const totalQty = lines.reduce((s, l) => s + (Number(l.qty) || 0), 0);
  const totalVal = lines.reduce((s, l) => s + (Number(l.qty) || 0) * (Number(l.cost) || 0), 0);

  const validate = () => {
    const e = {};
    if (!date) e.date = "Pick a date.";
    if (type === "IN" && !toFacility) e.to = "Choose where the stock is landing.";
    if (type === "OUT" && !fromFacility) e.from = "Choose the facility sending the stock.";
    if (type === "TRF") {
      if (!fromFacility) e.from = "Choose the facility sending the stock.";
      if (!toFacility) e.to = "Choose the receiving facility.";
      if (fromFacility && fromFacility === toFacility) e.to = "Pick a different facility to send to.";
    }
    if (type === "OUT" && !party.trim()) e.party = "Name the customer or site.";
    if (type === "IN" && !party.trim()) e.party = "Name the supplier.";

    const good = lines.filter((l) => l.itemId && Number(l.qty) > 0);
    if (good.length === 0) e.lines = "Add at least one item with a quantity.";

    const lineErr = {};
    lines.forEach((l) => {
      if (!l.itemId && (l.qty || l.cost)) lineErr[l.key] = "Pick an item";
      else if (l.itemId && !(Number(l.qty) > 0)) lineErr[l.key] = "Enter a quantity";
      else if (l.itemId && sourceFac) {
        const avail = availableAt(stock, l.itemId, sourceFac);
        if (Number(l.qty) > avail) lineErr[l.key] = "Only " + fmtNum(avail) + " on hand here";
      }
    });
    if (Object.keys(lineErr).length) e.line = lineErr;
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) { toast("Check the highlighted fields.", true); return; }
    setSaving(true);
    const good = lines.filter((l) => l.itemId && Number(l.qty) > 0);
    const payload = {
      type, date,
      fromFacility: type === "IN" ? "" : fromFacility,
      toFacility: type === "OUT" ? "" : toFacility,
      party: party.trim(),
      truckNo: truckNo.trim().toUpperCase(),
      driver: driver.trim(),
      notes: notes.trim(),
      lines: good.map((l) => ({ itemId: l.itemId, qty: Number(l.qty), cost: Number(l.cost) || 0 })),
      photos,
    };
    const saved = await onSave(payload);
    setSaving(false);
    if (saved) {
      setLines([{ key: uid("l"), itemId: "", qty: "", cost: "" }]);
      setParty(""); setTruckNo(""); setDriver(""); setNotes(""); setPhotos([]);
      setErrs({});
    }
  };

  if (allowed.length === 0) {
    return <div className="card"><Empty icon={I.lock} title="No entry rights" body="Your account can view stock but not record movements. Ask an admin to switch on stock in or stock out." /></div>;
  }

  const isOut = type === "OUT";
  const isTrf = type === "TRF";
  const partyLabel = type === "IN" ? "Supplier" : isTrf ? "Reference" : "Customer / site";

  return (
    <div className="entry-grid">
      <div className="grid" style={{ gap: 16 }}>
        <div className="card">
          <div className="card-b grid" style={{ gap: 16 }}>
            <div>
              <div className="h-sec" style={{ marginBottom: 8 }}>What is happening</div>
              <div className="seg" style={{ gridTemplateColumns: "repeat(" + allowed.length + ",1fr)" }}>
                {allowed.map((t) => (
                  <button key={t} className={type === t ? "on " + MOVE[t].cls : ""} onClick={() => { setType(t); setErrs({}); }}>
                    {MOVE[t].label}
                  </button>
                ))}
              </div>
              <div className="hint" style={{ marginTop: 7 }}>
                {type === "IN" && "Goods arriving from a supplier into one of your facilities."}
                {type === "OUT" && "Goods leaving a facility for a customer or site. A gate pass is created."}
                {type === "TRF" && "Stock moving between your own facilities. Nothing is added or consumed overall."}
              </div>
            </div>

            <div className="fgrid two">
              <Field label="Date" req error={errs.date}>
                <input type="date" className="inp" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} />
              </Field>

              {/* IN: supplier -> facility | OUT: facility -> customer | TRF: facility -> facility */}
              {type === "IN" && (
                <Field label="Supplier" req error={errs.party} hint="Who is sending the goods">
                  <input className={"inp" + (errs.party ? " err" : "")} list="party-list" value={party}
                    onChange={(e) => setParty(e.target.value)} placeholder="e.g. Sri Balaji Timbers" />
                </Field>
              )}
              {type !== "IN" && (
                <Field label={isTrf ? "From facility" : "Sending facility"} req error={errs.from}
                  hint={isTrf ? "Stock leaves this location" : "Where the truck is loading"}>
                  <select className={"sel" + (errs.from ? " err" : "")} value={fromFacility} onChange={(e) => setFromFacility(e.target.value)}>
                    <option value="">Select facility…</option>
                    {facs.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </Field>
              )}

              {type === "OUT" ? (
                <Field label="Customer / site" req error={errs.party} hint="Where the truck is headed">
                  <input className={"inp" + (errs.party ? " err" : "")} list="party-list" value={party}
                    onChange={(e) => setParty(e.target.value)} placeholder="e.g. Prestige Lakeside — Block C" />
                </Field>
              ) : (
                <Field label={isTrf ? "To facility" : "Receiving facility"} req error={errs.to}
                  hint={type === "IN" ? "Where the stock will be stored" : "Stock lands here"}>
                  <select className={"sel" + (errs.to ? " err" : "")} value={toFacility} onChange={(e) => setToFacility(e.target.value)}>
                    <option value="">Select facility…</option>
                    {facs.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </Field>
              )}

              {isTrf && (
                <Field label="Reference" hint="Optional note for the transfer">
                  <input className="inp" value={party} onChange={(e) => setParty(e.target.value)} placeholder="e.g. Showroom top-up" />
                </Field>
              )}
            </div>
            <datalist id="party-list">{parties.map((p) => <option key={p} value={p} />)}</datalist>
          </div>
        </div>

        {/* item lines */}
        <div className="card">
          <div className="card-h">
            <div>
              <h3 className="h-sec">Items on this entry</h3>
              <div className="tiny dim">Pick from your item master. Add a row for each product on the vehicle.</div>
            </div>
            <div className="spacer" />
            {can(user, "items") && <button className="btn ghost sm" onClick={() => go("items")}>Item master</button>}
          </div>
          <div className="card-b grid" style={{ gap: 11 }}>
            {items.length === 0 ? (
              <Empty icon={I.tag} title="No items yet" body="Create an item first — name, unit and cost — then it will show up in this list."
                action={can(user, "items") ? <button className="btn" onClick={() => go("items")}><Ic d={I.plus} s={15} /> Create an item</button> : null} />
            ) : lines.map((l, idx) => {
              const it = itemById[l.itemId];
              const avail = sourceFac && l.itemId ? availableAt(stock, l.itemId, sourceFac) : null;
              const le = errs.line && errs.line[l.key];
              return (
                <div key={l.key} style={{ border: "1px solid " + (le ? "var(--red)" : "var(--line)"), borderRadius: 10, padding: 11, background: le ? "#FDF7F7" : "var(--sunk)" }}>
                  <div className="row" style={{ marginBottom: 9 }}>
                    <span className="eyebrow">Line {idx + 1}</span>
                    <div className="spacer" />
                    {lines.length > 1 && (
                      <button className="x" onClick={() => delLine(l.key)} aria-label={"Remove line " + (idx + 1)}><Ic d={I.trash} s={15} /></button>
                    )}
                  </div>
                  <div className={"line-grid" + (showCost ? "" : " nocost")}>
                    <Field label="Item">
                      <select className="sel" value={l.itemId} onChange={(e) => pickItem(l.key, e.target.value)}>
                        <option value="">Select item…</option>
                        {CATS.filter((c) => items.some((i) => i.cat === c.k)).map((c) => (
                          <optgroup key={c.k} label={c.label}>
                            {items.filter((i) => i.cat === c.k).map((i) => (
                              <option key={i.id} value={i.id}>{i.code} — {i.name}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </Field>
                    <Field label={"Qty" + (it ? " (" + it.unit + ")" : "")}>
                      <input className="inp mono" inputMode="decimal" value={l.qty}
                        onChange={(e) => setLine(l.key, { qty: e.target.value.replace(/[^\d.]/g, "") })} placeholder="0" />
                    </Field>
                    {showCost && (
                      <Field label={"Rate (" + cur + ")"}>
                        <input className="inp mono" inputMode="decimal" value={l.cost}
                          onChange={(e) => setLine(l.key, { cost: e.target.value.replace(/[^\d.]/g, "") })} placeholder="0" />
                      </Field>
                    )}
                    {showCost && (
                      <Field label="Line total">
                        <div className="inp mono" style={{ background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "flex-end", fontWeight: 600 }}>
                          {fmtMoney((Number(l.qty) || 0) * (Number(l.cost) || 0), cur)}
                        </div>
                      </Field>
                    )}
                    {!showCost && (
                      <Field label="On hand">
                        <div className="inp mono" style={{ background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "flex-end", color: "var(--muted)" }}>
                          {avail === null ? "—" : fmtNum(avail)}
                        </div>
                      </Field>
                    )}
                  </div>
                  <div className="row" style={{ marginTop: 7, gap: 10 }}>
                    {le && <span className="hint e">{le}</span>}
                    {!le && avail !== null && <span className="hint">{fmtNum(avail)} {it ? it.unit : ""} on hand at this facility</span>}
                    {!le && avail === null && it && <span className="hint">{it.desc || catLabel(it.cat)}</span>}
                  </div>
                </div>
              );
            })}

            {items.length > 0 && (
              <div className="row">
                <button className="btn line sm" onClick={addLine}><Ic d={I.plus} s={14} /> Add another item</button>
                <div className="spacer" />
                <div className="row" style={{ gap: 16 }}>
                  <span className="tiny dim">Total qty <b className="mono" style={{ color: "var(--text)" }}>{fmtNum(totalQty)}</b></span>
                  {showCost && <span className="tiny dim">Value <b className="mono" style={{ color: "var(--text)" }}>{fmtMoney(totalVal, cur)}</b></span>}
                </div>
              </div>
            )}
            {errs.lines && <div className="hint e">{errs.lines}</div>}
          </div>
        </div>

        {/* vehicle + proof */}
        <div className="card">
          <div className="card-h">
            <div>
              <h3 className="h-sec">Vehicle and loading proof</h3>
              <div className="tiny dim">{isOut ? "Printed on the gate pass the driver carries." : "Kept against the receipt for later checks."}</div>
            </div>
          </div>
          <div className="card-b grid" style={{ gap: 15 }}>
            <div className="fgrid two">
              <Field label="Truck number" hint="Shown like a number plate on the docket">
                <input className="inp plate" list="truck-list" value={truckNo} style={{ textTransform: "uppercase" }}
                  onChange={(e) => setTruckNo(e.target.value.toUpperCase())} placeholder="KA 01 AB 4477" />
              </Field>
              <Field label="Driver name">
                <input className="inp" value={driver} onChange={(e) => setDriver(e.target.value)} placeholder="Optional" />
              </Field>
            </div>
            <datalist id="truck-list">{trucks.map((t) => <option key={t} value={t} />)}</datalist>
            <div className="f">
              <label>Photo of the load</label>
              <PhotoPicker photos={photos} setPhotos={setPhotos} onError={(m) => toast(m, true)} />
              <div className="hint">Opens the camera on a phone or tablet. Shoot the stock in the truck before it leaves.</div>
            </div>
            <Field label="Notes">
              <textarea className="ta" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything worth remembering — damage, short supply, who received it." />
            </Field>
          </div>
        </div>
      </div>

      {/* summary rail */}
      <div className="card rail">
        <div className="card-h"><h3 className="h-sec">Ready to book</h3></div>
        <div className="card-b grid" style={{ gap: 12 }}>
          <div className="row"><span className="tiny dim">Serial</span><div className="spacer" />
            <span className="mono tiny">AAA/{type}/{YY()}/{pad((db.counters[type] || 0) + 1)}</span></div>
          <div className="row"><span className="tiny dim">Document</span><div className="spacer" />
            <span className="tiny" style={{ fontWeight: 600 }}>{MOVE[type].doc}</span></div>
          <hr className="hr" />
          <div className="row"><span className="tiny dim">Lines</span><div className="spacer" />
            <span className="mono tiny">{lines.filter((l) => l.itemId && Number(l.qty) > 0).length}</span></div>
          <div className="row"><span className="tiny dim">Units</span><div className="spacer" />
            <span className="mono" style={{ fontWeight: 600 }}>{fmtNum(totalQty)}</span></div>
          {showCost && <div className="row"><span className="tiny dim">Value</span><div className="spacer" />
            <span className="mono" style={{ fontWeight: 600 }}>{fmtMoney(totalVal, cur)}</span></div>}
          <div className="row"><span className="tiny dim">Photos</span><div className="spacer" />
            <span className="mono tiny">{photos.length}</span></div>
          <hr className="hr" />
          <div className="tiny dim" style={{ lineHeight: 1.5 }}>{routePreview(type, db, fromFacility, toFacility, party)}</div>
          <button className={"btn blk" + (isOut ? " red" : "")} onClick={submit} disabled={saving} style={{ padding: "11px 14px" }}>
            {saving ? "Booking…" : <>{MOVE[type].label} <Ic d={I.arrow} s={15} /></>}
          </button>
          <div className="hint" style={{ textAlign: "center" }}>Booked as {user.name}. The serial is issued on save.</div>
        </div>
      </div>
    </div>
  );
}

function routePreview(type, db, from, to, party) {
  const n = (id) => (db.facilities.find((f) => f.id === id) || {}).name;
  if (type === "IN") return (party || "Supplier") + " → " + (n(to) || "facility not chosen");
  if (type === "OUT") return (n(from) || "facility not chosen") + " → " + (party || "customer not named");
  return (n(from) || "from?") + " → " + (n(to) || "to?");
}

/* ---------------------------------------------------------------- docket */
function Docket({ m, db, user, onClose, onDelete, photos }) {
  const cur = db.company.currency;
  const showCost = can(user, "costs");
  const [zoom, setZoom] = useState(null);
  const fname = (id) => (db.facilities.find((f) => f.id === id) || {}).name || "—";
  const faddr = (id) => (db.facilities.find((f) => f.id === id) || {}).address || "";
  const itemById = Object.fromEntries(db.items.map((i) => [i.id, i]));
  const mv = MOVE[m.type] || MOVE.IN;

  return (
    <Modal wide onClose={onClose}
      footer={<>
        {can(user, "delete") && onDelete && (
          <button className="btn ghost" style={{ color: "var(--red)", marginRight: "auto" }} onClick={onDelete}>
            <Ic d={I.trash} s={15} /> Delete entry
          </button>
        )}
        <button className="btn line" onClick={onClose}>Close</button>
        <button className="btn" onClick={() => window.print()}><Ic d={I.print} s={15} /> Print</button>
      </>}>
      <div className="docket">
        <div className="dk-h">
          <Logo h={44} />
          <div className="spacer" />
          <div style={{ textAlign: "right" }}>
            <div className="eyebrow">{mv.doc}</div>
            <div className="dk-serial">{m.serial}</div>
            <div className="tiny dim">{fmtDate(m.date)}</div>
          </div>
          <div className={"dk-stamp " + (m.type === "IN" ? "in" : m.type === "TRF" ? "trf" : "")}>{mv.label}</div>
        </div>

        <div className="dk-grid">
          <div className="dk-cell">
            <div className="k">{m.type === "IN" ? "Received from" : "Dispatched from"}</div>
            <div className="v">{m.type === "IN" ? (m.party || "—") : fname(m.fromFacility)}</div>
            <div className="tiny dim">{m.type === "IN" ? "Supplier" : faddr(m.fromFacility)}</div>
          </div>
          <div className="dk-cell">
            <div className="k">{m.type === "OUT" ? "Delivered to" : "Received at"}</div>
            <div className="v">{m.type === "OUT" ? (m.party || "—") : fname(m.toFacility)}</div>
            <div className="tiny dim">{m.type === "OUT" ? "Customer / site" : faddr(m.toFacility)}</div>
          </div>
          <div className="dk-cell">
            <div className="k">Vehicle</div>
            {m.truckNo ? <span className="plate">{m.truckNo}</span> : <div className="v dim">Not recorded</div>}
            {m.driver && <div className="tiny dim" style={{ marginTop: 5 }}>Driver: {m.driver}</div>}
          </div>
          <div className="dk-cell">
            <div className="k">Booked by</div>
            <div className="v">{m.userName || "—"}</div>
            <div className="tiny dim">{fmtDateTime(m.createdAt)}</div>
          </div>
        </div>

        <div className="tw">
          <table className="t">
            <thead><tr>
              <th style={{ width: 34 }}>#</th><th>Item</th><th>Serial range</th><th>Unit</th>
              <th className="r-align">Qty</th>
              {showCost && <th className="r-align">Rate</th>}
              {showCost && <th className="r-align">Amount</th>}
            </tr></thead>
            <tbody>
              {(m.lines || []).map((l, i) => {
                const it = itemById[l.itemId] || {};
                return (
                  <tr key={i}>
                    <td className="mono tiny dim">{i + 1}</td>
                    <td>
                      <div className="cellname">{it.name || "Deleted item"}</div>
                      <div className="cellsub"><span className="code">{it.code || "—"}</span>{it.desc ? " · " + it.desc : ""}</div>
                    </td>
                    <td className="mono tiny dim">{l.serialFrom ? l.serialFrom + " → " + l.serialTo : "—"}</td>
                    <td className="tiny dim">{it.unit || "—"}</td>
                    <td className="r-align mono" style={{ fontWeight: 600 }}>{fmtNum(l.qty)}</td>
                    {showCost && <td className="r-align mono tiny">{fmtMoney(l.cost, cur)}</td>}
                    {showCost && <td className="r-align mono">{fmtMoney(lineTotal(l), cur)}</td>}
                  </tr>
                );
              })}
              <tr>
                <td colSpan={4} style={{ fontWeight: 600 }}>Total</td>
                <td className="r-align mono" style={{ fontWeight: 700 }}>{fmtNum(movementQty(m))}</td>
                {showCost && <td />}
                {showCost && <td className="r-align mono" style={{ fontWeight: 700 }}>{fmtMoney(movementValue(m), cur)}</td>}
              </tr>
            </tbody>
          </table>
        </div>

        {m.notes && (
          <div className="dk-cell" style={{ borderRight: 0 }}>
            <div className="k">Notes</div>
            <div style={{ fontSize: 13.5 }}>{m.notes}</div>
          </div>
        )}

        {photos && photos.length > 0 && (
          <div style={{ padding: "14px 20px" }}>
            <div className="k eyebrow" style={{ marginBottom: 8 }}>Loading photos</div>
            <div className="photo-strip">
              {photos.map((p, i) => <img key={i} src={p} alt={"Load photo " + (i + 1)} onClick={() => setZoom(p)} />)}
            </div>
          </div>
        )}

        <div className="sign">
          <div>Storekeeper</div>
          <div>Driver</div>
          <div>Received by</div>
        </div>
        <div className="tear" />
        <div style={{ padding: "0 20px 16px", textAlign: "center" }} className="tiny faint">
          {db.company.name} · {db.company.tagline} · Computer generated {mv.doc.toLowerCase()} · {m.serial}
        </div>
      </div>
      <Lightbox src={zoom} onClose={() => setZoom(null)} />
    </Modal>
  );
}

/* ---------------------------------------------------------------- movement log */
function MovementLog({ db, movements, user, openMovement, exportCSV }) {
  const cur = db.company.currency;
  const showCost = can(user, "costs");
  const facs = visibleFacilities(user, db.facilities);
  const facIds = facs.map((f) => f.id);
  const scoped = !user.facilityIds || user.facilityIds.length === 0;
  const itemById = Object.fromEntries(db.items.map((i) => [i.id, i]));

  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [fac, setFac] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return movements
      .filter((m) => scoped || facIds.includes(m.fromFacility) || facIds.includes(m.toFacility))
      .filter((m) => !type || m.type === type)
      .filter((m) => !fac || m.fromFacility === fac || m.toFacility === fac)
      .filter((m) => !from || m.date >= from)
      .filter((m) => !to || m.date <= to)
      .filter((m) => {
        if (!term) return true;
        const names = (m.lines || []).map((l) => (itemById[l.itemId] || {}).name || "").join(" ");
        return (m.serial + " " + m.party + " " + m.truckNo + " " + m.driver + " " + names + " " + (m.notes || "")).toLowerCase().includes(term);
      });
  }, [movements, q, type, fac, from, to, facIds, scoped, itemById]);

  const doExport = () => {
    const head = ["Serial", "Type", "Date", "From", "To", "Party", "Truck", "Driver", "Item code", "Item name", "Qty", "Unit", "Rate", "Amount", "Booked by", "Notes"];
    const fname = (id) => (db.facilities.find((f) => f.id === id) || {}).name || "";
    const body = [];
    rows.forEach((m) => {
      (m.lines || []).forEach((l) => {
        const it = itemById[l.itemId] || {};
        body.push([m.serial, MOVE[m.type].label, m.date, fname(m.fromFacility), fname(m.toFacility), m.party,
          m.truckNo, m.driver, it.code || "", it.name || "", l.qty, it.unit || "",
          showCost ? l.cost : "", showCost ? lineTotal(l) : "", m.userName || "", m.notes || ""]);
      });
    });
    exportCSV("aaa-movements-" + todayISO() + ".csv", [head, ...body]);
  };

  const sumIn = rows.filter((m) => m.type === "IN").reduce((s, m) => s + movementQty(m), 0);
  const sumOut = rows.filter((m) => m.type === "OUT").reduce((s, m) => s + movementQty(m), 0);

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="stats">
        <Stat label="Entries listed" value={fmtNum(rows.length)} sub={movements.length + " in total"} />
        <Stat label="Units in" value={fmtNum(sumIn)} sub="Matching the filters" />
        <Stat label="Units out" value={fmtNum(sumOut)} tone="r" sub="Matching the filters" />
        <Stat label="Net change" value={fmtNum(sumIn - sumOut)} tone={sumIn - sumOut < 0 ? "r" : ""} sub="In minus out" />
      </div>

      <div className="card">
        <div className="card-h" style={{ flexWrap: "wrap", gap: 10 }}>
          <div style={{ position: "relative", flex: "1 1 200px", minWidth: 170 }}>
            <input className="inp" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Serial, party, truck, item" style={{ paddingLeft: 34 }} />
            <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--faint)", pointerEvents: "none" }}>
              <Ic d={I.search} s={16} cls="" />
            </span>
          </div>
          <select className="sel" style={{ width: "auto", minWidth: 120 }} value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">All types</option>
            {Object.values(MOVE).filter((m) => m.k !== "ADJ").map((m) => <option key={m.k} value={m.k}>{m.label}</option>)}
          </select>
          <select className="sel" style={{ width: "auto", minWidth: 130 }} value={fac} onChange={(e) => setFac(e.target.value)}>
            <option value="">All facilities</option>
            {facs.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          <input type="date" className="inp" style={{ width: "auto" }} value={from} onChange={(e) => setFrom(e.target.value)} aria-label="From date" />
          <input type="date" className="inp" style={{ width: "auto" }} value={to} onChange={(e) => setTo(e.target.value)} aria-label="To date" />
          <button className="btn line sm" onClick={doExport}><Ic d={I.down} s={14} /> CSV</button>
        </div>

        {rows.length === 0 ? (
          <Empty icon={I.list} title="Nothing to show" body="No entries match these filters. Widen the dates or clear the search." />
        ) : (
          <div className="tw">
            <table className="t">
              <thead><tr>
                <th>Serial</th><th>Type</th><th>Date</th><th>Items</th>
                <th className="r-align">Qty</th>
                {showCost && <th className="r-align">Value</th>}
                <th>Route</th><th>Truck</th><th>By</th><th />
              </tr></thead>
              <tbody>
                {rows.map((m) => (
                  <tr key={m.id} className="clk" onClick={() => openMovement(m)}>
                    <td className="mono tiny">{m.serial}</td>
                    <td><MoveChip type={m.type} /></td>
                    <td className="tiny">{fmtDate(m.date)}</td>
                    <td>
                      <div className="cellname" style={{ fontSize: 13 }}>{(itemById[m.lines[0].itemId] || {}).name || "Deleted item"}</div>
                      {m.lines.length > 1 && <div className="cellsub">+{m.lines.length - 1} more</div>}
                    </td>
                    <td className="r-align mono">{fmtNum(movementQty(m))}</td>
                    {showCost && <td className="r-align mono tiny">{fmtMoney(movementValue(m), cur)}</td>}
                    <td className="tiny dim" style={{ maxWidth: 220 }}>{routeLabel(m, db.facilities)}</td>
                    <td className="mono tiny">{m.truckNo || "—"}</td>
                    <td className="tiny dim">{m.userName || "—"}</td>
                    <td>{m.photoCount ? <span className="chip"><Ic d={I.cam} s={11} /> {m.photoCount}</span> : null}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- items */
function Items({ db, stock, user, onSaveItem, onDeleteItem, toast, exportCSV }) {
  const cur = db.company.currency;
  const showCost = can(user, "costs");
  const editable = can(user, "items");
  const [edit, setEdit] = useState(null);
  const [del, setDel] = useState(null);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");

  const rows = db.items
    .filter((i) => !cat || i.cat === cat)
    .filter((i) => !q.trim() || (i.name + " " + i.code + " " + (i.desc || "")).toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => a.code.localeCompare(b.code));

  const doExport = () => {
    const head = ["Code", "Item name", "Description", "Category", "Unit", "Cost", "Reorder level", "On hand", "Active"];
    exportCSV("aaa-items-" + todayISO() + ".csv", [head, ...rows.map((i) => [
      i.code, i.name, i.desc || "", catLabel(i.cat), i.unit, showCost ? i.cost : "", i.min,
      (stock[i.id] || { total: 0 }).total, i.active === false ? "No" : "Yes",
    ])]);
  };

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card">
        <div className="card-h" style={{ flexWrap: "wrap", gap: 10 }}>
          <div style={{ position: "relative", flex: "1 1 200px", minWidth: 170 }}>
            <input className="inp" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search items" style={{ paddingLeft: 34 }} />
            <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--faint)", pointerEvents: "none" }}>
              <Ic d={I.search} s={16} cls="" />
            </span>
          </div>
          <select className="sel" style={{ width: "auto", minWidth: 140 }} value={cat} onChange={(e) => setCat(e.target.value)}>
            <option value="">All categories</option>
            {CATS.map((c) => <option key={c.k} value={c.k}>{c.label}</option>)}
          </select>
          <div className="spacer" />
          {can(user, "reports") && <button className="btn line sm" onClick={doExport}><Ic d={I.down} s={14} /> CSV</button>}
          {editable && <button className="btn sm" onClick={() => setEdit({})}><Ic d={I.plus} s={14} /> New item</button>}
        </div>

        {rows.length === 0 ? (
          <Empty icon={I.tag} title="No items yet"
            body="An item is anything you stock — a door model, a window size, a lock set. Create it once and it becomes selectable on every entry."
            action={editable ? <button className="btn" onClick={() => setEdit({})}><Ic d={I.plus} s={15} /> Create the first item</button> : null} />
        ) : (
          <div className="tw">
            <table className="t">
              <thead><tr>
                <th>Code</th><th>Item name</th><th>Description</th><th>Category</th><th>Unit</th>
                {showCost && <th className="r-align">Cost</th>}
                <th className="r-align">On hand</th><th className="r-align">Reorder</th>
                {editable && <th />}
              </tr></thead>
              <tbody>
                {rows.map((it) => {
                  const on = (stock[it.id] || { total: 0 }).total;
                  return (
                    <tr key={it.id}>
                      <td className="mono tiny">{it.code}</td>
                      <td>
                        <div className="cellname">{it.name}</div>
                        {it.active === false && <div className="cellsub">Inactive</div>}
                      </td>
                      <td className="tiny dim" style={{ maxWidth: 260 }}>{it.desc || "—"}</td>
                      <td className="tiny">{catLabel(it.cat)}</td>
                      <td className="tiny dim">{it.unit}</td>
                      {showCost && <td className="r-align mono tiny">{fmtMoney(it.cost, cur)}</td>}
                      <td className="r-align mono" style={{ fontWeight: 600, color: on <= 0 ? "var(--red)" : "inherit" }}>{fmtNum(on)}</td>
                      <td className="r-align mono tiny dim">{fmtNum(it.min)}</td>
                      {editable && (
                        <td>
                          <div className="row" style={{ gap: 2, justifyContent: "flex-end" }}>
                            <button className="x" onClick={() => setEdit(it)} aria-label={"Edit " + it.name}><Ic d={I.edit} s={15} /></button>
                            {can(user, "delete") && <button className="x" onClick={() => setDel(it)} aria-label={"Delete " + it.name}><Ic d={I.trash} s={15} /></button>}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {edit && <ItemForm item={edit} db={db} showCost={showCost} onClose={() => setEdit(null)}
        onSave={(data) => { onSaveItem(data, edit.id); setEdit(null); }} />}
      {del && <Confirm danger yes="Delete item" text={"Delete " + del.name + "?"}
        body={"Its code " + del.code + " will not be reused. Past entries keep their history but the item can no longer be selected."}
        onNo={() => setDel(null)} onYes={() => { onDeleteItem(del); setDel(null); }} />}
    </div>
  );
}

function ItemForm({ item, db, showCost, onClose, onSave }) {
  const isNew = !item.id;
  const [f, setF] = useState({
    name: item.name || "", desc: item.desc || "", cat: item.cat || "DR",
    unit: item.unit || "pcs", cost: item.cost != null ? String(item.cost) : "",
    min: item.min != null ? String(item.min) : "0", active: item.active !== false,
  });
  const [err, setErr] = useState({});
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const nextCode = item.code || (f.cat + "-" + pad(((db.counters.cat && db.counters.cat[f.cat]) || 0) + 1));

  const save = () => {
    const e = {};
    if (!f.name.trim()) e.name = "Give the item a name.";
    if (!f.unit) e.unit = "Pick a unit.";
    if (f.cost && Number(f.cost) < 0) e.cost = "Cost cannot be negative.";
    setErr(e);
    if (Object.keys(e).length) return;
    onSave({ ...f, name: f.name.trim(), desc: f.desc.trim(), cost: Number(f.cost) || 0, min: Number(f.min) || 0 });
  };

  return (
    <Modal title={isNew ? "New item" : "Edit item"} sub={isNew ? "It becomes selectable on every stock entry." : item.code}
      onClose={onClose}
      footer={<>
        <button className="btn line" onClick={onClose}>Cancel</button>
        <button className="btn" onClick={save}>{isNew ? "Create item" : "Save changes"}</button>
      </>}>
      <div className="modal-b grid" style={{ gap: 14 }}>
        <div className="row" style={{ gap: 10, background: "var(--sunk)", border: "1px solid var(--line)", borderRadius: 9, padding: "9px 12px" }}>
          <span className="eyebrow">Item code</span>
          <div className="spacer" />
          <span className="mono" style={{ fontWeight: 600 }}>{nextCode}</span>
        </div>
        <Field label="Item name" req error={err.name} hint="How your team says it out loud">
          <input className={"inp" + (err.name ? " err" : "")} value={f.name} onChange={(e) => set("name", e.target.value)}
            placeholder={'e.g. Teak Flush Door 32" x 80"'} autoFocus />
        </Field>
        <Field label="Description" hint="Size, finish, grade — whatever tells two similar items apart">
          <textarea className="ta" value={f.desc} onChange={(e) => set("desc", e.target.value)} placeholder="Solid core, teak veneer both sides, 35mm" />
        </Field>
        <div className="fgrid">
          <Field label="Category" hint="Sets the code prefix">
            <select className="sel" value={f.cat} onChange={(e) => set("cat", e.target.value)} disabled={!isNew}>
              {CATS.map((c) => <option key={c.k} value={c.k}>{c.label}</option>)}
            </select>
          </Field>
          <Field label="Unit" req error={err.unit}>
            <select className="sel" value={f.unit} onChange={(e) => set("unit", e.target.value)}>
              {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </Field>
          {showCost && (
            <Field label={"Cost per unit (" + db.company.currency + ")"} error={err.cost} hint="Used to value your stock">
              <input className={"inp mono" + (err.cost ? " err" : "")} inputMode="decimal" value={f.cost}
                onChange={(e) => set("cost", e.target.value.replace(/[^\d.]/g, ""))} placeholder="0" />
            </Field>
          )}
          <Field label="Reorder level" hint="Warn me below this quantity">
            <input className="inp mono" inputMode="numeric" value={f.min}
              onChange={(e) => set("min", e.target.value.replace(/[^\d.]/g, ""))} placeholder="0" />
          </Field>
        </div>
        <label className={"check" + (f.active ? " on" : "")}>
          <input type="checkbox" checked={f.active} onChange={(e) => set("active", e.target.checked)} />
          <span>
            <span className="cl">Available for new entries</span>
            <span className="cd">Turn this off to retire an item without losing its history.</span>
          </span>
        </label>
      </div>
    </Modal>
  );
}

/* ---------------------------------------------------------------- facilities */
function Facilities({ db, stock, user, onSave, onDelete }) {
  const cur = db.company.currency;
  const showCost = can(user, "costs");
  const editable = can(user, "facilities");
  const [edit, setEdit] = useState(null);
  const [del, setDel] = useState(null);

  const rows = db.facilities.map((f) => {
    let qty = 0, value = 0, kinds = 0;
    db.items.forEach((it) => {
      const q = (stock[it.id] && stock[it.id].byFac[f.id]) || 0;
      if (q !== 0) kinds += 1;
      qty += q; value += q * (Number(it.cost) || 0);
    });
    return { f, qty, value, kinds };
  });

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card">
        <div className="card-h">
          <div><h3 className="h-sec">Facilities</h3><div className="tiny dim">Warehouses, yards and showrooms that hold stock.</div></div>
          <div className="spacer" />
          {editable && <button className="btn sm" onClick={() => setEdit({})}><Ic d={I.plus} s={14} /> New facility</button>}
        </div>
        {rows.length === 0 ? (
          <Empty icon={I.bldg} title="No facilities yet" body="Add the places you keep stock — each entry is booked against one of them."
            action={editable ? <button className="btn" onClick={() => setEdit({})}><Ic d={I.plus} s={15} /> Add a facility</button> : null} />
        ) : (
          <div className="tw">
            <table className="t">
              <thead><tr>
                <th>Code</th><th>Facility</th><th>Address</th><th className="r-align">Item kinds</th>
                <th className="r-align">Units held</th>{showCost && <th className="r-align">Value</th>}
                <th>Status</th>{editable && <th />}
              </tr></thead>
              <tbody>
                {rows.map(({ f, qty, value, kinds }) => (
                  <tr key={f.id}>
                    <td className="mono tiny">{f.code || "—"}</td>
                    <td className="cellname">{f.name}</td>
                    <td className="tiny dim" style={{ maxWidth: 280 }}>{f.address || "—"}</td>
                    <td className="r-align mono tiny">{kinds}</td>
                    <td className="r-align mono" style={{ fontWeight: 600 }}>{fmtNum(qty)}</td>
                    {showCost && <td className="r-align mono tiny">{fmtMoney(value, cur)}</td>}
                    <td><span className={"chip " + (f.active === false ? "zero" : "ok")}>{f.active === false ? "Closed" : "Open"}</span></td>
                    {editable && (
                      <td>
                        <div className="row" style={{ gap: 2, justifyContent: "flex-end" }}>
                          <button className="x" onClick={() => setEdit(f)} aria-label={"Edit " + f.name}><Ic d={I.edit} s={15} /></button>
                          {can(user, "delete") && <button className="x" onClick={() => setDel({ f, qty })} aria-label={"Delete " + f.name}><Ic d={I.trash} s={15} /></button>}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {edit && <FacilityForm fac={edit} onClose={() => setEdit(null)} onSave={(d) => { onSave(d, edit.id); setEdit(null); }} />}
      {del && (del.qty !== 0
        ? <Confirm text="Facility still holds stock" body={"Move or dispatch the " + fmtNum(del.qty) + " units at " + del.f.name + " before deleting it."}
            yes="Got it" onNo={() => setDel(null)} onYes={() => setDel(null)} />
        : <Confirm danger yes="Delete facility" text={"Delete " + del.f.name + "?"}
            body="Past entries keep their history, but you will not be able to book stock here any more."
            onNo={() => setDel(null)} onYes={() => { onDelete(del.f); setDel(null); }} />)}
    </div>
  );
}

function FacilityForm({ fac, onClose, onSave }) {
  const isNew = !fac.id;
  const [f, setF] = useState({ name: fac.name || "", code: fac.code || "", address: fac.address || "", active: fac.active !== false });
  const [err, setErr] = useState({});
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const save = () => {
    if (!f.name.trim()) { setErr({ name: "Give the facility a name." }); return; }
    onSave({ ...f, name: f.name.trim(), code: (f.code || f.name.slice(0, 2)).toUpperCase().slice(0, 4), address: f.address.trim() });
  };
  return (
    <Modal title={isNew ? "New facility" : "Edit facility"} onClose={onClose}
      footer={<>
        <button className="btn line" onClick={onClose}>Cancel</button>
        <button className="btn" onClick={save}>{isNew ? "Add facility" : "Save changes"}</button>
      </>}>
      <div className="modal-b grid" style={{ gap: 14 }}>
        <Field label="Name" req error={err.name}>
          <input className={"inp" + (err.name ? " err" : "")} value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Main Warehouse" autoFocus />
        </Field>
        <Field label="Short code" hint="Shown as a column header on the stock table">
          <input className="inp mono" value={f.code} maxLength={4} style={{ textTransform: "uppercase" }}
            onChange={(e) => set("code", e.target.value.toUpperCase())} placeholder="MW" />
        </Field>
        <Field label="Address">
          <textarea className="ta" value={f.address} onChange={(e) => set("address", e.target.value)} placeholder="Plot 14, Peenya Industrial Area, Bengaluru" />
        </Field>
        <label className={"check" + (f.active ? " on" : "")}>
          <input type="checkbox" checked={f.active} onChange={(e) => set("active", e.target.checked)} />
          <span><span className="cl">Open for new entries</span><span className="cd">Turn off to stop new stock being booked here.</span></span>
        </label>
      </div>
    </Modal>
  );
}

/* ---------------------------------------------------------------- users */
function Users({ db, user, onSave, onDelete, toast }) {
  const [edit, setEdit] = useState(null);
  const [del, setDel] = useState(null);

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="stats">
        <Stat label="Accounts" value={db.users.length} sub={db.users.filter((u) => u.active !== false).length + " active"} />
        <Stat label="Admins" value={db.users.filter((u) => u.role === "admin").length} sub="Full access, including users" tone="r" />
        <Stat label="Restricted to a facility" value={db.users.filter((u) => (u.facilityIds || []).length > 0).length} sub="See only their own locations" />
      </div>

      <div className="card">
        <div className="card-h">
          <div><h3 className="h-sec">Who can get in</h3><div className="tiny dim">Every account signs in with a username and PIN.</div></div>
          <div className="spacer" />
          <button className="btn sm" onClick={() => setEdit({})}><Ic d={I.plus} s={14} /> New user</button>
        </div>
        <div className="tw">
          <table className="t">
            <thead><tr>
              <th>Person</th><th>Username</th><th>Role</th><th>Can do</th><th>Facilities</th><th>Status</th><th />
            </tr></thead>
            <tbody>
              {db.users.map((u) => {
                const perms = PERMS.filter((p) => u.perms && u.perms[p.k]);
                const facNames = (u.facilityIds || []).length === 0 ? "All"
                  : (u.facilityIds || []).map((id) => (db.facilities.find((f) => f.id === id) || {}).code || "?").join(", ");
                return (
                  <tr key={u.id}>
                    <td>
                      <div className="row" style={{ gap: 9 }}>
                        <span className="avatar" style={{ width: 30, height: 30, fontSize: 12, background: u.role === "admin" ? "var(--red)" : "var(--ink)" }}>{initials(u.name)}</span>
                        <span>
                          <span className="cellname" style={{ display: "block" }}>{u.name}{u.id === user.id && <span className="pill-n" style={{ marginLeft: 7 }}>you</span>}</span>
                          <span className="cellsub">added {fmtDate(u.createdAt)}</span>
                        </span>
                      </div>
                    </td>
                    <td className="mono tiny">{u.username}</td>
                    <td><span className="chip">{(ROLES[u.role] || {}).label || u.role}</span></td>
                    <td className="tiny dim" style={{ maxWidth: 260 }}>
                      {perms.length === PERMS.length ? "Everything" : perms.length === 0 ? "Nothing yet" : perms.slice(0, 3).map((p) => p.label).join(", ") + (perms.length > 3 ? " +" + (perms.length - 3) : "")}
                    </td>
                    <td className="mono tiny">{facNames}</td>
                    <td><span className={"chip " + (u.active === false ? "zero" : "ok")}>{u.active === false ? "Off" : "Active"}</span></td>
                    <td>
                      <div className="row" style={{ gap: 2, justifyContent: "flex-end" }}>
                        <button className="x" onClick={() => setEdit(u)} aria-label={"Edit " + u.name}><Ic d={I.edit} s={15} /></button>
                        {u.id !== user.id && <button className="x" onClick={() => setDel(u)} aria-label={"Delete " + u.name}><Ic d={I.trash} s={15} /></button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {edit && <UserForm u={edit} db={db} me={user} onClose={() => setEdit(null)}
        onSave={(d) => { const ok = onSave(d, edit.id); if (ok) setEdit(null); }} />}
      {del && <Confirm danger yes="Delete user" text={"Delete " + del.name + "?"}
        body="They lose access immediately. Entries they booked keep their name for the record."
        onNo={() => setDel(null)} onYes={() => { onDelete(del); setDel(null); }} />}
    </div>
  );
}

function UserForm({ u, db, me, onClose, onSave }) {
  const isNew = !u.id;
  const [f, setF] = useState({
    name: u.name || "", username: u.username || "", pin: u.pin || "",
    role: u.role || "operator", perms: u.perms || presetPerms("operator"),
    facilityIds: u.facilityIds || [], active: u.active !== false,
  });
  const [err, setErr] = useState({});
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const setRole = (role) => setF((s) => ({ ...s, role, perms: presetPerms(role) }));
  const togglePerm = (k) => setF((s) => ({ ...s, perms: { ...s.perms, [k]: !s.perms[k] }, role: "custom" }));
  const toggleFac = (id) => setF((s) => ({
    ...s, facilityIds: s.facilityIds.includes(id) ? s.facilityIds.filter((x) => x !== id) : [...s.facilityIds, id],
  }));

  const save = () => {
    const e = {};
    if (!f.name.trim()) e.name = "Enter their name.";
    if (!/^[a-z0-9._-]{3,}$/i.test(f.username.trim())) e.username = "At least 3 characters, letters and numbers.";
    if (!/^\d{4,8}$/.test(String(f.pin))) e.pin = "PIN must be 4 to 8 digits.";
    const clash = db.users.find((x) => x.username.toLowerCase() === f.username.trim().toLowerCase() && x.id !== u.id);
    if (clash) e.username = "That username is taken.";
    setErr(e);
    if (Object.keys(e).length) return;
    onSave({ ...f, name: f.name.trim(), username: f.username.trim().toLowerCase() });
  };

  const selfDemote = !isNew && u.id === me.id;

  return (
    <Modal wide title={isNew ? "New user" : "Edit " + u.name}
      sub="Start from a role, then switch individual permissions on or off."
      onClose={onClose}
      footer={<>
        <button className="btn line" onClick={onClose}>Cancel</button>
        <button className="btn" onClick={save}>{isNew ? "Create user" : "Save changes"}</button>
      </>}>
      <div className="modal-b grid" style={{ gap: 18 }}>
        <div className="fgrid two">
          <Field label="Full name" req error={err.name}>
            <input className={"inp" + (err.name ? " err" : "")} value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Sunil M" autoFocus />
          </Field>
          <Field label="Username" req error={err.username} hint="What they type to sign in">
            <input className={"inp mono" + (err.username ? " err" : "")} value={f.username} autoCapitalize="none"
              onChange={(e) => set("username", e.target.value.replace(/\s/g, "").toLowerCase())} placeholder="sunil" />
          </Field>
          <Field label="PIN" req error={err.pin} hint="4 to 8 digits, share it with them directly">
            <input className={"inp mono" + (err.pin ? " err" : "")} value={f.pin} inputMode="numeric" maxLength={8}
              onChange={(e) => set("pin", e.target.value.replace(/\D/g, ""))} placeholder="2222" />
          </Field>
          <Field label="Role" hint={(ROLES[f.role] || { desc: "Custom mix of permissions." }).desc}>
            <select className="sel" value={f.role} onChange={(e) => setRole(e.target.value)}>
              {Object.entries(ROLES).map(([k, r]) => <option key={k} value={k}>{r.label}</option>)}
              {f.role === "custom" && <option value="custom">Custom</option>}
            </select>
          </Field>
        </div>

        <div>
          <div className="h-sec" style={{ marginBottom: 9 }}>Permissions</div>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 9 }}>
            {PERMS.map((p) => (
              <label key={p.k} className={"check" + (f.perms[p.k] ? " on" : "")}>
                <input type="checkbox" checked={!!f.perms[p.k]} onChange={() => togglePerm(p.k)}
                  disabled={selfDemote && (p.k === "users")} />
                <span><span className="cl">{p.label}</span><span className="cd">{p.desc}</span></span>
              </label>
            ))}
          </div>
          {selfDemote && <div className="hint" style={{ marginTop: 8 }}>You cannot remove your own user management rights.</div>}
        </div>

        <div>
          <div className="h-sec" style={{ marginBottom: 4 }}>Facility access</div>
          <p className="hint" style={{ marginBottom: 9 }}>Leave all unticked for every facility, or tick specific ones to limit what this person sees and can book against.</p>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 9 }}>
            {db.facilities.map((fc) => (
              <label key={fc.id} className={"check" + (f.facilityIds.includes(fc.id) ? " on" : "")}>
                <input type="checkbox" checked={f.facilityIds.includes(fc.id)} onChange={() => toggleFac(fc.id)} />
                <span><span className="cl">{fc.name}</span><span className="cd">{fc.address || fc.code}</span></span>
              </label>
            ))}
          </div>
          <div className="hint" style={{ marginTop: 8 }}>
            {f.facilityIds.length === 0 ? "Currently: all facilities." : "Currently: " + f.facilityIds.length + " of " + db.facilities.length + " facilities."}
          </div>
        </div>

        <label className={"check" + (f.active ? " on" : "")} style={{ maxWidth: 340 }}>
          <input type="checkbox" checked={f.active} onChange={(e) => set("active", e.target.checked)} disabled={selfDemote} />
          <span><span className="cl">Account is active</span><span className="cd">Switch off to block sign-in without deleting history.</span></span>
        </label>
      </div>
    </Modal>
  );
}

/* ---------------------------------------------------------------- settings */
function Settings({ db, movements, user, onSaveCompany, onReset, onSeed, toast, exportCSV }) {
  const [c, setC] = useState(db.company);
  const [confirm, setConfirm] = useState(null);
  const set = (k, v) => setC((s) => ({ ...s, [k]: v }));

  const backup = () => {
    try {
      const blob = new Blob([JSON.stringify({ db, movements }, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "aaa-doors-backup-" + todayISO() + ".json";
      document.body.appendChild(a); a.click();
      setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 500);
      toast("Backup downloaded.");
    } catch (e) { toast("Could not download the backup here.", true); }
  };

  return (
    <div className="grid" style={{ gap: 16, maxWidth: 760 }}>
      <div className="card">
        <div className="card-h"><h3 className="h-sec">Company</h3></div>
        <div className="card-b grid" style={{ gap: 14 }}>
          <div className="fgrid two">
            <Field label="Business name"><input className="inp" value={c.name} onChange={(e) => set("name", e.target.value)} /></Field>
            <Field label="Website / tagline"><input className="inp" value={c.tagline} onChange={(e) => set("tagline", e.target.value)} /></Field>
            <Field label="Currency symbol" hint="Used on every cost and value">
              <input className="inp mono" value={c.currency} maxLength={3} onChange={(e) => set("currency", e.target.value)} />
            </Field>
            <Field label="GSTIN" hint="Optional, printed on dockets later">
              <input className="inp mono" value={c.gst || ""} onChange={(e) => set("gst", e.target.value.toUpperCase())} placeholder="29ABCDE1234F1Z5" />
            </Field>
          </div>
          <div className="row"><div className="spacer" />
            <button className="btn" onClick={() => { onSaveCompany(c); toast("Company details saved."); }}>Save details</button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-h"><h3 className="h-sec">Data</h3></div>
        <div className="card-b grid" style={{ gap: 12 }}>
          <div className="row wrap-r" style={{ gap: 10 }}>
            <button className="btn line" onClick={backup}><Ic d={I.down} s={15} /> Download full backup (JSON)</button>
            <button className="btn line" onClick={() => {
              const head = ["Serial", "Type", "Date", "Party", "Truck", "Qty", "Value"];
              exportCSV("aaa-all-movements-" + todayISO() + ".csv", [head, ...movements.map((m) => [m.serial, MOVE[m.type].label, m.date, m.party, m.truckNo, movementQty(m), movementValue(m)])]);
            }}><Ic d={I.down} s={15} /> Export movements (CSV)</button>
          </div>
          <hr className="hr" />
          <div className="row wrap-r" style={{ gap: 10 }}>
            <div style={{ flex: "1 1 240px" }}>
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>Start clean</div>
              <div className="hint">Removes the demo items, facilities and entries so you can load your own. Your admin account stays.</div>
            </div>
            <button className="btn line" style={{ color: "var(--red)", borderColor: "var(--red-l)" }} onClick={() => setConfirm("reset")}>
              <Ic d={I.trash} s={15} /> Clear all stock data
            </button>
          </div>
          <hr className="hr" />
          <div className="row wrap-r" style={{ gap: 10 }}>
            <div style={{ flex: "1 1 240px" }}>
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>Reload the sample set</div>
              <div className="hint">Puts the demo warehouse, items and 15 sample entries back for training or a walkthrough.</div>
            </div>
            <button className="btn line" onClick={() => setConfirm("seed")}>Reload sample data</button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-h"><h3 className="h-sec">About this workspace</h3></div>
        <div className="card-b grid" style={{ gap: 9 }}>
          <div className="row"><span className="tiny dim">Items</span><div className="spacer" /><span className="mono tiny">{db.items.length}</span></div>
          <div className="row"><span className="tiny dim">Facilities</span><div className="spacer" /><span className="mono tiny">{db.facilities.length}</span></div>
          <div className="row"><span className="tiny dim">Entries booked</span><div className="spacer" /><span className="mono tiny">{movements.length}</span></div>
          <div className="row"><span className="tiny dim">Users</span><div className="spacer" /><span className="mono tiny">{db.users.length}</span></div>
          <div className="row"><span className="tiny dim">Next serials</span><div className="spacer" />
            <span className="mono tiny">IN {pad((db.counters.IN || 0) + 1)} · OUT {pad((db.counters.OUT || 0) + 1)} · TRF {pad((db.counters.TRF || 0) + 1)}</span></div>
        </div>
      </div>

      {confirm === "reset" && <Confirm danger yes="Clear everything" text="Clear all stock data?"
        body="Items, facilities and every entry are deleted. This cannot be undone — download a backup first if you need one."
        onNo={() => setConfirm(null)} onYes={() => { onReset(); setConfirm(null); }} />}
      {confirm === "seed" && <Confirm yes="Reload samples" text="Replace everything with sample data?"
        body="Your current items, facilities and entries are replaced by the demo set. Users are kept."
        onNo={() => setConfirm(null)} onYes={() => { onSeed(); setConfirm(null); }} />}
    </div>
  );
}

/* ---------------------------------------------------------------- raise a ticket */
function RaiseTicket({ tickets, user, onSubmit, toast }) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [kind, setKind] = useState("issue");
  const [files, setFiles] = useState([]);
  const [err, setErr] = useState({});
  const [saving, setSaving] = useState(false);

  const mine = tickets.filter((t) => t.userId === user.id);

  const submit = async () => {
    const e = {};
    if (!subject.trim()) e.subject = "Give the ticket a short title.";
    if (!body.trim() || body.trim().length < 8) e.body = "Describe the query or issue in a bit more detail.";
    setErr(e);
    if (Object.keys(e).length) return;
    setSaving(true);
    try {
      const ok = await onSubmit({
        subject: subject.trim(),
        body: body.trim(),
        kind,
        attachments: files,
      });
      if (ok) {
        setSubject("");
        setBody("");
        setKind("issue");
        setFiles([]);
        setErr({});
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="notice">
        <span className="ni"><Ic d={I.chk} s={18} /></span>
        <p><strong>Your issues or tickets will be resolved shortly.</strong> Raise a query or report a problem, attach a photo or short video if it helps, and the team will follow up.</p>
      </div>

      <div className="card">
        <div className="card-h"><h3 className="h-sec">New ticket</h3></div>
        <div className="card-b grid" style={{ gap: 16 }}>
          <div className="fgrid two">
            <Field label="Type">
              <select className="sel" value={kind} onChange={(e) => setKind(e.target.value)}>
                <option value="issue">Issue</option>
                <option value="query">Query</option>
              </select>
            </Field>
            <Field label="Subject" req error={err.subject}>
              <input className={"inp" + (err.subject ? " err" : "")} value={subject}
                onChange={(e) => setSubject(e.target.value)} placeholder="Short summary of the problem"
                maxLength={120} autoFocus />
            </Field>
          </div>
          <Field label="Describe your query or issue" req error={err.body} hint="What happened, where, and what you need">
            <textarea className={"ta" + (err.body ? " err" : "")} value={body} rows={5}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write the details here…" />
          </Field>
          <div>
            <label style={{ fontFamily: "var(--fd)", textTransform: "uppercase", letterSpacing: ".11em", fontSize: 11, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 6 }}>
              Attach photos or video
            </label>
            <MediaAttach files={files} setFiles={setFiles} onError={(m) => toast(m, true)} />
            <div className="hint" style={{ marginTop: 6 }}>Up to 4 files. Videos under 8 MB work best.</div>
          </div>
          <div className="row" style={{ justifyContent: "flex-end" }}>
            <button className="btn" disabled={saving} onClick={submit}>
              <Ic d={I.ticket} s={15} /> {saving ? "Sending…" : "Submit ticket"}
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-h">
          <h3 className="h-sec">Your tickets</h3>
          <div className="spacer" />
          <span className="tiny dim">{mine.length} raised</span>
        </div>
        {mine.length === 0 ? (
          <Empty icon={I.ticket} title="No tickets yet"
            body="When you submit a query or issue it will show up here until it is resolved." />
        ) : (
          <div className="tw">
            <table className="t">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Type</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Attachments</th>
                </tr>
              </thead>
              <tbody>
                {mine.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <div className="cellname">{relTime(t.createdAt)}</div>
                      <div className="cellsub">{fmtDateTime(t.createdAt)}</div>
                    </td>
                    <td><Chip type={t.kind === "query" ? "trf" : "out"}>{t.kind === "query" ? "Query" : "Issue"}</Chip></td>
                    <td>
                      <div className="cellname">{t.subject}</div>
                      <div className="cellsub" style={{ maxWidth: 360, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.body}</div>
                    </td>
                    <td><Chip type="in">{t.status === "open" ? "Open" : t.status}</Chip></td>
                    <td className="mono tiny">{t.attachmentCount || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- app root */
export default function AAADoorsStock() {
  const [db, setDb] = useState(null);
  const [movements, setMovements] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [user, setUser] = useState(null);
  const [view, setView] = useState("dash");
  const [entryType, setEntryType] = useState("IN");
  const [openDoc, setOpenDoc] = useState(null);
  const [docPhotos, setDocPhotos] = useState([]);
  const [drawer, setDrawer] = useState(false);
  const [booting, setBooting] = useState(true);
  const [toast, toastNode] = useToasts();

  /* ---- boot ---- */
  useEffect(() => {
    let alive = true;
    (async () => {
      let d = await store.get(K_DB);
      let m = await store.get(K_MOV);
      let t = await store.get(K_TICKETS);
      if (!d) {
        d = seedDB();
        m = seedMovements(d);
        await store.set(K_DB, d);
        await store.set(K_MOV, m);
      }
      if (!alive) return;
      setDb(d);
      setMovements(Array.isArray(m) ? m : []);
      setTickets(Array.isArray(t) ? t : []);
      setBooting(false);
    })();
    return () => { alive = false; };
  }, []);

  const stock = useMemo(() => (db ? buildStock(movements, db.items) : {}), [movements, db]);

  const persistDb = useCallback(async (next) => {
    setDb(next);
    const ok = await store.set(K_DB, next);
    if (!ok) toast("Could not save. Check your connection and try again.", true);
    return ok;
  }, [toast]);

  const persistMov = useCallback(async (next) => {
    setMovements(next);
    const ok = await store.set(K_MOV, next);
    if (!ok) toast("Could not save the entry. Try again.", true);
    return ok;
  }, [toast]);

  const exportCSV = useCallback((name, rows) => {
    const ok = downloadCSV(name, rows);
    toast(ok ? "Downloaded " + name : "Download blocked here — open the artifact in a new tab.", !ok);
  }, [toast]);

  /* ---- movements ---- */
  const saveMovement = async (payload) => {
    const type = payload.type;
    const next = JSON.parse(JSON.stringify(db));
    next.counters[type] = (next.counters[type] || 0) + 1;
    const serial = "AAA/" + type + "/" + YY() + "/" + pad(next.counters[type]);

    const lines = payload.lines.map((l) => {
      const line = { itemId: l.itemId, qty: l.qty, cost: l.cost };
      if (type === "IN") {
        const it = next.items.find((i) => i.id === l.itemId);
        if (it && Number.isInteger(l.qty) && l.qty > 0 && l.qty <= 5000) {
          const start = (it.serialSeq || 0) + 1;
          const end = (it.serialSeq || 0) + l.qty;
          it.serialSeq = end;
          line.serialFrom = it.code + "/" + pad(start);
          line.serialTo = it.code + "/" + pad(end);
        }
      }
      return line;
    });

    const id = uid("m");
    const rec = {
      id, serial, type, date: payload.date, lines,
      fromFacility: payload.fromFacility, toFacility: payload.toFacility,
      party: payload.party, truckNo: payload.truckNo, driver: payload.driver,
      notes: payload.notes, photoCount: (payload.photos || []).length,
      userId: user.id, userName: user.name, createdAt: new Date().toISOString(),
    };

    if (payload.photos && payload.photos.length) await store.set(K_PHOTO(id), payload.photos);
    const okM = await persistMov([rec, ...movements]);
    await persistDb(next);
    if (okM) {
      toast(MOVE[type].label + " booked · " + serial);
      setDocPhotos(payload.photos || []);
      setOpenDoc(rec);
    }
    return okM;
  };

  const openMovement = async (m) => {
    setOpenDoc(m);
    setDocPhotos([]);
    if (m.photoCount) {
      const p = await store.get(K_PHOTO(m.id));
      if (Array.isArray(p)) setDocPhotos(p);
    }
  };

  const deleteMovement = async (m) => {
    await store.del(K_PHOTO(m.id));
    await persistMov(movements.filter((x) => x.id !== m.id));
    setOpenDoc(null);
    toast("Entry " + m.serial + " deleted. Stock has been recalculated.");
  };

  /* ---- tickets ---- */
  const saveTicket = async (payload) => {
    const id = uid("tk");
    const rec = {
      id,
      subject: payload.subject,
      body: payload.body,
      kind: payload.kind || "issue",
      status: "open",
      attachmentCount: (payload.attachments || []).length,
      userId: user.id,
      userName: user.name,
      createdAt: new Date().toISOString(),
    };
    if (payload.attachments && payload.attachments.length) {
      const okMedia = await store.set(K_TICKET_MEDIA(id), payload.attachments);
      if (!okMedia) {
        toast("Could not save the attachments. Try fewer or smaller files.", true);
        return false;
      }
    }
    const next = [rec, ...tickets];
    setTickets(next);
    const ok = await store.set(K_TICKETS, next);
    if (!ok) {
      toast("Could not save the ticket. Try again.", true);
      return false;
    }
    toast("Ticket raised. Your issues or tickets will be resolved shortly.");
    return true;
  };

  /* ---- items ---- */
  const saveItem = async (data, id) => {
    const next = JSON.parse(JSON.stringify(db));
    if (id) {
      const it = next.items.find((i) => i.id === id);
      Object.assign(it, { name: data.name, desc: data.desc, unit: data.unit, cost: data.cost, min: data.min, active: data.active });
      toast("Item updated.");
    } else {
      next.counters.cat = next.counters.cat || {};
      next.counters.cat[data.cat] = (next.counters.cat[data.cat] || 0) + 1;
      next.items.push({
        id: uid("i"), code: data.cat + "-" + pad(next.counters.cat[data.cat]),
        name: data.name, desc: data.desc, cat: data.cat, unit: data.unit,
        cost: data.cost, min: data.min, active: data.active, serialSeq: 0, createdAt: todayISO(),
      });
      toast("Item created and ready to select.");
    }
    await persistDb(next);
  };
  const deleteItem = async (it) => {
    const used = movements.some((m) => (m.lines || []).some((l) => l.itemId === it.id));
    const next = JSON.parse(JSON.stringify(db));
    if (used) {
      const t = next.items.find((i) => i.id === it.id);
      t.active = false;
      toast("Item has history, so it was retired instead of deleted.");
    } else {
      next.items = next.items.filter((i) => i.id !== it.id);
      toast("Item deleted.");
    }
    await persistDb(next);
  };

  /* ---- facilities ---- */
  const saveFacility = async (data, id) => {
    const next = JSON.parse(JSON.stringify(db));
    if (id) { Object.assign(next.facilities.find((f) => f.id === id), data); toast("Facility updated."); }
    else { next.facilities.push({ id: uid("f"), ...data }); toast("Facility added."); }
    await persistDb(next);
  };
  const deleteFacility = async (f) => {
    const next = JSON.parse(JSON.stringify(db));
    next.facilities = next.facilities.filter((x) => x.id !== f.id);
    next.users.forEach((u) => { u.facilityIds = (u.facilityIds || []).filter((x) => x !== f.id); });
    await persistDb(next);
    toast("Facility deleted.");
  };

  /* ---- users ---- */
  const saveUser = (data, id) => {
    const next = JSON.parse(JSON.stringify(db));
    if (id) {
      const u = next.users.find((x) => x.id === id);
      Object.assign(u, data);
      if (u.id === user.id) setUser({ ...u });
      toast("Access updated for " + data.name + ".");
    } else {
      next.users.push({ id: uid("u"), ...data, createdAt: todayISO() });
      toast(data.name + " can now sign in with the PIN you set.");
    }
    persistDb(next);
    return true;
  };
  const deleteUser = async (u) => {
    const next = JSON.parse(JSON.stringify(db));
    next.users = next.users.filter((x) => x.id !== u.id);
    await persistDb(next);
    toast("User deleted.");
  };

  /* ---- settings ---- */
  const saveCompany = async (c) => {
    const next = JSON.parse(JSON.stringify(db));
    next.company = c;
    await persistDb(next);
  };
  const resetData = async () => {
    for (const m of movements) if (m.photoCount) await store.del(K_PHOTO(m.id));
    const next = JSON.parse(JSON.stringify(db));
    next.items = []; next.facilities = [];
    next.counters = { IN: 0, OUT: 0, TRF: 0, ADJ: 0, cat: {} };
    next.users.forEach((u) => { u.facilityIds = []; });
    await persistMov([]);
    await persistDb(next);
    setView("facilities");
    toast("Cleared. Add your facilities, then your items.");
  };
  const reseed = async () => {
    for (const m of movements) if (m.photoCount) await store.del(K_PHOTO(m.id));
    const fresh = seedDB();
    fresh.users = db.users;
    fresh.company = db.company;
    const ms = seedMovements(fresh);
    await persistMov(ms);
    await persistDb(fresh);
    setView("dash");
    toast("Sample data reloaded.");
  };

  /* ---- render ---- */
  if (booting) {
    return (
      <div className="aaa" style={{ display: "grid", placeItems: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center" }}>
          <Logo h={46} />
          <div className="eyebrow" style={{ marginTop: 14 }}>Loading stock…</div>
        </div>
      </div>
    );
  }
  if (!db) return null;

  if (!user) {
    return (
      <div className="aaa">
        <Login users={db.users} onLogin={(u) => { setUser(u); setView(can(u, "dashboard") ? "dash" : "stock"); }} />
        {toastNode}
      </div>
    );
  }

  const NAV = [
    { k: "dash", label: "Dashboard", icon: I.grid, show: can(user, "dashboard") },
    { k: "new", label: "New entry", icon: I.plus, show: can(user, "stockIn") || can(user, "stockOut") || can(user, "transfer") },
    { k: "stock", label: "Live stock", icon: I.layers, show: true },
    { k: "log", label: "Movement log", icon: I.list, show: can(user, "reports") },
    { k: "ticket", label: "Rise a ticket", icon: I.ticket, show: true },
    { k: "items", label: "Items", icon: I.tag, show: true },
    { k: "facilities", label: "Facilities", icon: I.bldg, show: can(user, "facilities") },
    { k: "users", label: "Users & access", icon: I.users, show: can(user, "users") },
    { k: "settings", label: "Settings", icon: I.gear, show: can(user, "users") },
  ].filter((n) => n.show);

  const titles = {
    dash: ["Overview", "Live position across every facility, and what moved recently."],
    new: ["New entry", "Book goods in, dispatch them out, or move them between your own sites."],
    stock: ["Live stock", "What is on hand right now, by item and by facility."],
    log: ["Movement log", "Every entry ever booked, with its serial, truck and proof."],
    ticket: ["Rise a ticket", "Send a query or issue — attach a photo or video if it helps."],
    items: ["Item master", "The catalogue your team picks from when booking stock."],
    facilities: ["Facilities", "Warehouses, yards and showrooms that hold stock."],
    users: ["Users & access", "Who can sign in, and exactly what each person may do."],
    settings: ["Settings", "Company details, backups and starting fresh."],
  };
  const [title, sub] = titles[view] || titles.dash;
  const lowCount = db.items.filter((i) => {
    const t = (stock[i.id] || { total: 0 }).total;
    return t <= 0 || (i.min && t < i.min);
  }).length;

  const goto = (k, t) => { setView(k); if (t) setEntryType(t); setDrawer(false); };

  return (
    <div className={"aaa" + (openDoc ? " has-docket" : "")}>
      <div className="shell">
        {drawer && <div className="scrim no-print" onClick={() => setDrawer(false)} />}
        <aside className={"side no-print" + (drawer ? " open" : "")}>
          <div className="side-top"><Logo h={40} mono /></div>
          <nav className="nav">
            <div className="nav-lbl">Working</div>
            {NAV.filter((n) => ["dash", "new", "stock", "log", "ticket"].includes(n.k)).map((n) => (
              <button key={n.k} className={"nav-i" + (view === n.k ? " on" : "")} onClick={() => goto(n.k)}>
                <Ic d={n.icon} s={17} /> {n.label}
                {n.k === "stock" && lowCount > 0 && <span className="badge">{lowCount}</span>}
              </button>
            ))}
            {NAV.some((n) => ["items", "facilities", "users", "settings"].includes(n.k)) && <div className="nav-lbl">Set up</div>}
            {NAV.filter((n) => ["items", "facilities", "users", "settings"].includes(n.k)).map((n) => (
              <button key={n.k} className={"nav-i" + (view === n.k ? " on" : "")} onClick={() => goto(n.k)}>
                <Ic d={n.icon} s={17} /> {n.label}
              </button>
            ))}
          </nav>
          <div className="side-foot">
            <div className="who">
              <span className="avatar">{initials(user.name)}</span>
              <span style={{ minWidth: 0, flex: 1 }}>
                <span style={{ display: "block", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</span>
                <span className="tiny" style={{ color: "rgba(231,238,232,.55)" }}>{(ROLES[user.role] || {}).label || "Custom access"}</span>
              </span>
              <button className="x" style={{ color: "rgba(231,238,232,.75)" }} title="Sign out"
                onClick={() => { setUser(null); setDrawer(false); }} aria-label="Sign out">
                <Ic d={I.out} s={17} />
              </button>
            </div>
          </div>
        </aside>

        <main className="main">
          <header className="topbar no-print">
            <button className="burger" onClick={() => setDrawer(true)} aria-label="Open menu">
              <Ic d={I.list} s={19} />
            </button>
            <div style={{ minWidth: 0 }}>
              <h1 className="h-page">{title}</h1>
              <p className="tiny dim" style={{ marginTop: 1 }}>{sub}</p>
            </div>
            <div className="spacer" />
            {view !== "new" && (can(user, "stockIn") || can(user, "stockOut")) && (
              <div className="row" style={{ gap: 8 }}>
                {can(user, "stockIn") && <button className="btn sm" onClick={() => goto("new", "IN")}><Ic d={I.inbox} s={15} /> Stock in</button>}
                {can(user, "stockOut") && <button className="btn red sm" onClick={() => goto("new", "OUT")}><Ic d={I.truck} s={15} /> Stock out</button>}
              </div>
            )}
          </header>

          <div className="wrap">
            {view === "dash" && can(user, "dashboard") && (
              <Dashboard db={db} movements={movements} stock={stock} user={user} go={goto} openMovement={openMovement} />
            )}
            {view === "new" && (
              <NewEntry db={db} movements={movements} stock={stock} user={user} initialType={entryType}
                onSave={saveMovement} toast={toast} go={goto} />
            )}
            {view === "stock" && <LiveStock db={db} stock={stock} user={user} go={goto} exportCSV={exportCSV} />}
            {view === "log" && can(user, "reports") && (
              <MovementLog db={db} movements={movements} user={user} openMovement={openMovement} exportCSV={exportCSV} />
            )}
            {view === "ticket" && (
              <RaiseTicket tickets={tickets} user={user} onSubmit={saveTicket} toast={toast} />
            )}
            {view === "items" && (
              <Items db={db} stock={stock} user={user} onSaveItem={saveItem} onDeleteItem={deleteItem} toast={toast} exportCSV={exportCSV} />
            )}
            {view === "facilities" && can(user, "facilities") && (
              <Facilities db={db} stock={stock} user={user} onSave={saveFacility} onDelete={deleteFacility} />
            )}
            {view === "users" && can(user, "users") && (
              <Users db={db} user={user} onSave={saveUser} onDelete={deleteUser} toast={toast} />
            )}
            {view === "settings" && can(user, "users") && (
              <Settings db={db} movements={movements} user={user} onSaveCompany={saveCompany}
                onReset={resetData} onSeed={reseed} toast={toast} exportCSV={exportCSV} />
            )}
          </div>
        </main>
      </div>

      {openDoc && (
        <Docket m={openDoc} db={db} user={user} photos={docPhotos}
          onClose={() => { setOpenDoc(null); setDocPhotos([]); }}
          onDelete={can(user, "delete") ? () => deleteMovement(openDoc) : null} />
      )}
      {toastNode}
    </div>
  );
}
