/* ==========================================================================
   reviews.js — раскрытие стены отзывов и лайтбокс

   Отзывы — скриншоты переписки, и в сетке они принципиально нечитаемы
   (замеры в шапке reviews.css). Поэтому лайтбокс здесь не украшение,
   а единственный способ прочитать отзыв целиком.
   ========================================================================== */

(function () {
  'use strict';

  var section = document.querySelector('.reviews');
  if (!section) return;

  var shots = Array.prototype.slice.call(section.querySelectorAll('.reviews__shot'));
  if (!shots.length) return;

  /* ------------------------------------------------------------------------
     «Показать все» / «Свернуть»
     ------------------------------------------------------------------------ */

  var grid = document.getElementById('reviewsGrid');
  var toggle = document.getElementById('reviewsToggle');

  if (grid && toggle) {
    var label = toggle.querySelector('.reviews__toggle-text');

    toggle.addEventListener('click', function () {
      var willExpand = toggle.getAttribute('aria-expanded') !== 'true';

      grid.classList.toggle('is-expanded', willExpand);
      toggle.setAttribute('aria-expanded', String(willExpand));
      if (label) {
        /* Литеральный неразрывный пробел: строка идёт через textContent,
           и сущность &nbsp; вывелась бы как текст. */
        label.textContent = willExpand
          ? 'Свернуть'
          : 'Показать все 14 отзывов';
      }

      /* При сворачивании страница «проваливается» вверх на высоту ленты,
         и человек оказывается посреди следующего блока. Возвращаем его
         к заголовку отзывов. */
      if (!willExpand) {
        section.scrollIntoView({ block: 'start' });
      }
    });
  }

  /* ------------------------------------------------------------------------
     Блокировка прокрутки под лайтбоксом

     Одного overflow: hidden мало — на телефоне страница пробивается свайпом,
     поэтому body ещё и уводится из потока через position: fixed.
     ------------------------------------------------------------------------ */

  var savedScroll = 0;

  function lockScroll() {
    savedScroll = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = -savedScroll + 'px';
    document.body.style.left = '0';
    document.body.style.right = '0';
  }

  function unlockScroll() {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';

    /* Пока body был вне потока, высота документа схлопывалась до экрана,
       и браузер обрезал бы возвращаемую позицию. Заставляем пересчитать. */
    void document.body.offsetHeight;

    /* Только instant: у html стоит scroll-behavior: smooth, и обычный
       scrollTo вернул бы позицию анимацией — страница пару секунд ехала бы
       от начала, что выглядит как «прокрутку не восстановили». */
    try {
      window.scrollTo({ top: savedScroll, behavior: 'instant' });
    } catch (e) {
      window.scrollTo(0, savedScroll);
    }
  }

  /* ------------------------------------------------------------------------
     Лайтбокс
     ------------------------------------------------------------------------ */

  var box = document.getElementById('lightbox');
  var img = document.getElementById('lightboxImg');
  var counter = document.getElementById('lightboxCounter');
  var prev = document.getElementById('lightboxPrev');
  var next = document.getElementById('lightboxNext');

  if (!box || !img) return;

  var current = 0;
  var opener = null;

  function show(index) {
    current = (index + shots.length) % shots.length;

    var shot = shots[current];
    var source = shot.querySelector('img');

    img.src = shot.getAttribute('data-shot');
    /* Забираем готовый alt из плитки: там уже лежит текст отзыва,
       дублировать его в разметке лайтбокса незачем. */
    img.alt = source ? source.alt : '';

    if (counter) counter.textContent = (current + 1) + ' / ' + shots.length;
  }

  function open(index) {
    opener = document.activeElement;
    show(index);
    box.hidden = false;
    lockScroll();
    if (prev) prev.focus();
  }

  function close() {
    box.hidden = true;
    unlockScroll();
    /* Фокус возвращаем на плитку, с которой открыли, — иначе он улетает
       в начало документа и навигация с клавиатуры начинается заново.
       preventScroll обязателен: плитка может уходить под обрез свёрнутой
       ленты, и браузер полез бы доскроливать её до видимости, ломая
       раскладку (подробности — в комментарии к .reviews__grid). */
    if (opener && typeof opener.focus === 'function') {
      opener.focus({ preventScroll: true });
    }
    opener = null;
  }

  shots.forEach(function (shot, index) {
    shot.addEventListener('click', function () {
      open(index);
    });
  });

  if (prev) prev.addEventListener('click', function () { show(current - 1); });
  if (next) next.addEventListener('click', function () { show(current + 1); });

  Array.prototype.forEach.call(box.querySelectorAll('[data-lightbox-close]'), function (el) {
    el.addEventListener('click', close);
  });

  document.addEventListener('keydown', function (event) {
    if (box.hidden) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      show(current - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      show(current + 1);
    }
  });
})();
