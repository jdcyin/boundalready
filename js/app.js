/* ============ SETTINGS ============ */
// Where borrow requests and recommendations go.
// Until FORMSPREE_ID is set, sending a form opens the visitor's email app with the message filled in.
// Once you have a Formspree form (formspree.io), paste its id here, e.g. "xyzabcde", and forms send directly.
const CONTACT_EMAIL = "jy@boundalready.com";
const FORMSPREE_ID = "";

const CLOTH = [["#7A2420","#F3EADF"],["#1C2F4A","#ECE7DC"],["#C4952F","#1A160E"],["#2B5752","#EEEADF"],["#4A3556","#EEE7EF"],
               ["#5B6235","#F1EEDD"],["#2E3034","#E6E3DC"],["#9A4A2B","#F5EADD"],["#8C9AA6","#121619"],["#D6C7A6","#25200F"]];
const BRIGHT = [["#F2A7BE","#2A1219"],["#3E8E5E","#F4F1E8"],["#F26A2E","#FFF4EA"],["#F4F2EC","#141414"],["#1D2A4A","#F1EDE4"],
                ["#E0322B","#FFF2EE"],["#F2C230","#1E1708"],["#161616","#F2F0EA"],["#A9C8E8","#10233A"],["#C9C4BA","#141414"],
                ["#7C2E5A","#FBEAF3"],["#0F6E8C","#EAF6FA"],["#EDE3D0","#7A2420"],["#B7D36B","#1D2410"]];
const SPINE_STYLES = ["block","block","serif","mono","band","horiz"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const RESHELVE_MS = 5000;
const byId = Object.fromEntries(BOOKS.map(b => [b.id, b]));
const $ = (id) => document.getElementById(id);
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const isOut = (b) => !!b.onLoan;

// Sends a form to CONTACT_EMAIL: through Formspree when it's set up, otherwise via the visitor's email app.
// Resolves "sent" or "mail-app"; rejects if Formspree refuses.
async function sendMessage(subject, fields){
  if (FORMSPREE_ID) {
    const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
      method:"POST", headers:{ "Accept":"application/json", "Content-Type":"application/json" },
      body: JSON.stringify({ _subject: subject, ...fields }),
    });
    if (!res.ok) throw new Error("send failed");
    return "sent";
  }
  const body = Object.entries(fields).map(([k, v]) => `${k}: ${v}`).join("\n\n");
  location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return "mail-app";
}
const canBorrow = (b) => b.format === "paper" && !isOut(b);
const countries = [...new Set(BOOKS.flatMap(b => b.country))].sort();
const genres = [...new Set(BOOKS.map(b => b.genre))].sort();

/* ============ THEME (light by default) ============ */
function applyTheme(t){
  document.documentElement.setAttribute("data-theme", t);
  $("theme-l").textContent = t === "dark" ? "Light" : "Dark";
  $("theme").setAttribute("aria-label", t === "dark" ? "Switch to light mode" : "Switch to dark mode");
}
let theme = "light";
try { theme = localStorage.getItem("ba-theme") === "dark" ? "dark" : "light"; } catch {}
applyTheme(theme);
$("theme").onclick = () => { theme = theme === "dark" ? "light" : "dark"; applyTheme(theme); try { localStorage.setItem("ba-theme", theme); } catch {} };

function coverEl(b){
  if (b.cover) { const img = document.createElement("img"); img.src = "covers/" + b.id + ".jpg"; img.alt = ""; img.draggable = false; return img; }
  const [bg, fg] = CLOTH[b.color];
  const d = document.createElement("div"); d.className = "dcover"; d.style.setProperty("--c", bg); d.style.setProperty("--t", fg);
  const t = document.createElement("div"); t.className = "ct"; t.textContent = b.title;
  const a = document.createElement("div"); a.className = "ca"; a.textContent = b.author;
  d.append(t, a);
  return d;
}
function availEl(b){
  const el = document.createElement("span");
  if (b.format !== "paper") { el.className = "avail na"; el.textContent = b.format === "ebook" ? "Read as ebook" : "Listened to"; }
  else if (isOut(b)) { el.className = "avail out"; el.textContent = "On loan"; }
  else { el.className = "avail in"; el.textContent = "Available to borrow"; }
  return el;
}

