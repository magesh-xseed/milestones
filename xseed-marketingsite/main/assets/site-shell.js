(() => {
  const header = document.querySelector('.shell-header');
  if (!header) return;
  const menu = header.querySelector('.shell-menu-toggle');
  const nav = header.querySelector('.shell-navigation');
  const closeMenu = () => {
    nav.classList.remove('open');
    menu.setAttribute('aria-expanded', 'false');
  };
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    nav.classList.toggle('open', open);
    menu.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', event => {
    if (!header.contains(event.target)) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav.classList.contains('open')) {
      closeMenu();
      menu.focus();
    }
  });
  nav.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });
  matchMedia('(min-width: 768px)').addEventListener('change', closeMenu);
  const syncHeader = () => {
    const compact = document.body.classList.contains('scrolled');
    document.body.classList.toggle('scrolled', window.scrollY > (compact ? 16 : 70));
  };
  window.addEventListener('scroll', syncHeader, { passive: true });
  syncHeader();
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  nav.querySelectorAll('a').forEach(link => {
    if (link.getAttribute('href') === currentPage) link.setAttribute('aria-current', 'page');
  });
})();
