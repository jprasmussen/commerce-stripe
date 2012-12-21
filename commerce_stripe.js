/**
 * @file
 * Javascript to generate Stripe token in PCI-compliant way.
 */

(function ($) {
  Drupal.behaviors.stripe = {
    attach: function (context, settings) {
      if (settings.stripe.fetched == null) {
        settings.stripe.fetched = true;

        $('#commerce-checkout-form-checkout #edit-continue, #commerce-checkout-form-review #edit-continue').live('click', function(event) {

          // Prevent the Stripe actions to be triggered if Stripe is not selected.
          if ($('#edit-commerce-payment-payment-method-commerce-stripecommerce-payment-commerce-stripe').is(':checked')) {
            $(this).addClass('auth-processing');

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
              exp_year: $('[id^=edit-commerce-payment-payment-details-credit-card-exp-year]').val(),
              name: $('[id^=edit-commerce-payment-payment-details-credit-card-owner]').val()
            }, Drupal.behaviors.stripe.stripeResponseHandler);

            // Prevent the form from submitting with the default action.
            return false;
          }
        });
      }
    },

    stripeResponseHandler: function (status, response) {
      if (response.error) {
        $(this).removeClass('auth-processing');

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
        $btnTrigger = $('.form-submit.auth-processing').eq(0);
        var trigger$ = $("<input type='hidden' />").attr('name', $btnTrigger.attr('name')).attr('value', $btnTrigger.attr('value'));
        form$.append(trigger$);

        // Remove "name" attributes from Stripe related input elements to
        // prevent card data to be sent to Drupal server
        // (see https://stripe.com/docs/tutorials/forms)
        $('[id^=edit-commerce-payment-payment-details-credit-card-number]').removeAttr('name');
        $('[id^=edit-commerce-payment-payment-details-credit-card-code]').removeAttr('name');
        $('[id^=edit-commerce-payment-payment-details-credit-card-exp-month]').removeAttr('name');
        $('[id^=edit-commerce-payment-payment-details-credit-card-exp-year]').removeAttr('name');
        $('[id^=edit-commerce-payment-payment-details-credit-card-owner]').removeAttr('name');
        
        // And submit.
        form$.get(0).submit();
      }
    }
  }
})(jQuery);