/* ============ HOME: shuffled shelf drifting left ============ */
const row = $("row"), scene = $("scene");
let period = 1, firstClone = null;
// Each spine copies its own edition's cover: colours, lettering and publisher marks.
// fs is font size as a fraction of spine width; lines sit side by side, as on a real spine.
const SPINES = {
  "stay-true": { h:.92, bg:"#DA7B4B", parts:[
    { t:"STAY TRUE", f:"'Anton'", fs:.66, c:"#F6D417" },
    { t:"HUA HSU", f:"'Anton'", fs:.5, c:"#F6D417", auto:1 } ]},
  "general-in-his-labyrinth": { h:.9, bg:"linear-gradient(180deg,#CDB792 0 64%,#6B2C7B 64%)", parts:[
    { t:"The General in His Labyrinth", f:"'Pinyon Script'", fs:.42, c:"#1B1B1B", bg:"#F5F1E5", pad:"10px 3px" },
    { t:"GARCÍA MÁRQUEZ", f:"'Josefin Sans'", wt:600, fs:.3, c:"#EAD96A", ls:".14em", auto:1 } ]},
  "love-in-the-time-of-cholera": { h:.8, bg:"linear-gradient(90deg,#24263A,#3B3547)", parts:[
    { f:"'Jost'", fs:.27, lines:[ { t:"Gabriel García Márquez", c:"#FFFFFF" }, { t:"Love in the Time of Cholera", c:"#93D4EA" } ] },
    { logo:{ bg:"#FFFFFF", fg:"#151515" }, auto:1 } ]},
  "the-plague": { h:.8, bg:"linear-gradient(180deg,#FAFAF6 0 54%,#2C5875 54% 72%,#1D3E56)", parts:[
    { f:"'Jost'", fs:.29, lines:[ { t:"Albert Camus", c:"#7FA8C2" }, { t:"The Plague", c:"#151515" } ] },
    { logo:{ bg:"#FFFFFF", fg:"#151515" }, auto:1 } ]},
  "the-vegetarian": { h:.86, bg:"#EF5759", parts:[
    { t:"THE VEGETARIAN", f:"'Bebas Neue'", fs:.62, c:"#FFFFFF", ls:".05em" },
    { t:"HAN KANG", f:"'Bebas Neue'", fs:.48, c:"#FFFFFF", ls:".08em", auto:1 } ]},
  "cold-nights": { h:.84, bg:"linear-gradient(180deg,#A3185A 0 11%,#F3F2EE 11%)", pad:"6px 0 10px", parts:[
    { t:"中", f:"'Noto Serif TC'", wt:900, fs:.42, c:"#FFFFFF", up:1 },
    { t:"寒夜", f:"'Noto Serif TC'", wt:900, fs:.5, c:"#141414", up:1, mt:"12px" },
    { t:"COLD NIGHTS", f:"'Playfair Display'", wt:900, fs:.44, c:"#141414" },
    { t:"PA CHIN", f:"'Playfair Display'", wt:700, fs:.3, c:"#141414", ls:".08em", auto:1 } ]},
  "afterparties": { h:.94, bg:"#EF4F7D", parts:[
    { t:"AFTERPARTIES", f:"'Archivo Black'", fs:.44, c:"#141414", ls:".1em" },
    { t:"Anthony Veasna So", f:"'Yellowtail'", fs:.42, c:"#F8E43C", auto:1 } ]},
  "moby-dick": { h:.8, bg:"#16191E", parts:[
    { f:"'EB Garamond'", fs:.3, lines:[ { t:"HERMAN MELVILLE", c:"#FFFFFF", fs:.24, wt:600, ls:".12em" }, { t:"MOBY-DICK", c:"#E8E6E1", ls:".08em" } ] },
    { logo:{ bg:"#FFFFFF", fg:"#16191E" }, auto:1 } ]},
  "the-corrections": { h:.97, bg:"#121212", parts:[
    { f:"'Anton'", fs:.3, ls:".02em", lines:[ { t:"JONATHAN FRANZEN", c:"#FFFFFF" }, { t:"THE CORRECTIONS", c:"#EA5A3D", it:1 } ] } ]},
};
function spinePart(p, w){
  if (p.logo) {
    const lg = document.createElement("span"); lg.className = "sp-logo" + (p.auto ? " auto" : "");
    lg.style.cssText = `width:${Math.round(w * .34)}px;height:${Math.round(w * .46)}px;background:${p.logo.bg};--fg:${p.logo.fg}`;
    return lg;
  }
  const el = document.createElement("span"); el.className = "sp" + (p.auto ? " auto" : "") + (p.up ? " up" : "");
  const px = (f) => Math.round(Math.max(8, Math.min(44, f * w)));
  el.style.fontFamily = p.f; el.style.fontSize = px(p.fs) + "px";
  if (p.wt) el.style.fontWeight = p.wt;
  if (p.ls) el.style.letterSpacing = p.ls;
  if (p.c) el.style.color = p.c;
  if (p.bg) { el.style.background = p.bg; el.style.padding = p.pad || "6px 2px"; }
  if (p.mt) el.style.marginTop = p.mt;
  if (p.lines) p.lines.forEach(l => {
    const s = document.createElement("span"); s.className = "sp-line"; s.textContent = l.t;
    if (l.c) s.style.color = l.c; if (l.fs) s.style.fontSize = px(l.fs) + "px";
    if (l.ls) s.style.letterSpacing = l.ls; if (l.wt) s.style.fontWeight = l.wt; if (l.it) s.style.fontStyle = "italic";
    el.append(s);
  }); else el.textContent = p.t;
  return el;
}
function makeBook(b, H){
  const s = H / 340, spec = SPINES[b.id];
  const h = Math.round(H * (spec ? spec.h : rand(0.6, 0.97)));
  const w = Math.round(Math.max(26, Math.min(64, b.pages / 9)) * s);
  const cw = Math.round(h * 0.66);
  const faceOut = b.cover && Math.random() < 0.14;
  const btn = document.createElement("button"); btn.type = "button";
  btn.className = "bk" + (faceOut ? " faceout" : "");
  btn.dataset.id = b.id;
  btn.setAttribute("aria-label", `${b.title} by ${b.author}`);
  let sf;
  if (spec) {
    btn.style.cssText = `--w:${w}px;--h:${h}px;--cw:${cw}px`;
    sf = document.createElement("span"); sf.className = "face spine-face custom";
    sf.style.background = spec.bg; if (spec.pad) sf.style.padding = spec.pad;
    spec.parts.forEach(p => sf.append(spinePart(p, w)));
  } else {
    let style = pick(SPINE_STYLES); if (style === "horiz" && w < 44) style = "block";
    const pal = pick(BRIGHT), band = pick(BRIGHT);
    const fs = Math.round(Math.max(11, Math.min(17, w * 0.42)));
    const big = Math.round(Math.max(14, Math.min(46, w * 0.72)));
    btn.style.cssText = `--w:${w}px;--h:${h}px;--cw:${cw}px;--c:${pal[0]};--t:${pal[1]};--c2:${band[0]};--fs:${fs}px;--big:${big}px`;
    sf = document.createElement("span"); sf.className = `face spine-face st-${style}`;
    const t = document.createElement("span"); t.className = "t"; t.textContent = b.title;
    const a = document.createElement("span"); a.className = "a"; a.textContent = b.last;
    sf.append(t, a);
  }
  if (isOut(b)) { const o = document.createElement("span"); o.className = "out"; sf.append(o); }
  const cf = document.createElement("span"); cf.className = "face cover-face"; cf.append(coverEl(b));
  const rb = document.createElement("span"); rb.className = "ribbon"; rb.textContent = "Open";
  btn.append(sf, cf, rb);
  return { btn, h, faceOut };
}
function buildShelf(){
  reshelve();
  const sceneW = scene.clientWidth || innerWidth;
  const H = Math.round(Math.max(210, Math.min(380, innerHeight * 0.42, sceneW * 0.62)));
  scene.style.setProperty("--H", H + "px");
  row.textContent = ""; row.style.transform = "";
  let k = 0, prevTilt = 0, prevFace = false, lastId = null, round = 0;
  // A short list is laid out more than once (each copy styled afresh) so the shelf always fills the screen.
  const place = (b) => {
    const { btn, h, faceOut } = makeBook(b, H);
    if (round > 0) btn.tabIndex = -1;
    const u = document.createElement("div"); u.className = "unit"; u.dataset.k = k++;
    // some books lean left or right, as on a real shelf
    let tilt = 0;
    if (!faceOut && !prevFace && Math.random() < 0.5) tilt = Math.random() < 0.5 ? -rand(4, 12) : rand(4, 10);
    let gap = faceOut || prevFace ? rand(14, 26) : Math.random() < 0.12 ? rand(28, 56) : rand(2, 5);
    if (tilt < 0) { gap += Math.sin(-tilt * Math.PI / 180) * h; u.style.transformOrigin = "bottom left"; }
    if (prevTilt > 0) gap += Math.sin(prevTilt * Math.PI / 180) * 300;
    if (tilt > 0) u.style.transformOrigin = "bottom right";
    if (tilt) u.style.transform = `rotate(${tilt.toFixed(1)}deg)`;
    u.style.marginLeft = Math.round(gap) + "px";
    u.append(btn); row.append(u);
    prevTilt = tilt; prevFace = faceOut; lastId = b.id;
  };
  do {
    let order = shuffle(BOOKS);
    if (order[0].id === lastId) order.push(order.shift());
    order.forEach(place);
    round++;
  } while (row.scrollWidth < sceneW + 160 && round < 8);
  const end = document.createElement("div"); end.className = "unit"; end.style.width = "40px"; end.dataset.k = k++; row.append(end);
  while (row.scrollWidth < sceneW + 160) { const sp = document.createElement("div"); sp.className = "unit"; sp.style.width = "80px"; sp.dataset.k = k++; row.append(sp); }
  const originals = [...row.children];
  originals.forEach(n => { const c = n.cloneNode(true); c.setAttribute("aria-hidden", "true"); c.querySelectorAll("button").forEach(btn => btn.tabIndex = -1); row.append(c); });
  firstClone = row.children[originals.length];
  measure(); applyPos();
}
function measure(){ if (firstClone) period = Math.max(1, firstClone.offsetLeft - row.firstElementChild.offsetLeft); }
let x = 0, v = 0, hovering = false, drag = null, suppressClick = false, raf = 0, running = false;
const DRIFT = reduceMotion ? 0 : 0.32;
// x is kept within one loop, so when a turning book lengthens the loop the shelf doesn't jump
function applyPos(){ x = ((x % period) + period) % period; row.style.transform = `translate3d(${-x}px,0,0)`; }
let focusBk = null, rushUntil = 0;
function tick(){
  if (drag) {}
  else if (performance.now() < rushUntil) {
    // About: the shelf slides quickly away to the left
    v += (60 - v) * 0.12; x += v;
  } else if (focusBk) {
    // a book that's been taken down glides to the centre of the shelf, by the shortest way round the loop
    const r = focusBk.getBoundingClientRect(), s = scene.getBoundingClientRect();
    let delta = (r.left + r.width / 2) - (s.left + s.width / 2);
    delta = ((delta + period / 2) % period + period) % period - period / 2;
    x += (reduceMotion || Math.abs(delta) < 0.5) ? delta : delta * 0.12; v = 0;
  } else {
    const target = hovering ? 0 : DRIFT;
    v += (target - v) * (reduceMotion ? 0.3 : 0.03);
    x += v;
  }
  measure(); applyPos();
  raf = requestAnimationFrame(tick);
}
function startLoop(){ if (!running) { running = true; raf = requestAnimationFrame(tick); } }
function stopLoop(){ running = false; cancelAnimationFrame(raf); }
scene.addEventListener("wheel", e => {
  e.preventDefault();
  const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1;
  const d = (Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX) * unit;
  if (reduceMotion) x += d; else v = Math.max(-40, Math.min(40, v + d * 0.04));
}, { passive:false });
scene.addEventListener("pointerenter", e => { if (e.pointerType === "mouse") hovering = true; });
scene.addEventListener("pointerleave", () => { hovering = false; });
scene.addEventListener("pointerdown", e => { if (e.button !== 0) return; drag = { x0:e.clientX, xStart:x, last:e.clientX, t:performance.now(), vel:0, moved:0, id:e.pointerId }; });
scene.addEventListener("pointermove", e => {
  if (!drag) return;
  const dx = e.clientX - drag.x0;
  drag.moved = Math.max(drag.moved, Math.abs(dx));
  if (drag.moved > 6) {
    if (!scene.classList.contains("dragging")) { scene.classList.add("dragging"); try { scene.setPointerCapture(drag.id); } catch {} }
    x = drag.xStart - dx;
    const now = performance.now(), dt = Math.max(1, now - drag.t);
    drag.vel = 0.75 * (-(e.clientX - drag.last) / dt * 16) + 0.25 * drag.vel;
    drag.last = e.clientX; drag.t = now;
  }
});
function endDrag(){
  if (!drag) return;
  if (drag.moved > 6) { suppressClick = true; setTimeout(() => suppressClick = false, 0); v = (performance.now() - drag.t < 90 && !reduceMotion) ? Math.max(-40, Math.min(40, drag.vel)) : 0; }
  scene.classList.remove("dragging"); drag = null;
}
scene.addEventListener("pointerup", endDrag);
scene.addEventListener("pointercancel", endDrag);

