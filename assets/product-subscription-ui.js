(function () {
  function initSubscriptionUI(root) {
    if (!root || root.dataset.subscriptionUiReady === 'true') return;

    const oneTimeButton = root.querySelector('[data-subscription-option="one-time"]');
    const subscribeWrapper = root.querySelector('[data-subscription-option-wrapper]');
    const subscribeButton = root.querySelector('[data-subscription-option="subscribe"]');
    const subscribeContent = root.querySelector('[data-subscription-content]');
    const oneTimeRadio = oneTimeButton?.querySelector('.subscription-ui__radio');
    const subscribeRadio = subscribeButton?.querySelector('.subscription-ui__radio');
    const subscribePrice = root.querySelector('[data-subscription-price]');
    const planButtons = root.querySelectorAll('[data-subscription-plan]');

    if (!oneTimeButton || !subscribeButton || !subscribeWrapper || !subscribeContent || !planButtons.length) return;

    function setMode(mode) {
      const isSubscribe = mode === 'subscribe';
      oneTimeButton.classList.toggle('is-active', !isSubscribe);
      oneTimeRadio?.classList.toggle('is-active', !isSubscribe);
      subscribeButton.classList.toggle('is-active', isSubscribe);
      subscribeRadio?.classList.toggle('is-active', isSubscribe);
      subscribeWrapper.classList.toggle('is-active', isSubscribe);
      subscribeContent.classList.toggle('is-hidden', !isSubscribe);
      oneTimeButton.setAttribute('aria-expanded', String(!isSubscribe));
      subscribeButton.setAttribute('aria-expanded', String(isSubscribe));
    }

    function setPlan(target) {
      if (!target) return;
      planButtons.forEach((button) => {
        const isActive = button === target;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-checked', String(isActive));
      });
      if (subscribePrice) subscribePrice.textContent = target.dataset.price || '$32.30';
    }

    oneTimeButton.addEventListener('click', function () {
      setMode('one-time');
    });

    subscribeButton.addEventListener('click', function () {
      setMode('subscribe');
    });

    planButtons.forEach((button) => {
      button.addEventListener('click', function () {
        setMode('subscribe');
        setPlan(button);
      });
    });

    setMode('subscribe');
    root.dataset.subscriptionUiReady = 'true';
  }

  function initAllSubscriptionUI() {
    document.querySelectorAll('[data-subscription-ui]').forEach(initSubscriptionUI);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllSubscriptionUI);
  } else {
    initAllSubscriptionUI();
  }

  document.addEventListener('shopify:section:load', function () {
    initAllSubscriptionUI();
  });
})();
