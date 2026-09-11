(() => {
const motion=matchMedia('(prefers-reduced-motion:reduce)');
if('IntersectionObserver' in window&&!motion.matches){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('reveal');observer.unobserve(entry.target);}}),{threshold:.12});document.querySelectorAll('.belief-body,.step,.adult-grid article').forEach(el=>observer.observe(el));motion.addEventListener('change',()=>{if(motion.matches)observer.disconnect();});}
})();