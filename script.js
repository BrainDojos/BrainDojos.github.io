document.addEventListener('DOMContentLoaded', () => {
  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Intersection Observer for fade-up animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.fade-up').forEach(el => {
    observer.observe(el);
  });

  // THEME SWITCHER
  // Switches the data-theme attribute on body based on the visible section
  const sections = document.querySelectorAll('.section-scroll');
  const themeObserverOptions = {
    threshold: 0.5 // Trigger when 50% of section is visible
  };

  const themeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const theme = entry.target.getAttribute('data-theme');
        if (theme) {
          document.body.setAttribute('data-theme', theme);
        } else {
          // Default to light if no theme specified (Hero usually)
          document.body.setAttribute('data-theme', 'light');
        }
      }
    });
  }, themeObserverOptions);

  sections.forEach(section => {
    themeObserver.observe(section);
  });
});
