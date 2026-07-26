/* ==========================================================================
   format.js — видео о курсе

   Нативные контролы у видео остаются: перемотка, звук и полный экран должны
   работать штатно. JS отвечает только за свою кнопку поверх постера —
   запускает ролик и убирает кнопку с глаз.
   ========================================================================== */

(function () {
  'use strict';

  var wrap = document.querySelector('.format__video');
  if (!wrap) return;

  var video = wrap.querySelector('.format__player');
  var button = wrap.querySelector('.format__play');
  if (!video || !button) return;

  button.addEventListener('click', function () {
    var started = video.play();

    /* play() возвращает промис, и он отклоняется, если браузер запретил
       воспроизведение. Без catch это уронило бы необработанное исключение
       в консоль. Кнопку в таком случае не прячем — пользователь запустит
       ролик нативными контролами. */
    if (started && typeof started.catch === 'function') {
      started.catch(function () {});
    }
  });

  video.addEventListener('play', function () {
    wrap.classList.add('is-playing');
  });

  /* На паузе кнопку не возвращаем: нативные контролы уже на экране, и вторая
     кнопка поверх них только мешала бы. А вот после конца ролика постер
     показывается снова — вместе с ним уместна и кнопка. */
  video.addEventListener('ended', function () {
    wrap.classList.remove('is-playing');
  });
})();
