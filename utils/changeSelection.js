function showChangeSelectionMenu() {
    $('.ph_banner').show();
    if ($(window).width() < 781 ) {
        $('.ph_banner').css('top', '23px');
        $('body').css('margin-top', '275px');
    } else if ($(window).width() < 1025) {
        $('.ph_banner').css('top', '54px');
        $('body').css('margin-top', '275px');
    } else {
        $('.ph_banner').css('top', '54px');
        $('body').css('margin-top', '204px');
    }

    $('.change-selection-container').hide();

    $('html, body').animate({
        scrollTop: $(this).offset().top
    }, 1000);
}