// Take a book down: first click turns it to its cover, second click opens it.
let selectedK = null, reshelveTimer = 0;
scene.addEventListener("click", e => {
  if (suppressClick) { e.stopPropagation(); e.preventDefault(); return; }
  const bk = e.target.closest(".bk"); if (!bk) return;
  const k = bk.closest(".unit").dataset.k;
  // opening the book puts it straight back, so the shelf carries on moving behind the pop-out
  if (k === selectedK) { reshelve(); openBook(bk.dataset.id); }
  else takeDown(k, bk);
}, true);
scene.addEventListener("keydown", e => {
  const bk = e.target.closest(".bk");
  if (bk && (e.key === "Enter" || e.key === " ")) {
    e.preventDefault();
    const k = bk.closest(".unit").dataset.k;
    if (k === selectedK) { reshelve(); openBook(bk.dataset.id); } else takeDown(k, bk);
    return;
  }
  const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
  if (dir) { e.preventDefault(); if (reduceMotion) x += dir * 80; else v += dir * 5; }
});
function takeDown(k, bk){
  reshelve();
  selectedK = k; focusBk = bk;
  // turn the book and its loop twin together (standing it up straight) so the loop stays seamless
  row.querySelectorAll(`.unit[data-k="${k}"]`).forEach(u => u.classList.add("down"));
  row.querySelectorAll(`.unit[data-k="${k}"] .bk`).forEach(b => b.classList.add("turned"));
  setCaption(byId[bk.dataset.id]);
  reshelveTimer = setTimeout(reshelve, RESHELVE_MS);
}
function reshelve(){
  clearTimeout(reshelveTimer);
  focusBk = null;
  if (selectedK == null) return;
  row.querySelectorAll(".unit.down").forEach(u => u.classList.remove("down"));
  row.querySelectorAll(".bk.turned").forEach(b => b.classList.remove("turned"));
  selectedK = null;
  setCaption(null);
}
function setCaption(b){
  const c = $("caption"); c.textContent = "";
  if (!b) return;
  const k = document.createElement("div"); k.className = "label kicker"; k.textContent = `${b.country.join(" · ")} · ${b.genre}`;
  const t = document.createElement("div"); t.className = "ct"; t.textContent = b.title;
  const a = document.createElement("div"); a.className = "ca"; a.textContent = b.author;
  c.append(k, t, a);
}
let resizeT;
addEventListener("resize", () => { clearTimeout(resizeT); resizeT = setTimeout(() => { if (!$("page-home").hidden) buildShelf(); }, 200); });

