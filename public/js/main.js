$(document).ready( function() {
  // function to submit needs form
  $('form').submit(function(event) {
    event.preventDefault();
    var $form = $(this);
    var $submit = $form.find('[type="submit"]');
    var formData = $form.serialize();
    var formDataArray = $form.serializeArray();
    var $success = $form.siblings('.w-form-done');
    var $failure = $form.siblings('.w-form-fail');

    // console.info(formData, formDataArray);

    var currentSubmitText = $submit.attr('value');
    $submit.attr('value', $submit.attr('data-wait'));
    // return;
    $.post($form.attr('action'), formData)
      .done(function(response) {
        // TODO: verify success
        $success.show();
      })
      .fail(function(error) {
        $failure.show();
      })
      .always(function(){
        $form.hide();
        $form[0].reset();
        $submit.attr('value', currentSubmitText);
      });
  });

//   // change is-checked class on buttons
//   $('.button-group').each(function( i, buttonGroup ) {
//     const $buttonGroup = $( buttonGroup );
//     $buttonGroup.on( 'click', 'button', function() {
//       $buttonGroup.find('.is-checked').removeClass('is-checked');
//       $( this ).addClass('is-checked');
//     });
//   });

});