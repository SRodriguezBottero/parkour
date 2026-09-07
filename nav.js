(function () {
  const item = document.querySelector('nav .has-submenu');
  if (!item) return;

  const trigger = item.querySelector(':scope > a');
  const menu = item.querySelector('.submenu');
  const touch = window.matchMedia('(hover: none)').matches;

  function isOpen() {
    return item.classList.contains('is-open');
  }

  function setOpen(open) {
    item.classList.toggle('is-open', open);
    trigger.setAttribute('aria-expanded', String(open));
    if (!menu) return;
    if (open) menu.removeAttribute('hidden');
    else menu.setAttribute('hidden', '');
  }

  function dismiss() {
    item.classList.add('is-dismissed');
    setOpen(false);
    trigger.focus();
  }

  function clearDismissed() {
    item.classList.remove('is-dismissed');
  }

  setOpen(false);

  if (touch) {
    trigger.addEventListener('click', function (e) {
      if (!isOpen()) {
        e.preventDefault();
        clearDismissed();
        setOpen(true);
      }
    });
  } else {
    item.addEventListener('mouseenter', function () {
      if (item.classList.contains('is-dismissed')) return;
      setOpen(true);
    });
    item.addEventListener('mouseleave', function () {
      clearDismissed();
      if (!item.contains(document.activeElement)) setOpen(false);
    });
  }

  item.addEventListener('focusin', function () {
    if (item.classList.contains('is-dismissed')) return;
    setOpen(true);
  });

  item.addEventListener('focusout', function (e) {
    if (!item.contains(e.relatedTarget)) {
      clearDismissed();
      setOpen(false);
    }
  });

  document.addEventListener('click', function (e) {
    if (!item.contains(e.target)) {
      clearDismissed();
      setOpen(false);
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!isOpen() && !item.contains(document.activeElement)) return;
    e.preventDefault();
    dismiss();
  });
})();
