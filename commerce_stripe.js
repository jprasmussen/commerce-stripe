/**
 * @file
 * Javascript to generate Stripe token in PCI-compliant way.
 */

(function ($) {
  Drupal.behaviors.stripe = {
    attach: function (context, settings) {
      if (settings.stripe.fetched == null) {
        settings.stripe.fetched = true;

        $('#commerce-checkout-form-checkout, #commerce-checkout-form-review').submit(function(event) {

          // Prevent the Stripe actions to be triggered if Stripe is not selected.
		      if($("input[@name=commerce_payment[payment_method]]:checked").val() == 'commerce_stripe|commerce_payment_commerce_stripe') {
            // Prevent the form from submitting with the default action.
            event.preventDefault();

            // Show progress animated gif (needed for submitting after first error).
            $('.checkout-processing').show();

            // Disable the submit button to prevent repeated clicks.
            $('.form-submit').attr("disabled", "disabled");

            Stripe.setPublishableKey(settings.stripe.publicKey);

            Stripe.createToken({
              number: $('[id^=edit-commerce-payment-payment-details-credit-card-number]').val(),
              cvc: $('[id^=edit-commerce-payment-payment-details-credit-card-code]').val(),
              exp_month: $('[id^=edit-commerce-payment-payment-details-credit-card-exp-month]').val(),
              exp_year: $('[id^=edit-commerce-payment-payment-details-credit-card-exp-year]').val()
            }, Drupal.behaviors.stripe.stripeResponseHandler);

            // Prevent the form from submitting with the default action.
            return false;
          }
        });
      }
    },

    stripeResponseHandler: function (status, response) {
      if (response.error) {
        // Show the errors on the form.
        $("div.payment-errors").html($("<div class='messages error'></div>").html(response.error.message));

        // Enable the submit button to allow resubmission.
        $('.form-submit').removeAttr("disabled");
        // Hide progress animated gif.
        $('.checkout-processing').hide();
      }
      else {
        var form$ = $("#commerce-checkout-form-checkout, #commerce-checkout-form-review");
        // Token contains id, last4, and card type.
        var token = response['id'];
        // Insert the token into the form so it gets submitted to the server.
        form$.append("<input type='hidden' name='stripeToken' value='" + token + "'/>");
        // And submit.
        form$.get(0).submit();
      }
    }
  }
})(jQuery);
