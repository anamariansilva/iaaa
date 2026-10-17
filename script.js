/* ============================================================
   IAAA — comportamento da página
   - Lightbox para ampliar imagens
   - Copiar prompts completos
   - Identificação da secção ativa (scrollspy)
   - Navegação por âncoras com deslocação suave
   - Animação discreta de entrada
   ============================================================ */

(function () {
  "use strict";

  /* ---------- Lightbox ---------- */
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightbox-img");
  var lightboxCap = document.getElementById("lightbox-cap");
  var closeBtn = lightbox ? lightbox.querySelector(".lightbox-close") : null;
  var lastFocused = null;

  function openLightbox(src, alt, caption) {
    if (!lightbox) return;
    lastFocused = document.activeElement;
    lightboxImg.src = src;
    lightboxImg.alt = alt || "";
    lightboxCap.textContent = caption || "";
    lightbox.hidden = false;
    requestAnimationFrame(function () {
      lightbox.classList.add("is-open");
    });
    document.body.classList.add("lightbox-open");
    if (closeBtn) closeBtn.focus();
  }

  function closeLightbox() {
    if (!lightbox || lightbox.hidden) return;
    lightbox.classList.remove("is-open");
    document.body.classList.remove("lightbox-open");
    window.setTimeout(function () {
      lightbox.hidden = true;
      lightboxImg.src = "";
    }, 220);
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
  }

  document.querySelectorAll("img[data-lightbox]").forEach(function (img) {
    img.addEventListener("click", function () {
      openLightbox(img.currentSrc || img.src, img.alt, img.getAttribute("data-caption"));
    });
  });

  if (lightbox) {
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox || e.target.classList.contains("lightbox-figure")) {
        closeLightbox();
      }
    });
  }
  if (closeBtn) closeBtn.addEventListener("click", closeLightbox);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeLightbox();
  });

  /* ---------- Copiar prompts ---------- */

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-1000px";
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (err) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var target = document.querySelector(btn.getAttribute("data-copy"));
      if (!target) return;
      var text = target.textContent.replace(/\s+$/, "");
      var original = btn.textContent;

      function done(success) {
        btn.textContent = success ? "Copiado" : "Falhou";
        btn.classList.add("is-copied");
        window.setTimeout(function () {
          btn.textContent = original;
          btn.classList.remove("is-copied");
        }, 1800);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          done(true);
        }).catch(function () {
          done(fallbackCopy(text));
        });
      } else {
        done(fallbackCopy(text));
      }
    });
  });

  /* ---------- Scrollspy ---------- */

  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".site-nav a[data-nav]"));
  var sections = navLinks
    .map(function (link) { return document.getElementById(link.getAttribute("data-nav")); })
    .filter(Boolean);

  function setActive(id) {
    navLinks.forEach(function (link) {
      link.classList.toggle("is-active", link.getAttribute("data-nav") === id);
    });
  }

  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, {
      rootMargin: "-45% 0px -50% 0px",
      threshold: 0
    });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Animação discreta de entrada ---------- */

  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Deslocação suave (fallback para ScrollBehavior) ---------- */

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!("scrollBehavior" in document.documentElement.style) || prefersReduced) {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function (e) {
        var id = link.getAttribute("href").slice(1);
        var el = id ? document.getElementById(id) : null;
        if (!el) return;
        e.preventDefault();
        var headerH = document.querySelector(".site-header");
        var offset = headerH ? headerH.offsetHeight + 16 : 0;
        var y = el.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: y, behavior: prefersReduced ? "auto" : "smooth" });
      });
    });
  }
})();
