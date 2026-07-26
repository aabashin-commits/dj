/* ==========================================================================
   form.js — маска телефона, валидация и состояния отправки

   ⚠️ Куда уходят заявки — не решено. sendLead() пока имитирует отправку;
   когда клиент назовёт приёмник (CRM, почта, Telegram-бот), меняется
   только тело этой функции.
   ========================================================================== */

(function () {
  'use strict';

  var form = document.getElementById('leadForm');
  if (!form) return;

  var nameInput = form.querySelector('[name="name"]');
  var phoneInput = form.querySelector('[name="phone"]');
  var agreeInput = form.querySelector('[name="agree"]');
  var submit = form.querySelector('[type="submit"]');
  var status = document.getElementById('leadStatus');

  /* ------------------------------------------------------------------------
     Маска +7 (999) 999-99-99

     Работаем не с текстом поля, а с цифрами: пользователь может вставить
     номер в любом формате, стереть середину или начать с 8 — во всех
     случаях в основе одна и та же последовательность цифр.
     ------------------------------------------------------------------------ */

  function digitsOf(value) {
    var digits = value.replace(/\D/g, '');

    /* Российский номер набирают и с 8, и с +7, и вовсе без кода.
       Приводим к одному виду: десять цифр после семёрки. */
    if (digits.startsWith('8')) digits = '7' + digits.slice(1);
    if (digits.startsWith('7')) digits = digits.slice(1);

    return digits.slice(0, 10);
  }

  function format(digits) {
    if (!digits) return '';

    var out = '+7 (' + digits.slice(0, 3);
    if (digits.length >= 3) out += ') ' + digits.slice(3, 6);
    if (digits.length >= 6) out += '-' + digits.slice(6, 8);
    if (digits.length >= 8) out += '-' + digits.slice(8, 10);

    return out;
  }

  if (phoneInput) {
    phoneInput.addEventListener('input', function () {
      phoneInput.value = format(digitsOf(phoneInput.value));
      clearError(phoneInput, 'phone');
    });

    /* Backspace на конце маски удалял бы только разделитель, и поле
       выглядело бы «залипшим». Стираем вместе с ним последнюю цифру. */
    phoneInput.addEventListener('keydown', function (event) {
      if (event.key !== 'Backspace') return;
      var atEnd = phoneInput.selectionStart === phoneInput.value.length &&
                  phoneInput.selectionEnd === phoneInput.value.length;
      if (!atEnd) return;
      if (/[)\s-]$/.test(phoneInput.value)) {
        event.preventDefault();
        phoneInput.value = format(digitsOf(phoneInput.value).slice(0, -1));
      }
    });

    phoneInput.addEventListener('focus', function () {
      if (!phoneInput.value) phoneInput.value = '+7 (';
    });

    phoneInput.addEventListener('blur', function () {
      if (phoneInput.value === '+7 (') phoneInput.value = '';
    });
  }

  /* ------------------------------------------------------------------------
     Ошибки полей
     ------------------------------------------------------------------------ */

  function errorNode(key) {
    return form.querySelector('[data-error-for="' + key + '"]');
  }

  function showError(input, key) {
    var node = errorNode(key);
    if (node) node.hidden = false;
    if (input) {
      input.classList.add('is-error');
      input.setAttribute('aria-invalid', 'true');
    }
  }

  function clearError(input, key) {
    var node = errorNode(key);
    if (node) node.hidden = true;
    if (input) {
      input.classList.remove('is-error');
      input.removeAttribute('aria-invalid');
    }
  }

  if (nameInput) {
    nameInput.addEventListener('input', function () {
      clearError(nameInput, 'name');
    });
  }

  if (agreeInput) {
    agreeInput.addEventListener('change', function () {
      if (agreeInput.checked) clearError(null, 'agree');
    });
  }

  function setStatus(text, kind) {
    if (!status) return;
    status.textContent = text;
    status.className = 'lead__status' + (kind ? ' lead__status--' + kind : '');
    status.hidden = !text;
  }

  /* ------------------------------------------------------------------------
     Отправка
     ------------------------------------------------------------------------ */

  function sendLead(payload) {
    /* TODO: подставить реальный приёмник заявок. */
    return new Promise(function (resolve) {
      setTimeout(function () {
        if (window.console) console.info('Заявка (заглушка):', payload);
        resolve();
      }, 700);
    });
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    setStatus('', null);

    var valid = true;

    if (!nameInput || !nameInput.value.trim()) {
      showError(nameInput, 'name');
      valid = false;
    }

    /* Проверяем длину именно цифр: у частично заполненной маски
       value непустой, и проверка «поле не пустое» её бы пропустила. */
    if (!phoneInput || digitsOf(phoneInput.value).length !== 10) {
      showError(phoneInput, 'phone');
      valid = false;
    }

    if (!agreeInput || !agreeInput.checked) {
      showError(null, 'agree');
      valid = false;
    }

    if (!valid) {
      var firstInvalid = form.querySelector('.is-error');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    submit.disabled = true;
    var label = submit.textContent;
    submit.textContent = 'Отправляем…';

    sendLead({
      name: nameInput.value.trim(),
      phone: '+7' + digitsOf(phoneInput.value)
    }).then(function () {
      form.reset();
      setStatus('Заявка отправлена. Свяжемся с вами в ближайшее время.', 'success');
    }).catch(function () {
      setStatus('Не получилось отправить. Попробуйте ещё раз или напишите в Telegram.', 'error');
    }).then(function () {
      submit.disabled = false;
      submit.textContent = label;
    });
  });
})();
