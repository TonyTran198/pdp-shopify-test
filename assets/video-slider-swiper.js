(function () {
  function pauseOtherVideos(container, currentVideo) {
    var videos = container.querySelectorAll('video');
    videos.forEach(function (video) {
      if (video !== currentVideo) video.pause();
    });
  }

  function bindVideoClickPlayback(container) {
    var videos = container.querySelectorAll('video');

    videos.forEach(function (video) {
      if (video.dataset.videoClickBound === 'true') return;
      video.dataset.videoClickBound = 'true';

      video.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();

        if (video.paused) {
          pauseOtherVideos(container, video);
          var playPromise = video.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
          }
        } else {
          video.pause();
        }
      });
    });
  }

  function initVideoSwiper(container) {
    if (!container || container.dataset.videoSwiperReady === 'true') return;

    var slider = container.querySelector('.swiper');
    if (!slider || typeof Swiper === 'undefined') return;

    container.dataset.videoSwiperReady = 'true';

    new Swiper(slider, {
      slidesPerView: 2.1,
      spaceBetween: 30,
      centeredSlides: false,
      grabCursor: true,
      watchOverflow: true,
      breakpoints: {
        750: {
          slidesPerView: 3.2,
          spaceBetween: 30
        },
        990: {
          slidesPerView: 5,
          spaceBetween: 30
        },
        1200: {
          slidesPerView: 7,
          spaceBetween: 30
        }
      }
    });

    bindVideoClickPlayback(container);
  }

  function initAll() {
    var containers = document.querySelectorAll('[data-video-swiper]');
    containers.forEach(initVideoSwiper);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  document.addEventListener('shopify:section:load', function (event) {
    var container = event.target.querySelector('[data-video-swiper]');
    initVideoSwiper(container);
  });
})();
