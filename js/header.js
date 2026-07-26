/* ==========================================================================
   header.js — шапка: залипание, бургер-меню, переключатель темы
   ========================================================================== */

(function () {
  'use strict';

  var header = document.getElementById('header');
  if (!header) return;

  /* ------------------------------------------------------------------------
     Залипание
     Порог 100px — тот же, что у референса (data-scroll="100").
     ------------------------------------------------------------------------ */

  var ticking = false;

  function updateFixed() {
    header.classList.toggle('is-fixed', window.scrollY > 100);
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateFixed);
  }, { passive: true });

  updateFixed();

  /* ------------------------------------------------------------------------
     Бургер-меню
     ------------------------------------------------------------------------ */

  var burger = document.getElementById('burger');
  var menu = document.getElementById('mobileMenu');

  if (burger && menu) {
    function setMenu(open) {
      menu.hidden = !open;
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    }

    burger.addEventListener('click', function () {
      setMenu(menu.hidden);
    });

    /* Клик по пункту закрывает меню: иначе после перехода к якорю
       список остаётся раскрытым поверх контента. */
    menu.addEventListener('click', function (event) {
      if (event.target.closest('a')) setMenu(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !menu.hidden) {
        setMenu(false);
        burger.focus();
      }
    });

    /* При возврате на десктоп меню должно закрыться само: оно скрыто
       только медиазапросом, и раскрытым осталось бы висеть под шапкой. */
    var desktop = window.matchMedia('(min-width: 1025px)');
    var onChange = function (event) {
      if (event.matches) setMenu(false);
    };
    if (desktop.addEventListener) {
      desktop.addEventListener('change', onChange);
    } else if (desktop.addListener) {
      desktop.addListener(onChange);
    }
  }

  /* ------------------------------------------------------------------------
     Переключатель темы

     Начальное значение уже проставлено инлайн-скриптом в <head> — до первой
     отрисовки, чтобы страница не мигала чужой темой. Здесь только
     переключение и запись выбора.
     ------------------------------------------------------------------------ */

  var switcher = document.getElementById('themeSwitcher');
  if (!switcher) return;

  var root = document.documentElement;

  function currentTheme() {
    return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function syncSwitcher() {
    var isLight = currentTheme() === 'light';
    switcher.setAttribute('aria-pressed', String(isLight));
    switcher.setAttribute('aria-label',
      isLight ? 'Включить тёмную тему' : 'Включить светлую тему');
  }

  switcher.addEventListener('click', function () {
    var next = currentTheme() === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    try {
      localStorage.setItem('kidy-theme', next);
    } catch (e) {
      /* приватный режим — выбор просто не переживёт перезагрузку */
    }
    syncSwitcher();
  });

  syncSwitcher();
})();
