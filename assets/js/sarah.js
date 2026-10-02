/* Sarah's guide: fills details from sarah-config.js, runs the countdown,
   computes dates, remembers checklist ticks (in this browser only). */
(function () {
  "use strict";
  var C = window.SARAH_CONFIG || {};
  var MS = 86400000;
  var DOW = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  var MON = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  function parseDate(s) { var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s || ""); return m ? new Date(+m[1], +m[2]-1, +m[3]) : null; }
  function addDays(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
  function addMonths(d, n) { return new Date(d.getFullYear(), d.getMonth() + n, d.getDate()); }
  function dayDiff(a, b) { return Math.round((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / MS); }
  function fmt(d, style) {
    if (style === "long") return DOW[d.getDay()] + ", " + MON[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
    if (style === "md") return MON[d.getMonth()].slice(0,3) + " " + d.getDate();
    if (style === "mdy") return MON[d.getMonth()].slice(0,3) + " " + d.getDate() + ", " + d.getFullYear();
    return DOW[d.getDay()].slice(0,3) + ", " + MON[d.getMonth()].slice(0,3) + " " + d.getDate();
  }
  function fmtRange(a, b) {
    if (a.getFullYear() !== b.getFullYear()) return fmt(a, "mdy") + " – " + fmt(b, "mdy");
    if (a.getMonth() === b.getMonth()) return MON[a.getMonth()].slice(0,3) + " " + a.getDate() + "–" + b.getDate();
    return fmt(a, "md") + " – " + fmt(b, "md");
  }
  // "now" can be overridden for testing: ?now=2026-10-08T07:00 or ?today=2026-10-10
  function getNow() {
    var q = new URLSearchParams(location.search);
    var n = q.get("now"), t = q.get("today");
    if (n) { var m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(n); if (m) return new Date(+m[1], +m[2]-1, +m[3], +m[4], +m[5]); }
    if (t) { var d = parseDate(t); if (d) { d.setHours(12); return d; } }
    return new Date();
  }
  var SURG = parseDate(C.surgeryDate) || new Date(2026, 9, 8);

  /* ---------- details from config ---------- */
  document.querySelectorAll("[data-cfg]").forEach(function (el) {
    var k = el.getAttribute("data-cfg"), v = (C[k] || "").trim();
    if (v) {
      el.classList.remove("placeholder");
      if (el.tagName === "A") {
        el.textContent = v;
        if (/phone/i.test(k)) el.href = "tel:" + v.replace(/[^\d+]/g, "").slice(0, 11);
        else if (/email/i.test(k)) el.href = "mailto:" + v;
        else if (/website/i.test(k)) el.href = v;
      } else el.textContent = v;
    } else {
      el.classList.add("placeholder");
      el.textContent = "To fill in: " + (el.getAttribute("data-ph") || k);
      if (el.tagName === "A") el.removeAttribute("href");
    }
  });
  document.querySelectorAll("[data-cfg-name]").forEach(function (el) { var v = C[el.getAttribute("data-cfg-name")]; if (v) el.textContent = v; });

  /* ---------- dates ---------- */
  document.querySelectorAll("[data-date]").forEach(function (el) {
    var a = addDays(SURG, +el.getAttribute("data-date"));
    var e = el.getAttribute("data-date-end");
    el.textContent = e !== null ? fmtRange(a, addDays(SURG, +e)) : fmt(a, el.getAttribute("data-fmt") || "short");
  });
  document.querySelectorAll("[data-months]").forEach(function (el) {
    el.textContent = fmt(addMonths(SURG, +el.getAttribute("data-months")), el.getAttribute("data-fmt") || "mdy");
  });

  var NOW = getNow();
  var today = new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate());
  var dToday = dayDiff(SURG, today); // negative before surgery

  /* ---------- highlight today ---------- */
  document.querySelectorAll("[data-offset]").forEach(function (el) {
    var a = +el.getAttribute("data-offset"), b = el.hasAttribute("data-offset-end") ? +el.getAttribute("data-offset-end") : a;
    if (dToday >= a && dToday <= b) { el.classList.add("is-today"); var t = el.querySelector(".today-tag"); if (t) t.hidden = false; }
    else if (dToday > b) el.classList.add("is-past");
  });

  /* ---------- countdown ---------- */
  var cd = document.getElementById("countdown");
  function arrivalDate() {
    var m = /(\d{1,2}):(\d{2})\s*([AaPp][Mm])?/.exec(C.arrivalTime || "");
    if (!m) return null;
    var h = +m[1] % 12; if (m[3] && /p/i.test(m[3])) h += 12; if (!m[3] && +m[1] >= 12) h = +m[1];
    return new Date(SURG.getFullYear(), SURG.getMonth(), SURG.getDate(), h, +m[2]);
  }
  function plural(n, w) { return n + " " + w + (n === 1 ? "" : "s"); }
  function renderCountdown() {
    if (!cd) return;
    var now = getNow(); if (!/[?&](now|today)=/.test(location.search)) now = new Date();
    var t = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var d = dayDiff(SURG, t);
    var big = cd.querySelector(".cd-big"), sub = cd.querySelector(".cd-sub"), tick = cd.querySelector(".cd-tick");
    var name = C.patientName || "Sarah";
    cd.setAttribute("data-phase", d < 0 ? "before" : d === 0 ? "day" : "after");
    if (d < 0) {
      var n = -d;
      big.textContent = n === 1 ? "Tomorrow" : plural(n, "day") + " to go";
      sub.textContent = (n === 1 ? "Surgery day is tomorrow, " : "Until surgery day, ") + fmt(SURG, "long") + ". You have time, and a plan.";
      var target = arrivalDate() || SURG;
      var ms = target - now;
      if (ms > 0) {
        var hh = Math.floor(ms / 3600000), mm = Math.floor(ms % 3600000 / 60000);
        tick.textContent = Math.floor(hh / 24) + " d " + (hh % 24) + " h " + mm + " m " + (arrivalDate() ? "until arrival at " + C.arrivalTime : "until surgery day begins");
      } else tick.textContent = "";
    } else if (d === 0) {
      big.textContent = "Today is surgery day";
      sub.textContent = "You've prepared well, " + name + ". Breathe, rest, and let the team take care of you." + (C.arrivalTime ? " Arrival: " + C.arrivalTime + "." : "");
      tick.textContent = "Tonight: rest propped up, sip slowly, and keep the red-flag card handy.";
    } else {
      big.textContent = "Day " + d + " of recovery";
      var wk = Math.floor(d / 7) + 1;
      sub.textContent = "Surgery was " + fmt(SURG, "long") + ". You're in week " + wk + ". Small steps every day add up.";
      tick.textContent = d <= 14 ? "Today's focus: short walks, soft foods, and checking the incision." : d <= 42 ? "Keep walking a little more each week and follow your surgeon's activity limits." : "Keep going at your own pace and check in with your surgeon's team about anything new.";
    }
  }
  renderCountdown();
  if (cd) setInterval(renderCountdown, 30000);

  /* ---------- checklist memory ---------- */
  var KEY = "sarah-guide-checks";
  var saved = {}; try { saved = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) {}
  document.querySelectorAll("input[type=checkbox][data-key]").forEach(function (cb) {
    var k = cb.getAttribute("data-key");
    if (saved[k]) cb.checked = true;
    cb.addEventListener("change", function () { saved[k] = cb.checked; try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) {} });
  });
  var reset = document.getElementById("reset-checks");
  if (reset) reset.addEventListener("click", function () {
    if (!confirm("Clear all ticks on this device?")) return;
    saved = {}; try { localStorage.removeItem(KEY); } catch (e) {}
    document.querySelectorAll("input[type=checkbox][data-key]").forEach(function (cb) { cb.checked = false; });
  });

  /* ---------- month grids ---------- */
  document.querySelectorAll(".cal-grid[data-month-offset]").forEach(function (box) {
    var mo = +box.getAttribute("data-month-offset");
    var first = new Date(SURG.getFullYear(), SURG.getMonth() + mo, 1);
    var marks = {};
    (box.getAttribute("data-marks") || "").split("|").forEach(function (s) {
      var p = s.split(":"); if (p.length < 2) return;
      var dd = /^m/.test(p[0]) ? addMonths(SURG, +p[0].slice(1)) : addDays(SURG, +p[0]);
      marks[dd.toDateString()] = p.slice(1).join(":");
    });
    var h = '<div class="cal-title">' + MON[first.getMonth()] + " " + first.getFullYear() + '</div><div class="cal-days">';
    ["S","M","T","W","T","F","S"].forEach(function (x) { h += '<span class="dow">' + x + "</span>"; });
    for (var i = 0; i < first.getDay(); i++) h += "<span></span>";
    var dim = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    for (var dn = 1; dn <= dim; dn++) {
      var dt = new Date(first.getFullYear(), first.getMonth(), dn), off = dayDiff(SURG, dt), cls = [];
      if (off === 0) cls.push("surg"); else if (off > 0 && off < 7) cls.push("w1"); else if (off >= 7 && off < 14) cls.push("w2"); else if (off < 0 && off >= -6) cls.push("pre");
      if (dt.toDateString() === today.toDateString()) cls.push("now");
      var mk = marks[dt.toDateString()];
      if (mk) cls.push("mark");
      h += '<span class="' + cls.join(" ") + '"' + (mk ? ' title="' + mk + '"' : "") + ">" + dn + (mk ? "<i>" + mk + "</i>" : "") + "</span>";
    }
    box.innerHTML = h + "</div>";
  });
})();
