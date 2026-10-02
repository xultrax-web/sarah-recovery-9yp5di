/* Family pages: recovery updates + meals/rides/visits sign-up (data in family-data.js). */
(function () {
  "use strict";
  var C = window.SARAH_CONFIG || {};
  var U = (window.FAMILY_UPDATES || []).slice();
  var S = (window.FAMILY_SLOTS || []).slice();
  var DOW = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"], DOWL = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  var MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"], MONL = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  function pd(s) { var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s || ""); return m ? new Date(+m[1], +m[2]-1, +m[3]) : null; }
  function diff(a, b) { return Math.round((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / 86400000); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  var SURG = pd(C.surgeryDate) || new Date(2026, 9, 8);
  var name = C.patientName || "Sarah";
  var q = new URLSearchParams(location.search);
  var today = pd(q.get("today")) || new Date(); today = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  function dayLabel(d) {
    var n = diff(SURG, d);
    if (n < 0) return -n === 1 ? "Surgery is tomorrow" : (-n) + " days until surgery";
    if (n === 0) return "Surgery day";
    return "Day " + n + " of recovery";
  }
  var STATUS = {
    "resting": ["Resting", "st-resting"], "doing-well": ["Doing well", "st-well"], "checkup": ["Check-up today", "st-checkup"],
    "hospital": ["In the hospital", "st-hospital"], "surgery-day": ["Surgery day", "st-surgery"], "update": ["Update", "st-update"]
  };

  /* Day indicator (both pages) */
  document.querySelectorAll("[data-day-indicator]").forEach(function (el) {
    var n = diff(SURG, today);
    el.querySelector(".di-big").textContent = dayLabel(today);
    el.querySelector(".di-sub").textContent = n < 0 ? "Surgery: " + DOWL[SURG.getDay()] + ", " + MONL[SURG.getMonth()] + " " + SURG.getDate() :
      n === 0 ? "Thinking of " + name + " today" : "Surgery was " + DOWL[SURG.getDay()] + ", " + MONL[SURG.getMonth()] + " " + SURG.getDate();
    el.setAttribute("data-phase", n < 0 ? "before" : n === 0 ? "day" : "after");
  });

  /* Updates feed */
  var feed = document.getElementById("updates-feed");
  if (feed) {
    U.sort(function (a, b) { return (b.date + (b.time ? to24(b.time) : "00:00")).localeCompare(a.date + (a.time ? to24(a.time) : "00:00")); });
    var latest = U[0];
    var badge = document.getElementById("current-status");
    if (badge && latest) { var st = STATUS[latest.status] || STATUS.update; badge.textContent = st[0]; badge.className = "status-badge " + st[1]; }
    feed.innerHTML = U.length ? U.map(function (u, i) {
      var d = pd(u.date), st = STATUS[u.status] || STATUS.update;
      return '<article class="update-post' + (i === 0 ? " newest" : "") + '"><header><span class="status-badge ' + st[1] + '">' + st[0] + '</span>' +
        '<time datetime="' + esc(u.date) + '">' + DOWL[d.getDay()] + ", " + MON[d.getMonth()] + " " + d.getDate() + (u.time ? " · " + esc(u.time) : "") + '</time>' +
        '<span class="post-day">' + dayLabel(d) + '</span></header><h2>' + esc(u.title) + '</h2>' +
        (u.photo ? '<img class="post-photo" src="' + esc(u.photo) + '" alt="' + esc(u.photoAlt || "Photo for this update") + '" loading="lazy">' : "") +
        '<p>' + esc(u.text).replace(/\n/g, "<br>") + '</p></article>';
    }).join("") : '<p>No updates yet. Check back soon.</p>';
  }
  function to24(t) { var m = /(\d{1,2}):(\d{2})\s*([AaPp])?/.exec(t || ""); if (!m) return "00:00"; var h = +m[1] % 12; if (m[3] && /p/i.test(m[3])) h += 12; if (!m[3]) h = +m[1]; return (h < 10 ? "0" : "") + h + ":" + m[2]; }

  /* Sign-up slots */
  var list = document.getElementById("slots");
  if (list) {
    var phone = (C.wesleyPhone || "").replace(/\D/g, "");
    if (phone.length === 10) phone = "1" + phone;
    var ICON = { meal: "🍲", ride: "🚗", visit: "💛", errand: "🧺" };
    var TYPE = { meal: "Meal", ride: "Ride", visit: "Visit", errand: "Errand" };
    var filter = "all";
    function smsHref(s, d) {
      var body = "Hi " + (C.caregiverName || "Wesley") + "! I'd like to sign up for: " + TYPE[s.type] + " – " + s.label + " on " + DOWL[d.getDay()] + ", " + MONL[d.getMonth()] + " " + d.getDate() + ". My name: ";
      return "sms:+" + phone + "?&body=" + encodeURIComponent(body);
    }
    function render() {
      S.sort(function (a, b) { return a.date.localeCompare(b.date); });
      var groups = {}, order = [];
      S.forEach(function (s) { if (filter !== "all" && s.type !== filter) return; if (!groups[s.date]) { groups[s.date] = []; order.push(s.date); } groups[s.date].push(s); });
      var open = S.filter(function (s) { return !s.taken; }).length;
      var cnt = document.getElementById("slot-count"); if (cnt) cnt.textContent = open + " of " + S.length + " spots still open";
      list.innerHTML = order.map(function (ds) {
        var d = pd(ds), past = diff(today, d) < 0;
        return '<section class="slot-day' + (past ? " past" : "") + (diff(today, d) === 0 ? " today" : "") + '"><h3>' + DOWL[d.getDay()] + ", " + MON[d.getMonth()] + " " + d.getDate() +
          ' <small>' + dayLabel(d) + '</small></h3><ul>' + groups[ds].map(function (s) {
            var btn = s.taken ? '<span class="slot-taken">✓ Taken by ' + esc(s.taken) + '</span>' :
              past ? '<span class="slot-past">Date has passed</span>' :
              phone.length === 11 ? '<a class="btn primary slot-btn" href="' + smsHref(s, d) + '" aria-label="Sign up by text for ' + esc(TYPE[s.type] + " " + s.label) + ' on ' + MON[d.getMonth()] + " " + d.getDate() + '">Sign up by text</a>' :
              '<span class="placeholder">Sign-up number not set yet</span>';
            return '<li class="slot ' + (s.taken ? "is-taken" : "is-open") + '"><span class="slot-ico" aria-hidden="true">' + (ICON[s.type] || "•") + '</span><span class="slot-main"><strong>' + TYPE[s.type] + '</strong> · ' + esc(s.label) +
              '<span class="slot-state">' + (s.taken ? "Taken" : "Open") + '</span></span>' + btn + '</li>';
          }).join("") + "</ul></section>";
      }).join("") || "<p>No spots in this category.</p>";
    }
    document.querySelectorAll("[data-filter]").forEach(function (b) {
      b.addEventListener("click", function () {
        filter = b.getAttribute("data-filter");
        document.querySelectorAll("[data-filter]").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        render();
      });
    });
    render();
  }
})();
