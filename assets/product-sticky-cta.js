(function () {
  function initStickyCta(button) {
    if (!button || button.dataset.stickyReady === 'true') return;
    button.dataset.stickyReady = 'true';
    button.classList.remove('in-view');

    var host = button.closest('product-info') || document;
    var trigger =
      host.querySelector('.product-form__buttons') ||
      host.querySelector('button[name="add"]') ||
      host.querySelector('.product-form');
    var footer =
      document.querySelector('#shopify-section-footer') ||
      document.querySelector('footer');
    var triggerPassed = false; 
    var footerVisible = false;

    function syncVisibility() {
      var shouldShow = triggerPassed && !footerVisible;
      button.classList.toggle('in-view', shouldShow);
    }

    function updateTriggerPassed() {
      if (!trigger) {
        triggerPassed = false;
        syncVisibility();
        return;
      }
      var rect = trigger.getBoundingClientRect();
      // Show only after user has truly scrolled past the trigger area.
      triggerPassed = rect.bottom <= 0;
      syncVisibility();
    }

    button.addEventListener('click', function (event) {
      event.preventDefault();

      var addButton = host.querySelector('form[data-type="add-to-cart-form"] button[name="add"]');
      if (addButton && !addButton.disabled) {
        addButton.click();
        return;
      }

      var targetSelector = button.getAttribute('data-sticky-target');
      var target = targetSelector ? document.querySelector(targetSelector) : null;
      if (!target) return;
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    updateTriggerPassed();
    window.addEventListener('scroll', updateTriggerPassed, { passive: true });
    window.addEventListener('resize', updateTriggerPassed);

    if ('IntersectionObserver' in window && footer) {
      var footerObserver = new IntersectionObserver(
        function (entries) {
          var entry = entries[0];
          footerVisible = entry.isIntersecting;
          syncVisibility();
        },
        { threshold: 0.01 }
      );
      footerObserver.observe(footer);
    }
  }

  function boot() {
    document.querySelectorAll('[data-product-sticky-cta]').forEach(initStickyCta);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  document.addEventListener('shopify:section:load', boot);
})();
