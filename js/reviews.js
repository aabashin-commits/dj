/* ==========================================================================
   reviews.js — слайдер отзывов

   Прокрутку делает сама лента (scroll-snap), JS только двигает scrollLeft
   и гасит стрелки на краях. Благодаря этому свайп на телефоне работает
   без единой строчки кода.
   ========================================================================== */

(function () {
  'use strict';

  var track = document.getElementById('reviewsTrack');
  var prev = document.getElementById('reviewsPrev');
  var next = document.getElementById('reviewsNext');

  if (!track || !prev || !next) return;

  function step() {
    var card = track.querySelector('.reviews__card');
    if (!card) return track.clientWidth;
    /* Ширина карточки плюс зазор: без зазора лента со временем
       уползает и снап начинает промахиваться. */
    var styles = getComputedStyle(track);
    var gap = parseFloat(styles.columnGap || styles.gap) || 0;
    return card.getBoundingClientRect().width + gap;
  }

  function syncButtons() {
    /* Запас в 2px: при дробной ширине карточек scrollLeft почти никогда
       не совпадает с максимумом до пикселя, и кнопка гасла бы через раз. */
    var max = track.scrollWidth - track.clientWidth - 2;
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= max;
  }

  prev.addEventListener('click', function () {
    track.scrollBy({ left: -step(), behavior: 'smooth' });
  });

  next.addEventListener('click', function () {
    track.scrollBy({ left: step(), behavior: 'smooth' });
  });

  var ticking = false;
  track.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      syncButtons();
      ticking = false;
    });
  }, { passive: true });

  window.addEventListener('resize', syncButtons);
  syncButtons();
})();
