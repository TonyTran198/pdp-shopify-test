(function () {
    const selector = 'media-gallery[data-desktop-layout="thumb_with_swipper"]';
    const DESKTOP_BREAKPOINT = 1024;
  
    function throttle(fn, wait) {
      let lastRun = 0;
      let timerId = null;
  
      return (...args) => {
        const now = Date.now();
        const remaining = wait - (now - lastRun);
  
        if (remaining <= 0) {
          if (timerId) {
            clearTimeout(timerId);
            timerId = null;
          }
          lastRun = now;
          fn(...args);
          return;
        }
  
        if (timerId) clearTimeout(timerId);
        timerId = setTimeout(() => {
          lastRun = Date.now();
          fn(...args);
          timerId = null;
        }, remaining);
      };
    }
  
    function init(gallery) {
      if (!gallery || gallery.dataset.swipperReady === 'true' || typeof window.Swiper === 'undefined') return;
  
      const viewer = gallery.querySelector('[id^="GalleryViewer"]');
      const thumbs = gallery.querySelector('[id^="GalleryThumbnails"]');
      if (!viewer || !thumbs) return;
  
      gallery.dataset.swipperReady = 'true';
  
      const thumbWrap = thumbs.closest('.product__media-thumbnails');
      const thumbsNextEl = thumbWrap?.querySelector('.swiper-button-next');
      const thumbsPrevEl = thumbWrap?.querySelector('.swiper-button-prev');
      const thumbsSwiper = new window.Swiper(thumbs, {
        direction: 'horizontal',
        spaceBetween: 8,
        slidesPerView: 'auto',
        slidesPerGroupAuto: true,
        watchOverflow: true,
        resistanceRatio: 0,
        roundLengths: true,
        loop: false,
        breakpoints: {
          1024: { 
            direction: 'vertical',
            slidesPerView: 'auto',
            slidesPerGroupAuto: true,
            spaceBetween: 16,
            autoHeight: true,
            loop: false,
            freeMode: false,
            watchOverflow: true,
            resistanceRatio: 0,
            roundLengths: true,
          },
        },
        navigation: {
          nextEl: thumbsNextEl,
          prevEl: thumbsPrevEl,
        },
      });
  
      const viewerSwiper = new window.Swiper(viewer, {
        slidesPerView: 1,
        spaceBetween: 8,
        navigation: {
          nextEl: viewer.querySelector('.swiper-button-next'),
          prevEl: viewer.querySelector('.swiper-button-prev'),
        },
      });
  
      const getMediaItems = () => Array.from(viewer.querySelectorAll('[data-media-id]'));
      const getThumbSlides = () => Array.from(thumbs.querySelectorAll('.swiper-slide[data-target]'));
      const mediaSoundEnabled = new Set();
      const EDGE_EPSILON = 1;
      const isHorizontalThumbs = () => window.innerWidth < DESKTOP_BREAKPOINT;
      const isLastThumbVisible = () => {
        const slides = getThumbSlides();
        const lastSlide = slides[slides.length - 1];
        if (!lastSlide) return true;
        const containerRect = thumbs.getBoundingClientRect();
        const lastRect = lastSlide.getBoundingClientRect();
        return isHorizontalThumbs()
          ? lastRect.right <= containerRect.right + EDGE_EPSILON
          : lastRect.bottom <= containerRect.bottom + EDGE_EPSILON;
      };
      const isFirstThumbVisible = () => {
        const firstSlide = getThumbSlides()[0];
        if (!firstSlide) return true;
        const containerRect = thumbs.getBoundingClientRect();
        const firstRect = firstSlide.getBoundingClientRect();
        return isHorizontalThumbs()
          ? firstRect.left >= containerRect.left - EDGE_EPSILON
          : firstRect.top >= containerRect.top - EDGE_EPSILON;
      };
      const syncThumbNavState = () => {
        const atStart = thumbsSwiper.isLocked || isFirstThumbVisible();
        const atEnd = thumbsSwiper.isLocked || isLastThumbVisible();
        if (thumbsPrevEl) {
          thumbsPrevEl.classList.toggle('swiper-button-disabled', atStart);
          thumbsPrevEl.setAttribute('aria-disabled', String(atStart));
          thumbsPrevEl.style.pointerEvents = atStart ? 'none' : '';
        }
        if (thumbsNextEl) {
          thumbsNextEl.classList.toggle('swiper-button-disabled', atEnd);
          thumbsNextEl.setAttribute('aria-disabled', String(atEnd));
          thumbsNextEl.style.pointerEvents = atEnd ? 'none' : '';
        }
      };
      const guardThumbNavClick = (event, isNext) => {
        const blocked = isNext ? isLastThumbVisible() : isFirstThumbVisible();
        if (!blocked) return;
        event.preventDefault();
        event.stopPropagation();
      };
  
      const getMediaIdForSlide = (slide) => slide?.dataset?.mediaId;
      const syncThumbCountWithViewer = () => {
        const mediaIds = new Set(getMediaItems().map((slide) => slide.dataset.mediaId).filter(Boolean));
        getThumbSlides().forEach((slide) => {
          if (!mediaIds.has(slide.dataset.target)) {
            slide.remove();
          }
        });
        thumbsSwiper.update();
        syncThumbNavState();
      };
  
      const pauseNonActiveVideos = (activeSlide) => {
        getMediaItems().forEach((slide) => {
          if (slide === activeSlide) return;
          const video = slide.querySelector('video[data-product-video], video');
          if (video && !video.paused) video.pause();
        });
      };
  
      const playVideoInSlide = (slide) => {
        if (!slide) return;
        const video = slide.querySelector('video[data-product-video], video');
        if (!video) return;
        const mediaId = getMediaIdForSlide(slide);
        const keepSoundOn = mediaId && mediaSoundEnabled.has(mediaId);
        video.muted = !keepSoundOn;
        video.playsInline = true;
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(() => {
            // Fallback for autoplay policy: retry muted if sound autoplay is blocked.
            if (keepSoundOn) {
              video.muted = true;
              video.play().catch(() => {});
            }
          });
        }
      };
  
      const setActiveThumb = (mediaId) => {
        getThumbSlides().forEach((slide) => {
          const button = slide.querySelector('.product__media-thumbnail');
          const isActive = slide.dataset.target === mediaId;
          slide.classList.toggle('is-active', isActive);
          if (button) {
            if (isActive) button.setAttribute('aria-current', 'true');
            else button.removeAttribute('aria-current');
          }
        });
      };
  
      const goToMediaById = (mediaId) => {
        syncThumbCountWithViewer();
        const targetIndex = getMediaItems().findIndex((item) => item.dataset.mediaId === mediaId);
        if (targetIndex > -1) viewerSwiper.slideTo(targetIndex);
        setActiveThumb(mediaId);
        syncThumbHeight();
      };
  
      const syncThumbHeight = () => {
        if (!thumbs) return;
        if (window.innerWidth >= DESKTOP_BREAKPOINT) {
          thumbs.style.height = `${viewer.offsetHeight}px`;
        } else {
          thumbs.style.height = '';
        }
        thumbsSwiper.update();
        syncThumbNavState();
      };
  
      const syncThumbHeightThrottled = throttle(syncThumbHeight, 150);
      syncThumbCountWithViewer();
      syncThumbHeight();
      thumbsNextEl?.addEventListener('click', (event) => guardThumbNavClick(event, true), true);
      thumbsPrevEl?.addEventListener('click', (event) => guardThumbNavClick(event, false), true);
      thumbsSwiper.on('slideChange', syncThumbNavState);
      thumbsSwiper.on('transitionEnd', syncThumbNavState);
      thumbsSwiper.on('update', syncThumbNavState);
      thumbsSwiper.on('resize', syncThumbNavState);
      window.addEventListener('resize', syncThumbHeightThrottled);
      viewerSwiper.on('slideChange', () => {
        const activeSlide = viewerSwiper.slides[viewerSwiper.activeIndex];
        const mediaId = activeSlide?.dataset?.mediaId;
        if (mediaId) {
          const thumbIndex = getThumbSlides().findIndex((slide) => slide.dataset.target === mediaId);
          if (thumbIndex > -1) thumbsSwiper.slideTo(thumbIndex);
          setActiveThumb(mediaId);
          pauseNonActiveVideos(activeSlide);
          playVideoInSlide(activeSlide);
        }
        syncThumbHeight();
      });
      viewerSwiper.on('update', syncThumbHeight);
      viewerSwiper.on('transitionEnd', syncThumbHeight);
  
      getThumbSlides().forEach((slide) => {
        slide.addEventListener('click', () => {
          const mediaId = slide.dataset.target;
          if (mediaId) goToMediaById(mediaId);
        });
      });
  
      getMediaItems().forEach((slide) => {
        const video = slide.querySelector('video[data-product-video], video');
        if (!video) return;
        video.addEventListener('volumechange', () => {
          const mediaId = getMediaIdForSlide(slide);
          if (!mediaId) return;
          if (!video.muted && video.volume > 0) mediaSoundEnabled.add(mediaId);
          else mediaSoundEnabled.delete(mediaId);
        });
      });
  
      const initialMediaId = viewerSwiper.slides[viewerSwiper.activeIndex]?.dataset?.mediaId;
      if (initialMediaId) setActiveThumb(initialMediaId);
  
      const originalSetActiveMedia =
        typeof gallery.setActiveMedia === 'function' ? gallery.setActiveMedia.bind(gallery) : null;
  
      if (originalSetActiveMedia) {
        gallery.setActiveMedia = (mediaId, prepend) => {
          originalSetActiveMedia(mediaId, prepend);
          goToMediaById(mediaId);
        };
      }
    }
  
    function boot() {
      document.querySelectorAll(selector).forEach(init);
    }
  
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', boot);
    } else {
      boot();
    }
    document.addEventListener('shopify:section:load', boot);
  })();
  