/* ============ ARCHIVES: cover tiles, grouped by the toggle ============ */
let arrangeBy = "all";
const byTitle = (a,b) => a.title.replace(/^The /, "").localeCompare(b.title.replace(/^The /, ""));
function archiveGroups(){
  const newestFirst = (a,b) => (b.year - a.year) || (b.month - a.month) || ((b.day || 0) - (a.day || 0));
  if (arrangeBy === "all") return [{ label:null, books:[...BOOKS].sort(newestFirst) }];
  const groups = new Map();
  const add = (k, b) => { if (!groups.has(k)) groups.set(k, []); groups.get(k).push(b); };
  BOOKS.forEach(b => {
    if (arrangeBy === "country") b.country.forEach(c => add(c, b));
    if (arrangeBy === "genre") add(b.genre, b);
    if (arrangeBy === "year") add(String(b.year), b);
    if (arrangeBy === "author") add(b.author, b);
  });
  const keys = [...groups.keys()];
  if (arrangeBy === "author") keys.sort((a,b) => groups.get(a)[0].last.localeCompare(groups.get(b)[0].last));
  else if (arrangeBy === "year") keys.sort((a,b) => b - a);
  else keys.sort();
  return keys.map(k => ({ label:k, books: groups.get(k).sort(newestFirst) }));
}
function tile(b){
  const card = document.createElement("div"); card.className = "card";
  const cb = document.createElement("button"); cb.type = "button"; cb.className = "cvbtn"; cb.setAttribute("aria-label", `Open ${b.title}`);
  const cv = document.createElement("div"); cv.className = "cv"; cv.append(coverEl(b)); cb.append(cv);
  cb.onclick = () => openBook(b.id);
  const ti = document.createElement("div"); ti.className = "ti"; ti.textContent = b.title;
  const au = document.createElement("div"); au.className = "au"; au.textContent = b.author;
  card.append(cb, ti, au);
  return card;
}
function renderArchive(){
  const body = $("archive-body"); body.textContent = "";
  archiveGroups().forEach(g => {
    if (g.label) {
      const h = document.createElement("div"); h.className = "sectionhead";
      const t = document.createElement("h2"); t.textContent = g.label;
      h.append(t); body.append(h);
    }
    const grid = document.createElement("div"); grid.className = "grid";
    if (!g.label) grid.style.marginTop = "36px";
    g.books.forEach(b => grid.append(tile(b)));
    body.append(grid);
  });
}
document.querySelectorAll("#arr button").forEach(btn => btn.onclick = () => {
  arrangeBy = btn.dataset.by;
  document.querySelectorAll("#arr button").forEach(b => b.setAttribute("aria-pressed", b === btn));
  renderArchive();
});

