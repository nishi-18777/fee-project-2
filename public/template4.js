// Template 4 Specific JS
// Note: Persistence is now handled by the unified template-helper.js using MongoDB.

$(function() {
  // Use event delegation so links still scroll smoothly after content is loaded from database
  $(document).on('click', 'a[href*="#"]:not([href="#"])', function() {
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        $('html, body').animate({
          scrollTop: target.offset().top
        }, 1000);
        return false;
      }
    }
  });
});