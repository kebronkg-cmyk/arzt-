/* Praxis Dres. Maasz — progressive Ergaenzungen.
 *
 * Grundsatz: ohne dieses Skript ist die Seite vollstaendig lesbar und
 * bedienbar. Es markiert den heutigen Tag, rechnet den Oeffnungsstatus aus
 * und liefert einen Fallback fuer Browser ohne scroll-getriebene Animationen.
 */
(function () {
  "use strict";

  var TZ = "Europe/Berlin";
  var WEEKDAY = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  var DAY_NAME = [
    "Sonntag", "Montag", "Dienstag", "Mittwoch",
    "Donnerstag", "Freitag", "Samstag"
  ];

  /* --- Zeit ------------------------------------------------------------- */

  /* Immer Ortszeit der Praxis, egal wo die Besucherin gerade sitzt. */
  function nowInPraxis() {
    var parts = new Intl.DateTimeFormat("en-US", {
      timeZone: TZ,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    }).formatToParts(new Date());

    var get = function (type) {
      for (var i = 0; i < parts.length; i++) {
        if (parts[i].type === type) return parts[i].value;
      }
      return "";
    };

    return {
      day: WEEKDAY[get("weekday")],
      minutes: parseInt(get("hour"), 10) * 60 + parseInt(get("minute"), 10)
    };
  }

  function toMinutes(hhmm) {
    var bits = hhmm.split(":");
    return parseInt(bits[0], 10) * 60 + parseInt(bits[1], 10);
  }

  function toClock(minutes) {
    var h = Math.floor(minutes / 60);
    var m = minutes % 60;
    return h + ":" + (m < 10 ? "0" + m : m);
  }

  /* --- Sprechzeiten aus dem Markup lesen -------------------------------- */

  /* Einzige Quelle sind die <time datetime>-Elemente in der Tabelle. Sie
   * stehen paarweise fuer Beginn und Ende einer Sprechstunde, damit
   * sichtbarer Text und Berechnung nicht auseinanderlaufen koennen. */
  function readSchedule(table) {
    var schedule = {};
    var rows = table.querySelectorAll("tr[data-day]");

    Array.prototype.forEach.call(rows, function (row) {
      var day = parseInt(row.getAttribute("data-day"), 10);
      var stamps = row.querySelectorAll("time[datetime]");
      var ranges = [];

      for (var i = 0; i + 1 < stamps.length; i += 2) {
        var from = toMinutes(stamps[i].getAttribute("datetime"));
        var to = toMinutes(stamps[i + 1].getAttribute("datetime"));
        if (to > from) ranges.push({ from: from, to: to, row: row });
      }

      schedule[day] = ranges;
    });

    return schedule;
  }

  /* --- Status ------------------------------------------------------------ */

  function currentState(schedule, now) {
    var today = schedule[now.day] || [];
    var i;

    for (i = 0; i < today.length; i++) {
      if (now.minutes >= today[i].from && now.minutes < today[i].to) {
        return { open: true, until: today[i].to };
      }
    }

    /* Noch heute? */
    for (i = 0; i < today.length; i++) {
      if (today[i].from > now.minutes) {
        return { open: false, nextDay: now.day, nextFrom: today[i].from };
      }
    }

    /* Sonst der naechste Tag mit Sprechstunde. */
    for (var step = 1; step <= 7; step++) {
      var day = (now.day + step) % 7;
      var ranges = schedule[day] || [];
      if (ranges.length) {
        return { open: false, nextDay: day, nextFrom: ranges[0].from };
      }
    }

    return { open: false };
  }

  function renderStatus(node, state, now) {
    var label = node.querySelector("[data-status-label]");
    var detail = node.querySelector("[data-status-detail]");
    if (!label || !detail) return;

    node.setAttribute("data-state", state.open ? "open" : "closed");

    if (state.open) {
      label.textContent = "Jetzt geöffnet";
      detail.textContent = "noch bis " + toClock(state.until) + " Uhr";
      return;
    }

    label.textContent = "Zurzeit geschlossen";

    if (typeof state.nextFrom !== "number") {
      detail.textContent = "Sprechzeiten siehe unten";
    } else if (state.nextDay === now.day) {
      detail.textContent = "öffnet heute um " + toClock(state.nextFrom) + " Uhr";
    } else {
      detail.textContent =
        "öffnet " + DAY_NAME[state.nextDay] + " um " +
        toClock(state.nextFrom) + " Uhr";
    }
  }

  function markToday(table, now) {
    var rows = table.querySelectorAll("tr[data-day]");
    Array.prototype.forEach.call(rows, function (row) {
      var isToday = parseInt(row.getAttribute("data-day"), 10) === now.day;
      if (isToday) {
        row.setAttribute("data-today", "");
        var cell = row.querySelector("th");
        if (cell && !cell.querySelector(".visually-hidden")) {
          var hint = document.createElement("span");
          hint.className = "visually-hidden";
          hint.textContent = " (heute)";
          cell.appendChild(hint);
        }
      } else {
        row.removeAttribute("data-today");
      }
    });
  }

  function startClock() {
    var table = document.querySelector("[data-hours]");
    if (!table) return;

    var schedule = readSchedule(table);
    var widgets = document.querySelectorAll("[data-status]");

    var tick = function () {
      var now = nowInPraxis();
      markToday(table, now);
      var state = currentState(schedule, now);
      Array.prototype.forEach.call(widgets, function (node) {
        renderStatus(node, state, now);
      });
    };

    tick();
    /* Einmal pro Minute nachziehen, damit der Wechsel nicht erst beim
     * Neuladen sichtbar wird. */
    setInterval(tick, 60000);
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) tick();
    });
  }

  /* --- Einblenden: Fallback ---------------------------------------------- */

  /* Nur noetig, wenn der Browser keine scroll-getriebenen Animationen kann.
   * Die versteckende Klasse setzt das Skript selbst — ohne JavaScript bleibt
   * darum alles sichtbar. */
  function startReveals() {
    /* Kein matchMedia: dann lieber gar nicht animieren. */
    if (typeof window.matchMedia !== "function") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    var native = window.CSS && CSS.supports &&
      CSS.supports("animation-timeline", "view()");
    if (native || !("IntersectionObserver" in window)) return;

    var targets = document.querySelectorAll(".reveal");
    if (!targets.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.1 });

    Array.prototype.forEach.call(targets, function (node, index) {
      node.classList.add("reveal--js");
      /* Gestaffelt, aber gedeckelt — niemand soll auf Text warten. */
      node.style.setProperty("--reveal-delay", Math.min(index, 4) * 70 + "ms");
      observer.observe(node);
    });
  }

  /* --- Start -------------------------------------------------------------- */

  /* Jede Ergaenzung fuer sich. Faellt eine aus, laeuft die andere weiter und
   * die Seite bleibt in jedem Fall benutzbar. */
  function attempt(fn) {
    try {
      fn();
    } catch (error) {
      if (window.console && console.warn) console.warn(error);
    }
  }

  function init() {
    attempt(startClock);
    attempt(startReveals);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
