(() => {
  const trigger = document.getElementById('hero-video-play');
  const video = document.getElementById('hero-video-player');
  const thumbnail = document.getElementById('hero-video-wrapper');
  if (!trigger || !video || !thumbnail) return;

  const dialog = document.createElement('dialog');
  dialog.className = 'hero-video-modal';
  dialog.setAttribute('aria-label', 'XSEED classroom video');
  dialog.innerHTML = '<div class="hero-video-modal__shade" aria-hidden="true"></div><div class="hero-video-modal__frame"><button class="hero-video-modal__close" type="button" aria-label="Close video">×</button></div>';
  document.body.append(dialog);
  const frame = dialog.querySelector('.hero-video-modal__frame');
  const shade = dialog.querySelector('.hero-video-modal__shade');
  const closeButton = dialog.querySelector('button');
  const fallback = document.createElement('img');
  fallback.className = 'hero-video-modal__fallback';
  fallback.src = video.poster;
  fallback.alt = 'XSEED story — video unavailable';
  fallback.hidden = true;
  frame.prepend(fallback);
  const showFallback = () => {
    video.pause();
    video.hidden = true;
    fallback.hidden = false;
  };
  video.addEventListener('error', showFallback);
  // A failed <source> can emit its own error without a video error event.
  video.querySelectorAll('source').forEach(source => {
    source.addEventListener('error', showFallback);
  });
  video.addEventListener('loadeddata', () => {
    fallback.hidden = true;
    video.hidden = !dialog.open;
  });
  const home = document.createComment('Hero video original location');
  video.before(home);
  let closing = false;
  let openedWithKeyboard = false;
  let previousOverflow;
  let animations = [];
  const duration = () => matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 750;
  const thumbnailTransform = () => {
    const origin = thumbnail.getBoundingClientRect();
    const target = frame.getBoundingClientRect();
    return `translate(${origin.x + origin.width / 2 - target.x - target.width / 2}px, ${origin.y + origin.height / 2 - target.y - target.height / 2}px) scale(${origin.width / target.width}, ${origin.height / target.height})`;
  };
  const animate = (from, to, opening) => {
    const shadeOpacity = opening ? 0 : getComputedStyle(shade).opacity;
    animations.forEach(animation => animation.cancel());
    const options = {
      duration: duration(),
      easing: opening ? 'cubic-bezier(.22, 1, .36, 1)' : 'cubic-bezier(.4, 0, .2, 1)',
      fill: 'both'
    };
    animations = [
      frame.animate(opening ? [{ transform: from, opacity: 1 }, { transform: to, opacity: 1 }] : [
        { transform: from, opacity: 1, offset: 0 },
        { opacity: 1, offset: .65 },
        { transform: to, opacity: 0, offset: 1 }
      ], options),
      shade.animate([{ opacity: shadeOpacity }, { opacity: opening ? 1 : 0 }], options),
      closeButton.animate([{ opacity: opening ? 0 : 1 }, { opacity: opening ? 1 : 0 }], {
        ...options, duration: opening ? duration() : duration() * .25
      })
    ];
    return Promise.all(animations.map(animation => animation.finished.catch(() => {})));
  };

  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.addEventListener('click', event => {
    if (dialog.open) return;
    openedWithKeyboard = event.detail === 0;
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    frame.prepend(video);
    video.hidden = !fallback.hidden;
    dialog.showModal();
    animate(thumbnailTransform(), 'none', true);
    closeButton.focus({ preventScroll: true });
    video.play().catch(error => {
      if (video.error || error.name === 'NotSupportedError') showFallback();
      // Keep native controls available when autoplay alone is blocked.
    });
  });

  const close = async () => {
    if (!dialog.open || closing) return;
    closing = true;
    video.pause();
    // Clear the opening transform before measuring the final destination.
    const currentTransform = getComputedStyle(frame).transform;
    // Only cancel the frame here so the backdrop keeps its current opacity.
    animations[0]?.cancel();
    await animate(currentTransform, thumbnailTransform(), false);
    dialog.close();
    animations.forEach(animation => animation.cancel());
    video.hidden = true;
    home.after(video);
    document.body.style.overflow = previousOverflow;
    trigger.focus({ preventScroll: true });
    // Pointer activation should return to the idle thumbnail; keyboard users
    // retain their visible focus and their place in the tab order.
    if (!openedWithKeyboard) trigger.blur();
    closing = false;
  };
  closeButton.addEventListener('click', close);
  shade.addEventListener('click', close);
  dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
  dialog.addEventListener('wheel', event => event.preventDefault(), { passive: false });
  dialog.addEventListener('touchmove', event => event.preventDefault(), { passive: false });
})();
