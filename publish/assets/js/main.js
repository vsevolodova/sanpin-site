/* Видеоаналитика для СанПиН — клиентский скрипт, vanilla JS, без зависимостей */
(function () {
  'use strict';

  // ----- мобильное меню -----
  var nav = document.querySelector('.nav');
  var toggle = document.querySelector('.nav__toggle');
  if (nav && toggle) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    // закрывать по клику на ссылку и по Esc
    nav.querySelectorAll('.nav__list a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  // ----- тень у шапки при скролле -----
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 4) header.classList.add('is-scrolled');
      else header.classList.remove('is-scrolled');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ----- scroll-spy в навигации -----
  var sections = document.querySelectorAll('main section[id]');
  var navLinks = document.querySelectorAll('.nav__list a[href^="#"]');
  if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.getAttribute('id');
        navLinks.forEach(function (a) {
          if (a.getAttribute('href') === '#' + id) a.classList.add('is-active');
          else a.classList.remove('is-active');
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  // ----- fade-in для блоков .reveal -----
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // ----- форма: валидация и отправка на it@ssl-team.com через FormSubmit -----
  var form = document.getElementById('lead-form');
  if (form) {
    var status = document.getElementById('form-status');
    var submitBtn = form.querySelector('button[type="submit"]');
    var submitLabel = submitBtn ? submitBtn.textContent : 'Отправить';
    var fields = form.querySelectorAll('.field input:not([type="hidden"]), .field select');
    var FORM_ENDPOINT = form.getAttribute('action') || 'https://formsubmit.co/it@ssl-team.com';
    var AJAX_ENDPOINT = FORM_ENDPOINT.replace('https://formsubmit.co/', 'https://formsubmit.co/ajax/');

    function setStatus(msg, kind) {
      if (!status) return;
      status.textContent = msg;
      status.classList.remove('is-ok', 'is-err');
      if (kind === 'ok') status.classList.add('is-ok');
      if (kind === 'err') status.classList.add('is-err');
    }

    function setSubmitting(isSubmitting) {
      if (!submitBtn) return;
      submitBtn.disabled = isSubmitting;
      submitBtn.textContent = isSubmitting ? 'Отправка…' : submitLabel;
    }

    function validateField(input) {
      var wrap = input.closest('.field');
      var ok = input.checkValidity();
      if (wrap) wrap.classList.toggle('is-error', !ok);
      return ok;
    }

    fields.forEach(function (input) {
      input.addEventListener('blur', function () { validateField(input); });
      var liveEvent = input.tagName === 'SELECT' ? 'change' : 'input';
      input.addEventListener(liveEvent, function () {
        var wrap = input.closest('.field');
        if (wrap && wrap.classList.contains('is-error')) validateField(input);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (form.querySelector('[name="_honey"]') && form.querySelector('[name="_honey"]').value) {
        return;
      }

      var allOk = Array.prototype.every.call(fields, function (i) { return validateField(i); });
      if (!allOk) {
        setStatus('Проверьте корректность полей.', 'err');
        return;
      }

      var data = new FormData(form);
      var organization = (data.get('organization') || '').toString().trim();
      var contact = (data.get('contact') || '').toString().trim();
      var subject = 'Обсудить внедрение СанПиН · ' + (organization || 'без типа организации');

      data.set('_subject', subject);
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) {
        data.set('_replyto', contact);
      }

      setSubmitting(true);
      setStatus('Отправляем заявку…', null);

      fetch(AJAX_ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: data
      })
        .then(function (res) {
          if (!res.ok) throw new Error('http-' + res.status);
          return res.json();
        })
        .then(function () {
          form.reset();
          setStatus('Спасибо! Заявка отправлена — свяжемся с вами в ближайшее время.', 'ok');
        })
        .catch(function () {
          setStatus('Не удалось отправить заявку. Напишите нам на it@ssl-team.com или попробуйте позже.', 'err');
        })
        .finally(function () {
          setSubmitting(false);
        });
    });
  }
})();
