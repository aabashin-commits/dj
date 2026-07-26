/* ==========================================================================
   program.js — табы тарифов и аккордеоны модулей

   Табы сделаны по паттерну WAI-ARIA: роли уже проставлены в разметке,
   здесь добавляется переключение и навигация стрелками с клавиатуры.
   ========================================================================== */

(function () {
  'use strict';

  var section = document.querySelector('.program');
  if (!section) return;

  /* ------------------------------------------------------------------------
     Табы тарифов
     ------------------------------------------------------------------------ */

  var tabs = Array.prototype.slice.call(section.querySelectorAll('.program__tab'));
  var panels = Array.prototype.slice.call(section.querySelectorAll('.program__panel'));

  function activate(tab, setFocus) {
    tabs.forEach(function (item) {
      var selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.classList.toggle('is-active', selected);
      /* Из таб-порядка выпадают все, кроме активного: внутри группы
         переключаемся стрелками, а Tab уводит сразу в содержимое. */
      item.tabIndex = selected ? 0 : -1;
    });

    panels.forEach(function (panel) {
      panel.hidden = panel.id !== tab.getAttribute('aria-controls');
    });

    if (setFocus) tab.focus();

    /* Анимация зачёркивания цены. Панель комбо-тарифа скрыта при загрузке,
       поэтому IntersectionObserver из main.js по ней не отработает —
       запускаем вручную, сбрасывая класс на кадр, чтобы линия рисовалась
       заново при каждом возврате на таб. */
    var panel = document.getElementById(tab.getAttribute('aria-controls'));
    if (!panel) return;

    var strikes = panel.querySelectorAll('[data-strike]');
    Array.prototype.forEach.call(strikes, function (el) {
      el.classList.remove('is-visible');
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          el.classList.add('is-visible');
        });
      });
    });
  }

  tabs.forEach(function (tab, index) {
    tab.tabIndex = tab.getAttribute('aria-selected') === 'true' ? 0 : -1;

    tab.addEventListener('click', function () {
      activate(tab, false);
    });

    tab.addEventListener('keydown', function (event) {
      var step = 0;
      if (event.key === 'ArrowRight') step = 1;
      else if (event.key === 'ArrowLeft') step = -1;
      else if (event.key === 'Home') step = -index;
      else if (event.key === 'End') step = tabs.length - 1 - index;
      else return;

      event.preventDefault();
      var next = (index + step + tabs.length) % tabs.length;
      activate(tabs[next], true);
    });
  });

  /* ------------------------------------------------------------------------
     Аккордеоны модулей
     Внутри одного тарифа одновременно раскрыт максимум один модуль:
     иначе список из пяти развёрнутых описаний вытягивает карточку
     на два экрана и цена уезжает из поля зрения.
     ------------------------------------------------------------------------ */

  var heads = section.querySelectorAll('.program__module-head');

  Array.prototype.forEach.call(heads, function (head) {
    head.addEventListener('click', function () {
      var module = head.closest('.program__module');
      var body = module && module.querySelector('.collapse');
      if (!body) return;

      var willOpen = head.getAttribute('aria-expanded') !== 'true';
      var list = module.closest('.program__modules');

      if (list) {
        Array.prototype.forEach.call(list.querySelectorAll('.program__module-head'), function (other) {
          if (other === head) return;
          other.setAttribute('aria-expanded', 'false');
          var otherBody = other.closest('.program__module').querySelector('.collapse');
          if (otherBody) otherBody.classList.remove('is-open');
        });
      }

      head.setAttribute('aria-expanded', String(willOpen));
      body.classList.toggle('is-open', willOpen);
    });
  });
})();
