/* Cervical Disc Replacement Guide - interactions & motion graphics.
   No dependencies. Respects prefers-reduced-motion; pauses offscreen. */
(function () {
  "use strict";
  var doc = document.documentElement;
  var RM = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };
  var reduced = RM.matches || doc.classList.contains("print-mode");
  var printing = false;

  /* ---------- Navigation ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
  var menuBtns = document.querySelectorAll(".menu-btn");
  function closeMenus(except) {
    menuBtns.forEach(function (b) {
      if (b === except) return;
      b.setAttribute("aria-expanded", "false");
      var m = document.getElementById(b.getAttribute("aria-controls"));
      if (m) m.classList.remove("open");
    });
  }
  menuBtns.forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var m = document.getElementById(btn.getAttribute("aria-controls"));
      var open = btn.getAttribute("aria-expanded") !== "true";
      closeMenus(btn);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      if (m) m.classList.toggle("open", open);
    });
  });
  document.addEventListener("click", function (e) { if (!e.target.closest || !e.target.closest(".nav")) closeMenus(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeMenus(); if (nav && nav.classList.contains("open")) { nav.classList.remove("open"); toggle && toggle.setAttribute("aria-expanded", "false"); } }
  });

  /* ---------- Reading progress + TOC highlight ---------- */
  var bar = document.querySelector(".progress");
  var tocLinks = Array.prototype.slice.call(document.querySelectorAll(".toc a[href^='#']"));
  var heads = tocLinks.map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); }).filter(Boolean);
  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var h = doc.scrollHeight - window.innerHeight;
      if (bar) bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + "%";
      var cur = null;
      for (var i = 0; i < heads.length; i++) { if (heads[i].getBoundingClientRect().top < 120) cur = heads[i]; }
      tocLinks.forEach(function (a) { a.classList.toggle("active", !!cur && a.getAttribute("href") === "#" + cur.id); });
      updateTimeline();
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduced) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); ro.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    reveals.forEach(function (el) { ro.observe(el); });
  } else { reveals.forEach(function (el) { el.classList.add("in"); }); }

  /* ---------- Motion figures: shared controller ---------- */
  var figs = Array.prototype.slice.call(document.querySelectorAll("figure.anim"));
  figs.forEach(function (fig) {
    fig.__visible = false;
    fig.__playing = !reduced;
    if (!reduced) fig.classList.add("motion-ok");
    var btn = fig.querySelector(".play-toggle");
    function sync() {
      fig.classList.toggle("paused", !fig.__playing);
      if (btn) { btn.setAttribute("aria-pressed", fig.__playing ? "false" : "true"); btn.textContent = fig.__playing ? "❚❚ Pause animation" : "▶ Play animation"; }
    }
    fig.__sync = sync;
    if (btn) btn.addEventListener("click", function () {
      fig.__playing = !fig.__playing;
      if (fig.__playing) fig.classList.add("motion-ok");
      sync(); kick();
      if (fig.__onToggle) fig.__onToggle(fig.__playing);
    });
    sync();
  });
  if ("IntersectionObserver" in window) {
    var vo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { en.target.__visible = en.isIntersecting; en.target.classList.toggle("offscreen", !en.isIntersecting); });
      kick();
    }, { threshold: 0.01 });
    figs.forEach(function (f) { vo.observe(f); });
  } else { figs.forEach(function (f) { f.__visible = true; }); }

  /* ---------- Spine flexion/extension (JS-driven SVG transforms) ---------- */
  var spines = Array.prototype.slice.call(document.querySelectorAll("svg[data-anim='spine']")).map(function (svg) {
    var segs = Array.prototype.slice.call(svg.querySelectorAll("g.seg")).map(function (g) {
      return { g: g, w: parseFloat(g.dataset.w), b: parseFloat(g.dataset.base), px: g.dataset.px, py: g.dataset.py };
    });
    return { svg: svg, segs: segs, amp: parseFloat(svg.dataset.amp || 8), period: parseFloat(svg.dataset.period || 6),
             fig: svg.closest("figure.anim"), readout: svg.querySelector(".readout"), live: svg.id === "hero-spine" };
  });
  function poseSpine(s, phase) {
    var v = Math.sin(phase);
    s.segs.forEach(function (seg) {
      var a = seg.b - s.amp * seg.w * v; // negative = flexion (head forward/left)
      seg.g.setAttribute("transform", "rotate(" + a.toFixed(3) + " " + seg.px + " " + seg.py + ")");
    });
    if (s.live && s.readout) {
      s.readout.textContent = v > 0.35 ? "Flexion — bending forward" : v < -0.35 ? "Extension — looking up" : "Neutral";
    }
  }
  var raf = null, t0 = performance.now();
  function frame(now) {
    raf = null;
    var any = false;
    spines.forEach(function (s) {
      if (!s.fig || !s.fig.__playing || !s.fig.__visible || document.hidden || printing) return;
      any = true;
      poseSpine(s, ((now - t0) / 1000) * (2 * Math.PI / s.period));
    });
    if (any) raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }
  document.addEventListener("visibilitychange", kick);

  /* ---------- Pain path C6 / C7 toggle ---------- */
  document.querySelectorAll("figure[data-pain]").forEach(function (fig) {
    var label = fig.querySelector(".lvl-label");
    var info = fig.querySelectorAll("[data-info]");
    var btns = fig.querySelectorAll("button[data-level]");
    function set(level) {
      fig.setAttribute("data-level", level);
      btns.forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.level === level ? "true" : "false"); });
      info.forEach(function (el) { el.hidden = el.dataset.info !== level; });
      if (label) label.textContent = level === "c6" ? "C5–C6 disc → C6 nerve root" : "C6–C7 disc → C7 nerve root";
    }
    btns.forEach(function (b) { b.addEventListener("click", function () { set(b.dataset.level); }); });
    set(fig.getAttribute("data-level") || "c6");
  });

  /* ---------- Surgery stepper ---------- */
  document.querySelectorAll("figure.stepper").forEach(function (fig) {
    var scenes = fig.querySelectorAll(".scene");
    var stepBtns = fig.querySelectorAll(".steps button");
    var idx = 0, timer = null, DUR = 5200;
    function show(i) {
      idx = (i + scenes.length) % scenes.length;
      scenes.forEach(function (s, k) {
        s.classList.remove("active");
        if (k === idx) { void s.offsetWidth; s.classList.add("active"); }
        s.setAttribute("aria-hidden", k === idx ? "false" : "true");
      });
      stepBtns.forEach(function (b, k) { if (k === idx) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current"); });
    }
    function schedule() {
      clearTimeout(timer);
      if (fig.__playing && fig.__visible && !document.hidden) timer = setTimeout(function () { show(idx + 1); schedule(); }, DUR);
    }
    stepBtns.forEach(function (b, k) { b.addEventListener("click", function () { show(k); schedule(); }); });
    var prev = fig.querySelector(".step-prev"), next = fig.querySelector(".step-next");
    prev && prev.addEventListener("click", function () { show(idx - 1); schedule(); });
    next && next.addEventListener("click", function () { show(idx + 1); schedule(); });
    fig.__onToggle = schedule;
    fig.classList.add("is-stepper-js");
    show(0);
    if ("IntersectionObserver" in window) new IntersectionObserver(function () { setTimeout(schedule, 30); }).observe(fig);
    document.addEventListener("visibilitychange", schedule);
    schedule();
  });

  /* ---------- Recovery timeline (scroll-triggered) ---------- */
  var tl = document.querySelector(".timeline");
  var tlFill = tl && tl.querySelector(".rail-fill");
  var tlItems = tl ? Array.prototype.slice.call(tl.querySelectorAll(".tl-item")) : [];
  function updateTimeline() {
    if (!tl) return;
    var r = tl.getBoundingClientRect();
    var mark = window.innerHeight * 0.62;
    var p = Math.max(0, Math.min(1, (mark - r.top) / r.height));
    if (reduced) p = 1;
    if (tlFill) tlFill.style.height = (p * 100).toFixed(1) + "%";
    tlItems.forEach(function (it) { it.classList.toggle("on", reduced || it.getBoundingClientRect().top < mark); });
  }

  /* ---------- Print: static fallbacks ---------- */
  function toStatic() {
    printing = true;
    spines.forEach(function (s) { poseSpine(s, 0); });
    reveals.forEach(function (el) { el.classList.add("in"); });
    tlItems.forEach(function (it) { it.classList.add("on"); });
    if (tlFill) tlFill.style.height = "100%";
  }
  window.addEventListener("beforeprint", toStatic);
  window.addEventListener("afterprint", function () { printing = false; kick(); });
  if (window.matchMedia) { var mp = window.matchMedia("print"); mp.addListener && mp.addListener(function (m) { if (m.matches) toStatic(); }); }
  if (location.search.indexOf("static=1") > -1 || doc.classList.contains("print-mode")) toStatic();

  RM.addListener && RM.addListener(function (m) { reduced = m.matches; if (reduced) { figs.forEach(function (f) { f.__playing = false; f.__sync(); }); } });

  onScroll();
  kick();
})();
