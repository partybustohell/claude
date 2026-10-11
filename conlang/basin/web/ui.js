(function () {
  "use strict";
  const D = JSON.parse(document.getElementById("data").textContent);
  const T = createTranslator(D);
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const EXAMPLES = {
    en: ["The herders drove the cattle rimward.", "I will not eat the bread.",
      "The river gives, the mountain keeps.", "Is your granary full?",
      "Three cows stand beside the house.", "The boatmen are drifting downstream.",
      "My father's horse is old.", "What do you eat?", "Where is the river?",
      "When will the boatmen come?", "Why did the herders drive the cattle rimward?", "How do you plow the field?"],
    do: ["teyëltërëpë duntërpë salko teyëltëntë", "tor våvpë këpirzhëm ley",
      "yospë döth salpë riktë", "gos bedhvë pan nüth në",
      "tel sun duntë bimpë sel dadhantë", "barlëmërpë nothko mavëknëtu nüntë"],
  };

  // romanization → IPA (initial stress)
  const R2I = [["üü", "yː"], ["öö", "øː"], ["ii", "iː"], ["uu", "uː"], ["öy", "øy"], ["ei", "ei"], ["ou", "ou"],
    ["sh", "ʃ"], ["zh", "ʒ"], ["ch", "tʃ"], ["th", "θ"], ["dh", "ð"], ["kh", "x"], ["gh", "ɣ"], ["ng", "ŋ"],
    ["ts", "ts"], ["å", "ɔː"], ["ā", "aː"], ["ē", "eː"], ["ō", "oː"], ["j", "dʒ"], ["y", "j"], ["ü", "y"],
    ["ö", "ø"], ["ë", "ə"]];
  const VOW = /[aeiouyøəɔ]/;
  function toIpa(word) {
    if (word.startsWith("⟨")) return word;
    let out = "", i = 0; const w = word.toLowerCase(); let nuclei = 0, prevV = false;
    while (i < w.length) {
      const hit = R2I.find(([r]) => w.startsWith(r, i));
      const seg = hit ? hit[1] : w[i];
      i += hit ? hit[0].length : 1;
      const isV = VOW.test(seg[0]) && !(seg === "j");
      if (isV && !prevV) nuclei++;
      prevV = isV; out += seg;
    }
    return (nuclei > 1 ? "ˈ" : "") + out;
  }
  function glossHtml(g) {
    return g.split(/([=\-.])/).map((p) => /^[0-9]*[A-Z][A-Z0-9]*$/.test(p) ? `<span class="sc">${p.toLowerCase()}</span>` : esc(p)).join("");
  }
  const igl = (words) => `<div class="igl">${words.map((w) =>
    `<span class="w"><span class="wf">${esc(w.f)}</span><span class="wg">${glossHtml(w.g)}</span></span>`).join("")}</div>`;
  const notes = (n) => n.length ? `<ul class="notes">${n.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : "";

  let dir = "en";
  try { const s = localStorage.getItem("dos-dir"); if (s === "en" || s === "do") dir = s; } catch (e) { /* storage unavailable */ }
  let lastPlain = "";

  function run() {
    const text = $("src").value;
    const res = dir === "en" ? T.en2do(text) : T.do2en(text);
    if (!res.length) {
      $("out").innerHTML = `<p class="empty">${dir === "en" ? "Type an English sentence above, or pick an example." : "Type Döspëvnë words above, or pick an example."}</p>`;
      lastPlain = ""; return;
    }
    const plain = [];
    $("out").innerHTML = res.map((r) => {
      if (dir === "en") {
        const surface = r.words.map((w) => w.f.replace(/[=\-]/g, "")).join(" ");
        const cap = surface.charAt(0).toUpperCase() + surface.slice(1);
        plain.push(cap);
        const ipa = r.words.map((w) => toIpa(w.f.replace(/[=\-]/g, ""))).join(" ");
        return `<div class="res"><p class="res-src">${esc(r.source)}</p><p class="res-main dos" lang="x-dos">${esc(cap)}</p>` +
          `<p class="res-ipa">/${esc(ipa)}/</p>${igl(r.words)}${notes(r.notes)}</div>`;
      }
      plain.push(r.reading);
      return `<div class="res"><p class="res-src" lang="x-dos">${esc(r.source)}</p><p class="res-main">${esc(r.reading || "—")}</p>` +
        `${igl(r.words)}${notes(r.notes)}</div>`;
    }).join("");
    lastPlain = plain.join(" ");
  }

  function setDir(d, keepText) {
    dir = d;
    $("dir-en").setAttribute("aria-pressed", d === "en");
    $("dir-do").setAttribute("aria-pressed", d === "do");
    $("src").setAttribute("lang", d === "en" ? "en" : "x-dos");
    try { localStorage.setItem("dos-dir", d); } catch (e) { /* storage unavailable */ }
    $("chips").innerHTML = '<span class="label">Examples</span>' +
      EXAMPLES[d].map((x, i) => `<button type="button" data-i="${i}">${esc(x)}</button>`).join("");
    if (!keepText) $("src").value = d === "en" ? EXAMPLES.en.slice(0, 3).join(" ") : EXAMPLES.do.slice(0, 3).join(". ");
    run();
  }

  $("dir-en").addEventListener("click", () => setDir("en"));
  $("dir-do").addEventListener("click", () => setDir("do"));
  $("chips").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-i]");
    if (!b) return;
    $("src").value = EXAMPLES[dir][+b.dataset.i];
    run();
  });
  let timer = null;
  $("src").addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(run, 120); });
  $("copy").addEventListener("click", () => {
    const btn = $("copy");
    const done = (msg) => { btn.textContent = msg; setTimeout(() => { btn.textContent = "Copy translation"; }, 1600); };
    if (!lastPlain) return;
    try {
      navigator.clipboard.writeText(lastPlain).then(() => done("Copied"), () => done("Select the text to copy"));
    } catch (e) { done("Select the text to copy"); }
  });
  setDir(dir, dir === "en");
  if (dir === "do") run();

  // ---------------------------------------------------------- lexicon
  const fold = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/å/g, "a").toLowerCase();
  const rows = D.lexicon.map((r) => {
    const [mod, ipa, rim, gloss, status, origin, proto, etym] = r;
    const st = status === "current" ? "" : `<span class="st">${esc(status)}</span>`;
    const html = `<tr><td><strong class="form">${esc(mod)}</strong></td><td>/${esc(ipa)}/</td>` +
      `<td>${esc(gloss)}${st}</td><td>${esc(origin)}<span class="ety">${esc(etym)}</span></td>` +
      `<td>${esc(proto)}</td><td>${esc(rim)}</td></tr>`;
    return { key: fold([mod, ipa, gloss, origin, proto].join(" ")), html };
  });
  function filterLex() {
    const q = fold($("lexq").value.trim());
    const hit = q ? rows.filter((r) => r.key.includes(q)) : rows;
    $("lexrows").innerHTML = hit.map((r) => r.html).join("") ||
      `<tr><td colspan="6">No entry matches “${esc($("lexq").value)}”. Try an English meaning or a Döspëvnë form without diacritics.</td></tr>`;
    $("lexcount").textContent = `${hit.length} of ${rows.length} entries`;
  }
  $("lexq").addEventListener("input", filterLex);
  filterLex();

  // ---------------------------------------------------------- contents highlight
  const links = [...document.querySelectorAll("#toc a")];
  if ("IntersectionObserver" in window && links.length) {
    const map = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
    const obs = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) {
        links.forEach((a) => a.classList.remove("on"));
        const a = map.get(e.target.id); if (a) a.classList.add("on");
      }
    }, { rootMargin: "0px 0px -75% 0px" });
    map.forEach((_a, id) => { const el = document.getElementById(id); if (el) obs.observe(el); });
  }
})();
