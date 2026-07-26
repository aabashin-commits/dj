/* ==========================================================================
   faq.js — аккордеон частых вопросов

   При загрузке все пункты закрыты, одновременно раскрыт максимум один.
   ========================================================================== */

(function () {
  'use strict';

  var list = document.querySelector('.faq__list');
  if (!list) return;

  var heads = list.querySelectorAll('.faq__head');

  Array.prototype.forEach.call(heads, function (head) {
    head.addEventListener('click', function () {
      var item = head.closest('.faq__item');
      var body = item && item.querySelector('.collapse');
      if (!body) return;

      var willOpen = head.getAttribute('aria-expanded') !== 'true';

      Array.prototype.forEach.call(heads, function (other) {
        if (other === head) return;
        other.setAttribute('aria-expanded', 'false');
        var otherBody = other.closest('.faq__item').querySelector('.collapse');
        if (otherBody) otherBody.classList.remove('is-open');
      });

      head.setAttribute('aria-expanded', String(willOpen));
      body.classList.toggle('is-open', willOpen);
    });
  });
})();
