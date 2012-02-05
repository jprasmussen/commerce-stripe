jQuery(document).ready(function() {

  jQuery("#commerce-checkout-form-review").submit(function(event) {
    
    // prevent the form from submitting with the default action
    event.preventDefault();
    
    // show progress animated gif (needed for submitting after first error)
    jQuery('.checkout-processing').show();
    
    // disable the submit button to prevent repeated clicks
    jQuery('.form-submit').attr("disabled", "disabled");

    var amount = jQuery('.stripe-order-total').val();
    Stripe.createToken({
        number: jQuery('#edit-commerce-payment-payment-details-credit-card-number').val(),
        cvc: jQuery('#edit-commerce-payment-payment-details-credit-card-code').val(),
        exp_month: jQuery('#edit-commerce-payment-payment-details-credit-card-exp-month').val(),
        exp_year: jQuery('#edit-commerce-payment-payment-details-credit-card-exp-year').val()
    }, amount, stripeResponseHandler);

    // prevent the form from submitting with the default action
    return false;
  });
  
});

function stripeResponseHandler(status, response) {

  if (response.error) {
    //show the errors on the form
    jQuery("div.payment-errors").html(jQuery("<div class='messages error'></div>").html(response.error.message));
    
    // enable the submit button to allow resubmission
    jQuery('.form-submit').removeAttr("disabled");
    // hide progress animated gif
    jQuery('.checkout-processing').hide();
  }
  else {
    var form$ = jQuery("#commerce-checkout-form-review");
    // token contains id, last4, and card type
    var token = response['id'];
    // insert the token into the form so it gets submitted to the server
    form$.append("<input type='hidden' name='stripeToken' value='" + token + "'/>");
    // and submit
    form$.get(0).submit();
  }
}