// Template 4 Specific JS
// Note: Persistence is now handled by the unified template-helper.js using MongoDB.

document.addEventListener('click', function(e) {
  const targetLink = e.target.closest('a[href*="#"]:not([href="#"])');
  if (!targetLink) return;

  if (location.pathname.replace(/^\//, '') === targetLink.pathname.replace(/^\//, '') && location.hostname === targetLink.hostname) {
    // Escape special characters in the hash for querySelector
    let hash = targetLink.hash;
    let targetElement = null;
    try {
      targetElement = document.querySelector(hash);
    } catch (err) {
      // fallback if selector syntax fails
    }
    if (!targetElement) {
      targetElement = document.getElementsByName(hash.slice(1))[0];
    }
    if (targetElement) {
      e.preventDefault();
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  }
});