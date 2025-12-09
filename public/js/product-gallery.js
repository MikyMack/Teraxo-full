$(document).ready(function() {
  const $galleryItems = $('.gallery-item');
  const $mainImage = $('#main-product-image');
  
  // Initialize Swiper for mobile
  let productSwiper;
  
  function initSwiper() {
    if ($(window).width() <= 480) {
      if (!productSwiper) {
        productSwiper = new Swiper('.product-gallery-swiper', {
          slidesPerView: 3,
          spaceBetween: 10,
          pagination: {
            el: '.swiper-pagination',
            clickable: true,
          },
          breakpoints: {
            320: {
              slidesPerView: 2,
              spaceBetween: 10
            },
            480: {
              slidesPerView: 3,
              spaceBetween: 10
            }
          }
        });
        
        // Re-bind click events after Swiper initialization
        bindGalleryClickEvents();
      }
    } else {
      if (productSwiper) {
        productSwiper.destroy(true, true);
        productSwiper = undefined;
        // Re-bind click events after Swiper destruction
        bindGalleryClickEvents();
      }
    }
  }
  
  function bindGalleryClickEvents() {
    $galleryItems.off('click').on('click', function() {
      // Remove active class from all items
      $galleryItems.removeClass('active');
      
      // Add active class to clicked item
      $(this).addClass('active');
      
      // Get image path from data attribute
      const imagePath = $(this).data('image');
      
      // Fade out current image
      $mainImage.css('opacity', '0.5');
      
      // Preload and change image
      const newImg = new Image();
      newImg.src = imagePath;
      
      newImg.onload = function() {
        setTimeout(function() {
          $mainImage.attr('src', imagePath);
          $mainImage.css('opacity', '1');
        }, 200);
      };
    });
  }
  
  // Initialize on page load
  initSwiper();
  
  // Re-initialize on window resize with debounce
  let resizeTimer;
  $(window).on('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(initSwiper, 250);
  });
  
  // Initial binding of click events
  bindGalleryClickEvents();
});