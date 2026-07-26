/* ==========================================================================
   countdown.js — таймер до закрытия набора

   Дата лежит в разметке, в data-countdown, и читается двумя потребителями:
   плашкой дедлайна в hero и липкой CTA-панелью. Менять её нужно в обоих
   местах — это единственное дублирование, и оно осознанное: панель должна
   работать, даже если hero из разметки уберут.

   ⚠️ В строках ниже стоит ЛИТЕРАЛЬНЫЙ неразрывный пробел (U+00A0), а не
   сущность &nbsp;: текст вставляется через textContent, и сущность
   вывелась бы как есть. В редакторе он неотличим от обычного пробела.
   ========================================================================== */

(function () {
  'use strict';

  var roots = document.querySelectorAll('[data-countdown]');
  if (!roots.length) return;

  /* ------------------------------------------------------------------------
     Склонение числительных
     ------------------------------------------------------------------------ */

  function plural(value, one, few, many) {
    var mod10 = value % 10;
    var mod100 = value % 100;
    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
    return many;
  }

  function pad(value) {
    return value < 10 ? '0' + value : String(value);
  }

  function split(ms) {
    var total = Math.max(0, Math.floor(ms / 1000));
    return {
      days: Math.floor(total / 86400),
      hours: Math.floor(total / 3600) % 24,
      minutes: Math.floor(total / 60) % 60,
      seconds: total % 60
    };
  }

  /* ------------------------------------------------------------------------
     Разметка развёрнутого таймера строится один раз, дальше меняются
     только числа: пересоздавать узлы каждую секунду — лишняя работа
     для браузера и мигание для скринридера.
     ------------------------------------------------------------------------ */

  function buildUnits(container) {
    var units = ['days', 'hours', 'minutes', 'seconds'];
    var refs = {};

    units.forEach(function (name) {
      var unit = document.createElement('div');
      unit.className = 'countdown__unit';

      var value = document.createElement('span');
      value.className = 'countdown__value';

      var label = document.createElement('span');
      label.className = 'countdown__label';

      unit.appendChild(value);
      unit.appendChild(label);
      container.appendChild(unit);

      refs[name] = { value: value, label: label };
    });

    return refs;
  }

  Array.prototype.forEach.call(roots, function (root) {
    var deadline = new Date(root.getAttribute('data-countdown')).getTime();
    if (isNaN(deadline)) return;

    var isShort = root.hasAttribute('data-countdown-short');
    var output = root.querySelector('[data-countdown-output]');
    var refs = null;

    if (!isShort) {
      if (!output) return;
      refs = buildUnits(output);
    }

    function render() {
      var left = deadline - Date.now();

      if (left <= 0) {
        root.classList.add('is-expired');
        if (isShort) {
          root.textContent = '';
        } else if (output) {
          output.textContent = '';
        }
        return true; /* сигнал остановить интервал */
      }

      var t = split(left);

      if (isShort) {
        /* В панели места мало: дни словом, остальное часами и минутами. */
        root.textContent = 'осталось ' + t.days + ' ' +
          plural(t.days, 'день', 'дня', 'дней') + ' ' +
          pad(t.hours) + ':' + pad(t.minutes);
        return false;
      }

      refs.days.value.textContent = t.days;
      refs.days.label.textContent = plural(t.days, 'день', 'дня', 'дней');

      refs.hours.value.textContent = pad(t.hours);
      refs.hours.label.textContent = plural(t.hours, 'час', 'часа', 'часов');

      refs.minutes.value.textContent = pad(t.minutes);
      refs.minutes.label.textContent = plural(t.minutes, 'минута', 'минуты', 'минут');

      refs.seconds.value.textContent = pad(t.seconds);
      refs.seconds.label.textContent = plural(t.seconds, 'секунда', 'секунды', 'секунд');

      return false;
    }

    if (render()) return;

    var timer = setInterval(function () {
      if (render()) clearInterval(timer);
    }, 1000);
  });
})();
