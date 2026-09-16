/* Prueft die Oeffnungslogik aus assets/js/site.js gegen feste Zeitpunkte.
 *
 *     npm install --no-save jsdom && node tools/test-status.js
 *
 * Die Sprechzeiten in FIXTURE sind Testdaten, nicht die echten Zeiten der
 * Praxis — geprueft wird die Logik, nicht der Inhalt.
 */
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const SCRIPT = fs.readFileSync(
  path.join(__dirname, "..", "assets", "js", "site.js"), "utf8");

// Mo/Di/Do vormittags + nachmittags, Mi/Fr nur vormittags, Sa/So geschlossen.
const FIXTURE = {
  1: [["08:30", "12:00"], ["16:00", "19:00"]],
  2: [["08:30", "12:00"], ["16:00", "18:00"]],
  3: [["08:30", "12:00"]],
  4: [["08:30", "12:00"], ["16:00", "18:00"]],
  5: [["08:30", "12:00"]],
};
const NAMES = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag",
  "Freitag", "Samstag"];

const ROWS = Object.keys(FIXTURE).map((day) => {
  const cells = FIXTURE[day]
    .map(([a, b]) => `<time datetime="${a}">${a}</time>–<time datetime="${b}">${b}</time>`)
    .join(", ");
  return `<tr data-day="${day}"><th>${NAMES[day]}</th><td>${cells}</td></tr>`;
}).join("");

const PAGE = `<!doctype html><html><body>
  <table data-hours><tbody>${ROWS}</tbody></table>
  <p data-status><span data-status-label></span><span data-status-detail></span></p>
</body></html>`;

/* Laeuft site.js mit eingefrorener Uhr und gibt zurueck, was angezeigt wird. */
async function runAt(iso) {
  const dom = new JSDOM(PAGE, { runScripts: "outside-only", pretendToBeVisual: true });
  const win = dom.window;

  const Real = win.Date;
  const frozen = new Real(iso);
  // Nur new Date() ohne Argumente wird eingefroren; alles andere bleibt echt.
  function FakeDate(...args) {
    return args.length ? new Real(...args) : frozen;
  }
  FakeDate.prototype = Real.prototype;
  FakeDate.now = () => frozen.getTime();
  win.Date = FakeDate;

  // jsdom kennt kein matchMedia, jeder Browser schon.
  win.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });

  win.eval(SCRIPT);

  // site.js wartet auf DOMContentLoaded, solange der Parser laeuft.
  if (win.document.readyState === "loading") {
    await new Promise((resolve) =>
      win.document.addEventListener("DOMContentLoaded", resolve, { once: true }));
  }

  const node = win.document.querySelector("[data-status]");
  const todayRow = win.document.querySelector("tr[data-today]");
  const result = {
    state: node.getAttribute("data-state"),
    text: node.querySelector("[data-status-label]").textContent + " · " +
      node.querySelector("[data-status-detail]").textContent,
    today: todayRow ? todayRow.querySelector("th").textContent.replace(" (heute)", "") : null,
  };

  win.close(); // site.js haelt einen Minutentakt offen
  return result;
}

// Zeitpunkte in UTC. Europe/Berlin liegt im Sommer +2, im Winter +1 —
// genau darum steht die Zeitzone fest im Code und nicht im Browser.
const CASES = [
  ["2026-09-14T08:00:00Z", "open", "Jetzt geöffnet · noch bis 12:00 Uhr", "Montag"],
  ["2026-09-14T13:00:00Z", "closed", "Zurzeit geschlossen · öffnet heute um 16:00 Uhr", "Montag"],
  ["2026-09-14T15:30:00Z", "open", "Jetzt geöffnet · noch bis 19:00 Uhr", "Montag"],
  ["2026-09-14T17:30:00Z", "closed", "Zurzeit geschlossen · öffnet Dienstag um 8:30 Uhr", "Montag"],
  // Mittwochnachmittag geschlossen -> naechster Tag
  ["2026-09-16T13:00:00Z", "closed", "Zurzeit geschlossen · öffnet Donnerstag um 8:30 Uhr", "Mittwoch"],
  // Freitagabend -> ueber das Wochenende hinweg auf Montag
  ["2026-09-18T12:00:00Z", "closed", "Zurzeit geschlossen · öffnet Montag um 8:30 Uhr", "Freitag"],
  // Samstag: keine Zeile vorhanden, Status nennt trotzdem den naechsten Termin
  ["2026-09-19T10:00:00Z", "closed", "Zurzeit geschlossen · öffnet Montag um 8:30 Uhr", null],
  // Randfaelle: zur Oeffnungsminute offen, zur Schlussminute zu
  ["2026-09-14T06:30:00Z", "open", "Jetzt geöffnet · noch bis 12:00 Uhr", "Montag"],
  ["2026-09-14T10:00:00Z", "closed", "Zurzeit geschlossen · öffnet heute um 16:00 Uhr", "Montag"],
  // Winterzeit (+1): 08:00 UTC = 9:00 Ortszeit -> offen
  ["2026-12-14T08:00:00Z", "open", "Jetzt geöffnet · noch bis 12:00 Uhr", "Montag"],
  // Winterzeit: 11:30 UTC = 12:30 Ortszeit -> zu
  ["2026-12-14T11:30:00Z", "closed", "Zurzeit geschlossen · öffnet heute um 16:00 Uhr", "Montag"],
];

(async () => {
  let failed = 0;
  for (const [iso, state, text, today] of CASES) {
    const got = await runAt(iso);
    const ok = got.state === state && got.text === text && got.today === today;
    if (!ok) failed++;
    console.log(`${ok ? "OK  " : "FAIL"} ${iso}  ${got.state.padEnd(6)} ${got.text}  [${got.today}]`);
    if (!ok) console.log(`     erwartet: ${state}  ${text}  [${today}]`);
  }
  console.log(failed
    ? `\n${failed} von ${CASES.length} fehlgeschlagen.`
    : `\nAlle ${CASES.length} Fälle bestanden.`);
  process.exit(failed ? 1 : 0);
})();