/* ============ BOOK POP-OUT with its own Borrow section ============ */
let openId = null, borrowOpen = false;
function openBook(id, expandBorrow){
  const b = byId[id]; if (!b) return;
  if (openId !== id) {
    openId = id; borrowOpen = !!expandBorrow;
    const cv = $("d-cover"); cv.textContent = ""; cv.append(coverEl(b));
    $("d-title").textContent = b.title;
    const r = $("d-reflection");
    r.textContent = "";
    (b.reflection || "").split(/\n\n+/).forEach(para => {
      // a paragraph in quotation marks is a passage from the book
      const el = document.createElement(/^[“"]/.test(para) ? "blockquote" : "p");
      el.textContent = para; r.append(el);
    });
  } else if (expandBorrow) borrowOpen = true;
  renderBorrowBox(b);
  if (!$("dlg").open) $("dlg").showModal();
  if (borrowOpen) setTimeout(() => $("bf-name")?.focus(), 50);
}
function field(id, label, type, extra){
  const wrap = document.createElement("div"); wrap.className = "field";
  const l = document.createElement("label"); l.htmlFor = id; l.textContent = label;
  const i = document.createElement(type === "textarea" ? "textarea" : "input");
  i.id = id; if (type !== "textarea") i.type = type; Object.assign(i, extra || {});
  if (type === "textarea") i.style.minHeight = "70px";
  wrap.append(l, i); return wrap;
}
function renderBorrowBox(b){
  const box = $("d-borrow"); box.textContent = "";
  const head = document.createElement("div"); head.className = "bh";
  const left = document.createElement("div");
  const lab = document.createElement("div"); lab.className = "label"; lab.textContent = "Borrow"; lab.style.marginBottom = "4px";
  left.append(lab, availEl(b));
  head.append(left);
  if (b.format !== "paper") {
    const p = document.createElement("p"); p.textContent = "There's no paper copy of this one to lend."; head.append(p);
    box.append(head);
  } else {
    if (!borrowOpen) {
      const btn = document.createElement("button"); btn.type = "button"; btn.className = "btn";
      btn.textContent = isOut(b) ? "Ask to be next" : "Borrow";
      btn.onclick = () => { borrowOpen = true; renderBorrowBox(b); $("bf-name").focus(); };
      head.append(btn);
    }
    box.append(head);
    if (borrowOpen) box.append(borrowForm(b));
  }
}
function borrowForm(b){
  const f = document.createElement("form"); f.noValidate = true;
  const r2 = document.createElement("div"); r2.className = "row2";
  r2.append(field("bf-name", "Your name", "text", { maxLength:80 }), field("bf-contact", "How I can reach you", "text", { maxLength:120, placeholder:"Email, phone or Instagram" }));
  f.append(r2, field("bf-note", "Anything I should know (optional)", "textarea", { maxLength:500 }));
  const foot = document.createElement("div"); foot.className = "formfoot";
  const sub = document.createElement("button"); sub.className = "btn"; sub.type = "submit"; sub.textContent = "Send request";
  const msg = document.createElement("span"); msg.className = "status-msg"; msg.setAttribute("role", "status");
  foot.append(sub, msg); f.append(foot);
  f.onsubmit = async e => {
    e.preventDefault();
    const name = $("bf-name").value.trim(), contact = $("bf-contact").value.trim(), note = $("bf-note").value.trim();
    if (!name || !contact) { msg.className = "status-msg err"; msg.textContent = "Add your name and how to reach you."; return; }
    sub.disabled = true; msg.className = "status-msg"; msg.textContent = "Sending…";
    try {
      const how = await sendMessage(`Borrow request: ${b.title}`, { Book: `${b.title} by ${b.author}`, Name: name, Contact: contact, Note: note || "—" });
      f.replaceChildren();
      const p = document.createElement("p"); p.style.margin = "0";
      p.textContent = how === "sent" ? `Request sent. I'll be in touch about ${b.title}.` : `Your email app should open with the request ready to send to ${CONTACT_EMAIL}.`;
      f.append(p);
    } catch {
      sub.disabled = false; msg.className = "status-msg err";
      msg.textContent = `That didn't send. Try again, or email ${CONTACT_EMAIL}.`;
    }
  };
  return f;
}
$("d-close").onclick = () => $("dlg").close();
$("dlg").addEventListener("click", e => { if (e.target === $("dlg")) $("dlg").close(); });
$("dlg").addEventListener("close", () => { openId = null; });

/* ============ BORROW PAGE ============ */
const lendable = BOOKS.filter(b => b.format === "paper").sort((a,b) => a.title.localeCompare(b.title));
function renderLendGrid(){
  const g = $("lend-grid"); g.textContent = "";
  $("lend-count").textContent = `${lendable.filter(b => !isOut(b)).length} of ${lendable.length} available`;
  lendable.forEach(b => {
    const card = document.createElement("div"); card.className = "card";
    const cb = document.createElement("button"); cb.type = "button"; cb.className = "cvbtn"; cb.setAttribute("aria-label", `Borrow ${b.title}`);
    const cv = document.createElement("div"); cv.className = "cv"; cv.append(coverEl(b)); cb.append(cv);
    cb.onclick = () => openBook(b.id);
    const ti = document.createElement("div"); ti.className = "ti"; ti.textContent = b.title;
    const au = document.createElement("div"); au.className = "au"; au.textContent = b.author;
    card.append(cb, ti, au, availEl(b));
    g.append(card);
  });
}

/* ============ RECOMMEND ============ */
const why = $("rec-why");
why.addEventListener("input", () => { const n = why.value.trim().length; $("rec-why-help").textContent = n >= 80 ? `${n} characters` : `${80 - n} more characters, please.`; });
$("rec-form").addEventListener("submit", async e => {
  e.preventDefault();
  const msg = $("rec-status");
  const title = $("rec-title").value.trim(), author = $("rec-author").value.trim(), name = $("rec-name").value.trim(), text = why.value.trim();
  if (!title || !author || !name) { msg.className = "status-msg err"; msg.textContent = "Fill in the title, author and your name."; return; }
  if (text.length < 80) { msg.className = "status-msg err"; msg.textContent = "Tell me a bit more about why. At least 80 characters."; why.focus(); return; }
  $("rec-submit").disabled = true; msg.className = "status-msg"; msg.textContent = "Sending…";
  try {
    const how = await sendMessage(`Recommendation: ${title}`, { Book: `${title} by ${author}`, "Why read it": text, From: name });
    if (how === "sent") { $("rec-form").reset(); $("rec-why-help").textContent = "At least 80 characters, please."; }
    msg.className = "status-msg ok";
    msg.textContent = how === "sent" ? "Thank you. It's on my list." : "Your email app should open with the recommendation ready to send.";
  } catch {
    msg.className = "status-msg err";
    msg.textContent = `That didn't send. Try again, or email ${CONTACT_EMAIL}.`;
  } finally { $("rec-submit").disabled = false; }
});

/* ============ ROUTER ============ */
const PAGES = ["home","archive","borrow","recommend"];
let shelfBuilt = false;
function markNav(page){ document.querySelectorAll("nav.top a").forEach(a => { if (a.dataset.page === page) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); }); }
function route(){
  const h = location.hash.slice(1);
  const page = PAGES.includes(h) ? h : "home";
  PAGES.forEach(p => { $("page-" + p).hidden = p !== page; });
  markNav(page);
  window.scrollTo(0, 0);
  if (page === "home") { if (!shelfBuilt) { buildShelf(); shelfBuilt = true; } startLoop(); } else { stopLoop(); reshelve(); }
  if (page === "archive") renderArchive();
  if (page === "borrow") renderLendGrid();
  if (h === "about") openAbout();
}

/* ============ ABOUT: the shelf slides away and a book opens ============ */
const about = $("about");
let aboutTimers = [];
function later(fn, ms){ aboutTimers.push(setTimeout(fn, reduceMotion ? 0 : ms)); }
function openAbout(){
  aboutTimers.forEach(clearTimeout); aboutTimers = [];
  // on the shelf, the books slide away first; on other pages the book just appears and opens
  const onShelf = !$("page-home").hidden;
  markNav("about");
  if (onShelf) { reshelve(); if (!reduceMotion) rushUntil = performance.now() + 650; }
  later(() => {
    about.hidden = false;
    requestAnimationFrame(() => about.classList.add("show"));
    $("about-close").focus();
    later(() => about.classList.add("open"), 450);
  }, onShelf ? 480 : 0);
}
function closeAbout(){
  if (about.hidden) return;
  aboutTimers.forEach(clearTimeout); aboutTimers = [];
  about.classList.remove("open");
  later(() => { about.classList.remove("show"); later(() => { about.hidden = true; }, 420); }, 650);
  if (location.hash === "#about") history.replaceState(null, "", "#home");
  markNav(PAGES.find(p => !$("page-" + p).hidden) || "home");
}
document.querySelector('nav.top a[data-page="about"]').addEventListener("click", e => { e.preventDefault(); openAbout(); });
$("about-close").onclick = closeAbout;
$("ab-copy").addEventListener("click", () => {
  const btn = $("ab-copy"), email = $("ab-email").textContent;
  const done = (label) => { btn.textContent = label; setTimeout(() => { btn.textContent = "Copy"; }, 1600); };
  const selectIt = () => { const r = document.createRange(); r.selectNodeContents($("ab-email")); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); done("Selected"); };
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(email).then(() => done("Copied"), selectIt);
  else selectIt();
});
about.addEventListener("click", e => { if (e.target === about) closeAbout(); });
addEventListener("keydown", e => { if (e.key === "Escape") closeAbout(); });

addEventListener("hashchange", () => { closeAbout(); route(); });
setCaption(null);
route();
if (document.fonts?.ready) document.fonts.ready.then(() => { measure(); });
