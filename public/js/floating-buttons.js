// Floating WhatsApp and Call Buttons
(function($) {
    "use strict";

    $(document).ready(function() {
        // Create floating buttons HTML
        const floatingButtonsHTML = `
            <div class="floating-buttons">
                <a href="https://wa.me/919876543210" class="floating-button whatsapp-button" target="_blank" rel="noopener noreferrer">
                    <i class="fa-brands fa-whatsapp"></i>
                    <span class="tooltip">Chat on WhatsApp</span>
                </a>
                <a href="tel:+919876543210" class="floating-button call-button">
                    <i class="fa-solid fa-phone"></i>
                    <span class="tooltip">Call Us Now</span>
                </a>
            </div>
        `;

        // Append the floating buttons to the body
        $('body').append(floatingButtonsHTML);

        // Add entrance animation
        $('.floating-button').each(function(index) {
            $(this).css({
                'opacity': '0',
                'transform': 'scale(0)'
            });

            setTimeout(() => {
                $(this).css({
                    'transition': 'all 0.3s ease',
                    'opacity': '1',
                    'transform': 'scale(1)'
                });
            }, 300 * (index + 1));
        });
        
        // Show/hide floating buttons on scroll
        var lastScrollTop = 0;
        $(window).scroll(function() {
            var st = $(this).scrollTop();
            var floatingButtons = $('.floating-buttons');
            
            if (st > 200) {
                // Show buttons when scrolling down
                floatingButtons.addClass('visible');
            } else {
                // Hide buttons when at the top
                floatingButtons.removeClass('visible');
            }
            
            lastScrollTop = st;
        });
    });

})(jQuery);
