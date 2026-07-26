/* ==========================================================================
   main.js — общие механики страницы

   Здесь живёт всё, что не принадлежит одному блоку: появление секций при
   скролле, счётчики, блик под курсором, magnetic-кнопки, полоса прогресса
   и показ липкой CTA-панели.

   Всё, что относится к ритмическому слою моушена, отключается при
   prefers-reduced-motion — проверка одна на весь файл.
   ========================================================================== */

(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ------------------------------------------------------------------------
     Появление блоков при скролле

     Задержка каскада считается по позиции среди соседей с тем же классом:
     карточки в одном ряду появляются одна за другой, а не все разом.
     ------------------------------------------------------------------------ */

  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    function showAll() {
      Array.prototype.forEach.call(items, function (el) {
        el.classList.add('is-visible');
      });
    }

    if (reduced || !('IntersectionObserver' in window)) {
      showAll();
      return;
    }

    Array.prototype.forEach.call(items, function (el) {
      var parent = el.parentElement;
      if (!parent) return;
      var peers = Array.prototype.filter.call(parent.children, function (node) {
        return node.classList && node.classList.contains('reveal');
      });
      var index = peers.indexOf(el);
      if (index > 0) {
        el.style.setProperty('--reveal-delay', index * 60 + 'ms');
      }
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, {
      /* Блок считается показанным чуть раньше, чем упрётся в низ экрана —
         иначе анимация начинается уже под пальцем и её не видно. */
      rootMargin: '0px 0px -12% 0px',
      threshold: 0.05
    });

    Array.prototype.forEach.call(items, function (el) {
      observer.observe(el);
    });
  }

  /* ------------------------------------------------------------------------
     Счётчики цифр
     Длительность — один такт (--bar), чтобы совпадать с общим ритмом.
     ------------------------------------------------------------------------ */

  function initCounters() {
    var items = document.querySelectorAll('[data-counter]');
    if (!items.length) return;

    function render(el, value) {
      var prefix = el.getAttribute('data-counter-prefix') || '';
      var suffix = el.getAttribute('data-counter-suffix') || '';
      el.textContent = prefix + value + suffix;
    }

    function run(el) {
      var target = parseInt(el.getAttribute('data-counter'), 10);
      if (isNaN(target)) return;

      var duration = 1875; /* один такт при 128 BPM */
      var start = null;

      function step(now) {
        if (start === null) start = now;
        var progress = Math.min((now - start) / duration, 1);
        /* easeOutCubic: цифры быстро набирают и мягко останавливаются. */
        var eased = 1 - Math.pow(1 - progress, 3);
        render(el, Math.round(target * eased));
        if (progress < 1) requestAnimationFrame(step);
      }

      requestAnimationFrame(step);
    }

    if (reduced || !('IntersectionObserver' in window)) return; /* значения уже в разметке */

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        run(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.6 });

    Array.prototype.forEach.call(items, function (el) {
      observer.observe(el);
    });
  }

  /* ------------------------------------------------------------------------
     Зачёркивание старой цены
     Наблюдатель нужен только для случая, когда элемент уже виден.
     Панель комбо-тарифа по умолчанию скрыта, и там анимацию запускает
     program.js при переключении таба.
     ------------------------------------------------------------------------ */

  function initStrike() {
    var items = document.querySelectorAll('[data-strike]');
    if (!items.length) return;

    if (reduced || !('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(items, function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
      });
    }, { threshold: 0.8 });

    Array.prototype.forEach.call(items, function (el) {
      observer.observe(el);
    });
  }

  /* ------------------------------------------------------------------------
     Блик под курсором
     Пишем координаты в переменные, отрисовку делает CSS.
     ------------------------------------------------------------------------ */

  function initGlow() {
    if (!canHover || reduced) return;

    var items = document.querySelectorAll('.glow');
    Array.prototype.forEach.call(items, function (el) {
      el.addEventListener('pointermove', function (event) {
        var rect = el.getBoundingClientRect();
        el.style.setProperty('--mx', (event.clientX - rect.left) + 'px');
        el.style.setProperty('--my', (event.clientY - rect.top) + 'px');
      });
    });
  }

  /* ------------------------------------------------------------------------
     Magnetic-кнопки
     Кнопка тянется к курсору максимум на 6px — этого хватает, чтобы
     эффект читался, и мало, чтобы не мешать попасть по ней.
     ------------------------------------------------------------------------ */

  function initMagnetic() {
    if (!canHover || reduced) return;

    var MAX = 6;
    var items = document.querySelectorAll('.magnetic');

    Array.prototype.forEach.call(items, function (el) {
      var frame = null;

      el.addEventListener('pointermove', function (event) {
        if (frame) cancelAnimationFrame(frame);
        frame = requestAnimationFrame(function () {
          var rect = el.getBoundingClientRect();
          var dx = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
          var dy = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
          el.style.transform = 'translate(' +
            (Math.max(-1, Math.min(1, dx)) * MAX).toFixed(2) + 'px, ' +
            (Math.max(-1, Math.min(1, dy)) * MAX).toFixed(2) + 'px)';
        });
      });

      el.addEventListener('pointerleave', function () {
        if (frame) cancelAnimationFrame(frame);
        el.style.transform = '';
      });
    });
  }

  /* ------------------------------------------------------------------------
     Полоса прогресса скролла
     ------------------------------------------------------------------------ */

  function initPlayhead() {
    var bar = document.querySelector('.playhead');
    if (!bar || reduced) return;

    var ticking = false;

    function update() {
      var scrollable = document.documentElement.scrollHeight - window.innerHeight;
      var progress = scrollable > 0 ? window.scrollY / scrollable : 0;
      bar.style.setProperty('--scroll-progress', Math.min(1, Math.max(0, progress)).toFixed(4));
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }, { passive: true });

    window.addEventListener('resize', update);
    update();
  }

  /* ------------------------------------------------------------------------
     Липкая CTA-панель

     Показываем, когда первый экран уже уехал, и прячем у формы и футера:
     перекрывать кнопку отправки собственной кнопкой — верный способ
     потерять заявку.
     ------------------------------------------------------------------------ */

  function initStickyCta() {
    var panel = document.getElementById('stickyCta');
    if (!panel) return;

    var hero = document.querySelector('.hero');
    var form = document.getElementById('form');
    var footer = document.querySelector('.footer');

    if (!('IntersectionObserver' in window)) return;

    /* Атрибут hidden снимаем сразу: дальше видимостью управляет класс,
       иначе панель не смогла бы выехать анимацией. */
    panel.hidden = false;
    panel.classList.add('is-hidden');

    var heroVisible = true;
    var blockerVisible = false;

    function sync() {
      var show = !heroVisible && !blockerVisible;
      panel.classList.toggle('is-hidden', !show);
    }

    if (hero) {
      new IntersectionObserver(function (entries) {
        heroVisible = entries[0].isIntersecting;
        sync();
      }, { threshold: 0 }).observe(hero);
    } else {
      heroVisible = false;
    }

    var blockers = [form, footer].filter(Boolean);
    if (blockers.length) {
      var states = new WeakMap();
      var blockerObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          states.set(entry.target, entry.isIntersecting);
        });
        blockerVisible = blockers.some(function (el) {
          return states.get(el) === true;
        });
        sync();
      }, { threshold: 0 });

      blockers.forEach(function (el) {
        blockerObserver.observe(el);
      });
    }

    sync();
  }

  /* ------------------------------------------------------------------------
     Плавный переход по якорям с учётом залипшей шапки
     Нужен только там, где scroll-padding-top не спасает: у ссылок,
     ведущих в самый верх страницы.
     ------------------------------------------------------------------------ */

  function initAnchors() {
    document.addEventListener('click', function (event) {
      var link = event.target.closest('a[href^="#"]');
      if (!link) return;

      var id = link.getAttribute('href');
      if (!id || id === '#') return;

      var target = document.querySelector(id);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({
        behavior: reduced ? 'auto' : 'smooth',
        block: 'start'
      });

      /* Адресную строку обновляем вручную: preventDefault отменил бы
         и штатное появление якоря в истории. */
      if (history.replaceState) history.replaceState(null, '', id);
    });
  }

  initReveal();
  initCounters();
  initStrike();
  initGlow();
  initMagnetic();
  initPlayhead();
  initStickyCta();
  initAnchors();
})();
