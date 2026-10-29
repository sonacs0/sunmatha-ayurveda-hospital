(function () {
  var root = document.documentElement;
  root.classList.add("js");

  // Header: solid background once the page scrolls
  var header = document.querySelector("[data-header]");
  function onScroll() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 24);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Mobile menu
  var toggle = document.querySelector(".menu-btn");
  var menu = document.querySelector("#mobile-menu");
  function setMenu(open) {
    root.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.setAttribute("aria-hidden", open ? "false" : "true");
    if ("inert" in menu) menu.inert = !open;
  }
  if (toggle && menu) {
    setMenu(false);
    toggle.addEventListener("click", function () {
      setMenu(!root.classList.contains("menu-open"));
    });
    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () { setMenu(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && root.classList.contains("menu-open")) {
        setMenu(false);
        toggle.focus();
      }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 920 && root.classList.contains("menu-open")) setMenu(false);
    });
  }

  // Reveal on scroll
  var revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Home hero: photo slideshow with clickable labels; pauses on hover
  var slideWrap = document.querySelector("[data-hero-slides]");
  if (slideWrap) {
    var slides = slideWrap.querySelectorAll(".hero-slide");
    var dots = slideWrap.querySelectorAll(".hero-dot");
    var SLIDE_MS = 5500, current = 0, timer = null;
    slideWrap.style.setProperty("--slide-ms", SLIDE_MS + "ms");
    function show(i) {
      current = (i + slides.length) % slides.length;
      slides.forEach(function (s, n) { s.classList.toggle("is-active", n === current); });
      dots.forEach(function (d, n) {
        d.classList.remove("is-active");
        d.setAttribute("aria-selected", n === current ? "true" : "false");
      });
      void dots[current].offsetWidth; // restart the progress bar animation
      dots[current].classList.add("is-active");
    }
    function play() {
      clearInterval(timer);
      if (!reduceMotion) timer = setInterval(function () { show(current + 1); }, SLIDE_MS);
    }
    dots.forEach(function (d, i) { d.addEventListener("click", function () { show(i); play(); }); });
    slideWrap.addEventListener("mouseenter", function () { clearInterval(timer); slideWrap.classList.add("is-paused"); });
    slideWrap.addEventListener("mouseleave", function () { slideWrap.classList.remove("is-paused"); play(); });
    document.addEventListener("visibilitychange", function () { document.hidden ? clearInterval(timer) : play(); });
    play();
  }

  // Home hero: gentle depth that follows the mouse (desktop only)
  var heroVisual = document.querySelector(".hero-visual");
  if (heroVisual && !reduceMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    var hero = document.querySelector(".hero");
    hero.addEventListener("mousemove", function (e) {
      var r = hero.getBoundingClientRect();
      heroVisual.style.setProperty("--mx", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
      heroVisual.style.setProperty("--my", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
    });
    hero.addEventListener("mouseleave", function () {
      heroVisual.style.setProperty("--mx", 0);
      heroVisual.style.setProperty("--my", 0);
    });
  }

  // Facts: count up when they scroll into view
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length && "IntersectionObserver" in window && !reduceMotion) {
    var countIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target, end = +el.getAttribute("data-count"), suffix = el.getAttribute("data-suffix") || "";
        var start = null, dur = 1600;
        countIO.unobserve(el);
        el.textContent = "0" + suffix;
        requestAnimationFrame(function tick(t) {
          if (start === null) start = t;
          var p = Math.min(1, (t - start) / dur), eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(end * eased) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        });
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { countIO.observe(el); });
  }

  // Home: signature therapy list swaps the preview image
  var items = document.querySelectorAll(".t-item");
  var previews = document.querySelectorAll(".t-preview img");
  var caption = document.querySelector(".t-preview figcaption");
  function activate(i) {
    items.forEach(function (el, n) { el.classList.toggle("is-active", n === i); });
    previews.forEach(function (img, n) { img.classList.toggle("is-active", n === i); });
    if (caption) caption.textContent = items[i].getAttribute("data-caption");
  }
  items.forEach(function (item, i) {
    var link = item.querySelector("a");
    link.addEventListener("mouseenter", function () { activate(i); });
    link.addEventListener("focus", function () { activate(i); });
  });

  // Home: reviews carousel arrows
  var track = document.querySelector("[data-reviews]");
  if (track) {
    var prev = document.querySelector("[data-reviews-prev]");
    var next = document.querySelector("[data-reviews-next]");
    function step() {
      var card = track.querySelector(".review");
      return card ? card.getBoundingClientRect().width + 22 : 320;
    }
    function updateArrows() {
      prev.disabled = track.scrollLeft < 4;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    }
    prev.addEventListener("click", function () { track.scrollBy({ left: -step(), behavior: "smooth" }); });
    next.addEventListener("click", function () { track.scrollBy({ left: step(), behavior: "smooth" }); });
    var bar = document.querySelector(".reviews-progress span");
    function updateProgress() {
      if (!bar) return;
      var max = track.scrollWidth - track.clientWidth;
      var ratio = track.scrollWidth ? track.clientWidth / track.scrollWidth : 1;
      bar.style.width = Math.min(100, ratio * 100) + "%";
      bar.parentNode.style.visibility = ratio >= 0.995 ? "hidden" : "";
      bar.style.transform = "translateX(" + (max > 0 ? (track.scrollLeft / max) * (1 / ratio - 1) * 100 : 0) + "%)";
    }
    function onTrackScroll() { updateArrows(); updateProgress(); }
    track.addEventListener("scroll", onTrackScroll, { passive: true });
    window.addEventListener("resize", onTrackScroll);
    onTrackScroll();

    // Filter reviews by condition
    var chips = document.querySelectorAll("[data-review-filter]");
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        var topic = chip.getAttribute("data-review-filter");
        chips.forEach(function (c) {
          c.classList.toggle("is-active", c === chip);
          c.setAttribute("aria-pressed", c === chip ? "true" : "false");
        });
        track.querySelectorAll(".review").forEach(function (card) {
          var t = card.querySelector(".review-therapy");
          var show = topic === "all" || (t && t.textContent.trim().toLowerCase() === topic.toLowerCase());
          card.hidden = !show;
          card.classList.remove("is-entering");
          if (show && !reduceMotion) { void card.offsetWidth; card.classList.add("is-entering"); }
        });
        track.scrollTo({ left: 0 });
        onTrackScroll();
      });
    });

    // Drag to scroll with a mouse
    var dragX = null, dragLeft = 0, moved = false;
    track.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      dragX = e.clientX; dragLeft = track.scrollLeft; moved = false;
    });
    window.addEventListener("pointermove", function (e) {
      if (dragX === null) return;
      var dx = e.clientX - dragX;
      if (!moved && Math.abs(dx) > 5) { moved = true; track.classList.add("is-dragging"); }
      if (moved) track.scrollLeft = dragLeft - dx;
    });
    window.addEventListener("pointerup", function () {
      if (dragX === null) return;
      dragX = null;
      if (moved) {
        track.classList.remove("is-dragging");
        var w = step();
        track.scrollTo({ left: Math.round(track.scrollLeft / w) * w, behavior: "smooth" });
      }
    });
  }

  // Treatments: highlight the therapy currently in view
  var navLinks = document.querySelectorAll(".treat-nav a");
  if (navLinks.length && "IntersectionObserver" in window) {
    var byId = {};
    navLinks.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.remove("is-current"); });
        var current = byId[entry.target.id];
        if (current) {
          current.classList.add("is-current");
          // keep the active chip visible in the horizontal mobile index
          var list = current.closest("ol");
          if (list && list.scrollWidth > list.clientWidth) {
            list.scrollTo({ left: current.offsetLeft - 16, behavior: "smooth" });
          }
        }
      });
    }, { rootMargin: "-35% 0px -60% 0px" });
    document.querySelectorAll(".therapy[id]").forEach(function (el) { spy.observe(el); });
  }

  // Custom dropdown: styled listbox that drives the native <select> underneath
  var chevron = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
  var tick = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
  document.querySelectorAll(".select").forEach(function (wrap, w) {
    var select = wrap.querySelector("select");
    var label = document.querySelector('label[for="' + select.id + '"]');
    var listId = select.id + "-list";
    var trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "select-trigger";
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-controls", listId);
    trigger.innerHTML = '<span class="select-value"></span>' + chevron;
    if (label) {
      label.id = label.id || select.id + "-label";
      trigger.setAttribute("aria-labelledby", label.id + " " + select.id + "-value");
      label.setAttribute("for", select.id + "-trigger");
    }
    trigger.id = select.id + "-trigger";
    trigger.querySelector(".select-value").id = select.id + "-value";

    var list = document.createElement("ul");
    list.className = "select-list";
    list.id = listId;
    list.setAttribute("role", "listbox");
    list.tabIndex = -1;
    if (label) list.setAttribute("aria-labelledby", label.id);

    var options = Array.prototype.map.call(select.options, function (opt, i) {
      var li = document.createElement("li");
      li.id = listId + "-" + i;
      li.setAttribute("role", "option");
      li.innerHTML = "<span></span>" + tick;
      li.firstChild.textContent = opt.text;
      list.appendChild(li);
      return li;
    });

    select.classList.add("is-enhanced");
    select.tabIndex = -1;
    select.setAttribute("aria-hidden", "true");
    wrap.appendChild(trigger);
    wrap.appendChild(list);

    var focused = select.selectedIndex;
    function render() {
      trigger.querySelector(".select-value").textContent = select.options[select.selectedIndex].text;
      options.forEach(function (li, i) { li.setAttribute("aria-selected", i === select.selectedIndex ? "true" : "false"); });
    }
    function focusOption(i) {
      focused = Math.max(0, Math.min(options.length - 1, i));
      options.forEach(function (li, n) { li.classList.toggle("is-focused", n === focused); });
      list.setAttribute("aria-activedescendant", options[focused].id);
      var li = options[focused];
      if (li.offsetTop < list.scrollTop) list.scrollTop = li.offsetTop - 6;
      else if (li.offsetTop + li.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = li.offsetTop + li.offsetHeight - list.clientHeight + 6;
    }
    function open() {
      wrap.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
      focusOption(select.selectedIndex);
      list.focus({ preventScroll: true });
    }
    function close(refocus) {
      wrap.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
      if (refocus) trigger.focus();
    }
    function choose(i) {
      select.selectedIndex = i;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      render();
      close(true);
    }

    select.addEventListener("change", render);
    trigger.addEventListener("click", function () { wrap.classList.contains("is-open") ? close(true) : open(); });
    trigger.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); open(); }
    });
    options.forEach(function (li, i) {
      li.addEventListener("mousemove", function () { if (focused !== i) focusOption(i); });
      li.addEventListener("click", function () { choose(i); });
    });

    var typed = "", typedTimer;
    list.addEventListener("keydown", function (e) {
      switch (e.key) {
        case "ArrowDown": e.preventDefault(); focusOption(focused + 1); break;
        case "ArrowUp": e.preventDefault(); focusOption(focused - 1); break;
        case "Home": e.preventDefault(); focusOption(0); break;
        case "End": e.preventDefault(); focusOption(options.length - 1); break;
        case "Enter": case " ": e.preventDefault(); choose(focused); break;
        case "Escape": e.preventDefault(); e.stopPropagation(); close(true); break;
        case "Tab": close(false); break;
        default:
          if (e.key.length === 1) {
            clearTimeout(typedTimer);
            typed += e.key.toLowerCase();
            typedTimer = setTimeout(function () { typed = ""; }, 600);
            var hit = options.findIndex(function (li) { return li.textContent.toLowerCase().indexOf(typed) === 0; });
            if (hit > -1) focusOption(hit);
          }
      }
    });
    document.addEventListener("click", function (e) {
      if (!wrap.contains(e.target) && wrap.classList.contains("is-open")) close(false);
    });
    render();
  });

  // Enquiry form: no backend, so hand off to the user's email client
  var form = document.querySelector("#enquiry-form");
  if (form) {
    var status = form.querySelector(".form-status");
    function check(input) {
      var field = input.closest(".field");
      var ok = input.value.trim() !== "";
      if (ok && input.type === "tel") ok = /^[+\d][\d\s()-]{6,}$/.test(input.value.trim());
      field.classList.toggle("has-error", !ok);
      return ok;
    }
    form.querySelectorAll("[required]").forEach(function (input) {
      input.addEventListener("blur", function () { if (input.value) check(input); });
      input.addEventListener("input", function () {
        if (input.closest(".field").classList.contains("has-error")) check(input);
      });
    });

    function readForm() {
      var invalid = [];
      form.querySelectorAll("[required]").forEach(function (input) {
        if (!check(input)) invalid.push(input);
      });
      if (invalid.length) {
        invalid[0].focus();
        return null;
      }
      return {
        name: form.querySelector("#f-name").value.trim(),
        phone: form.querySelector("#f-phone").value.trim(),
        concern: form.querySelector("#f-concern").value.trim(),
        message: form.querySelector("#f-message").value.trim()
      };
    }
    function summary(d) {
      return "Name: " + d.name + "\nPhone: " + d.phone + "\nCondition / concern: " + d.concern + (d.message ? "\n\n" + d.message : "");
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var d = readForm();
      if (!d) return;
      var mailto = "mailto:sunmathaayurvedha@gmail.com" +
        "?subject=" + encodeURIComponent("Enquiry from website — " + d.name) +
        "&body=" + encodeURIComponent(summary(d));
      window.location.href = mailto;
      if (status) status.classList.add("is-visible");
    });

    var waBtn = form.querySelector("[data-wa-submit]");
    if (waBtn) waBtn.addEventListener("click", function () {
      var d = readForm();
      if (!d) return;
      var text = "Hello Sun Matha, I'd like to enquire about treatment.\n\n" + summary(d);
      window.open("https://wa.me/919605887205?text=" + encodeURIComponent(text), "_blank", "noopener");
      if (status) status.classList.add("is-visible");
    });

    // Quick-pick concern chips
    var concernSelect = form.querySelector("#f-concern");
    var concernChips = form.querySelectorAll("[data-concern]");
    function syncChips() {
      concernChips.forEach(function (c) {
        var on = c.getAttribute("data-concern") === concernSelect.value;
        c.classList.toggle("is-active", on);
        c.setAttribute("aria-pressed", on ? "true" : "false");
      });
    }
    concernChips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        concernSelect.value = chip.getAttribute("data-concern");
        concernSelect.dispatchEvent(new Event("change", { bubbles: true }));
      });
    });
    if (concernSelect) {
      concernSelect.addEventListener("change", syncChips);
      syncChips();
    }
  }

  // Contact: copy phone / email to clipboard
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy");
      function done() {
        btn.textContent = "Copied";
        btn.classList.add("is-copied");
        setTimeout(function () { btn.textContent = "Copy"; btn.classList.remove("is-copied"); }, 1800);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () {});
      } else {
        var ta = document.createElement("textarea");
        ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "absolute"; ta.style.left = "-9999px";
        document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); done(); } catch (err) {}
        document.body.removeChild(ta);
      }
    });
  });

  // About: milestone tabs
  document.querySelectorAll("[data-tabs]").forEach(function (box) {
    var tabs = Array.prototype.slice.call(box.querySelectorAll('[role="tab"]'));
    var line = box.querySelector(".milestone-line span");
    function select(i, focus) {
      tabs.forEach(function (t, n) {
        var on = n === i;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
      });
      if (line) line.style.width = ((i + 1) / tabs.length) * 100 + "%";
      if (focus) tabs[i].focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { select(i); });
      t.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight") { e.preventDefault(); select((i + 1) % tabs.length, true); }
        if (e.key === "ArrowLeft") { e.preventDefault(); select((i - 1 + tabs.length) % tabs.length, true); }
      });
    });
    select(0);
  });
})();
