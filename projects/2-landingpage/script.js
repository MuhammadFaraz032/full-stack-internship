// Hamburger Menu Toggle
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

if (hamburger) {
  hamburger.addEventListener('click', () => mobileMenu.classList.toggle('open'));
}

function closeMobile() { 
  if (mobileMenu) mobileMenu.classList.remove('open'); 
}

// Scroll Reveal Animation
const reveals = document.querySelectorAll('.reveal');
const obs = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      const siblings = [...e.target.parentElement.querySelectorAll('.reveal:not(.visible)')];
      const idx = siblings.indexOf(e.target);
      setTimeout(() => e.target.classList.add('visible'), idx * 80);
      obs.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

reveals.forEach(el => obs.observe(el));

// FAQ Toggle Function
function toggleFaq(btn) {
  const item = btn.parentElement;
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}

// Contact Form Handler
function handleForm(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const originalText = btn.textContent;
  const originalBackground = btn.style.background;
  const originalColor = btn.style.color;
  const originalBorder = btn.style.border;
  
  btn.textContent = 'Sent ✓';
  btn.style.background = 'rgba(0,212,168,0.15)';
  btn.style.color = 'var(--accent)';
  btn.style.border = '1px solid rgba(0,212,168,0.3)';
  
  setTimeout(() => {
    btn.textContent = originalText;
    btn.style.background = originalBackground;
    btn.style.color = originalColor;
    btn.style.border = originalBorder;
    e.target.reset();
  }, 3000);
}