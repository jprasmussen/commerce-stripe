/**
 * @file
 * Javascript to generate Stripe token in PCI-compliant way.
 */

(function ($) {
  Drupal.behaviors.stripe = {
    attach: function (context, settings) {
      $('.stripe', context).each(function() {
        var $form = $(this).parents('form');

        $form.once('stripe-preprocessed', function() {
          $form.submit(function(event) {
            if (!$form.hasClass('stripe-processed')) {
              if (!$form.hasClass('stripe-processing')) {
                $form.addClass('stripe-processing');
                stripeCreateToken($form, settings.stripe.publicKey);
              }
              event.preventDefault();
              return false;
            }
          });
        });
      });
    },
  };

  function stripeCreateToken($form, publicKey) {
    var cardValues = {
      name: $('.stripe-owner', $form).val(),
      number: $('.stripe-number', $form).val(),
      cvc: $('.stripe-code', $form).val(),
      exp_month: $('.stripe-exp_month', $form).val(),
      exp_year: $('.stripe-exp_year', $form).val()
    };

    Stripe.setPublishableKey(publicKey);
    Stripe.createToken(cardValues, function(status, response) {
      if (response.error) {
        $('.stripe-token', $form).val('');
        $('.stripe-error', $form).val(response.error.message);
        $('.stripe-error-message', $form).val(response.error.message);
      }
      else {
        $('.stripe-token', $form).val(response['id']);
        $('.stripe-error', $form).val('');
        $('.stripe-error-message', $form).val('');
      }

      $form.removeClass('stripe-processing');
      $form.addClass('stripe-processed');
      $form.submit();
    });
  }

})(jQuery);
