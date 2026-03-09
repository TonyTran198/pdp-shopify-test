
(function () {
  function initProductFaq(root) {
    if (!root || root.dataset.productFaqReady === 'true') return;
    root.dataset.productFaqReady = 'true';

    const loadMoreButton = root.querySelector('[data-product-faq-load-more]');
    if (!loadMoreButton) return;

    loadMoreButton.addEventListener('click', () => {
      root.querySelectorAll('.product-faq__item.hide').forEach((item) => item.classList.remove('hide'));
      loadMoreButton.hidden = true;
    });
  }

  function boot() {
    document.querySelectorAll('[data-product-faq]').forEach(initProductFaq);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  document.addEventListener('shopify:section:load', boot);
})();