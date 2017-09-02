$(document).ready( function() {
  var expectedKeys = ['Text_Input', 'Phone', 'Zip', 'Offer_Type', 'Offer_Detail', 'Need_Type', 'Needs_Detail', 'Language', 'Name', 'Email'];

  // function to submit needs form
  $('form').submit(function(event) {
    event.preventDefault();
    var $form = $(this);
    var $submit = $form.find('[type="submit"]');
    var formData = getFormData($form);
    var $success = $form.siblings('.w-form-done');
    var $failure = $form.siblings('.w-form-fail');

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

  function getFormData($form){
    var formDataArray = $form.serializeArray();
    var formData = {};
    Webflow._.each(formDataArray, function(entry){
      if (entry.name.substr(-2) === '[]') {
        entry.name = entry.name.substr(0, entry.name.length - 2);
        formData[entry.name] = formData[entry.name] || '';
        formData[entry.name] += (formData[entry.name] && ', ') + entry.value;
        return;
      }
      if (expectedKeys.indexOf(entry.name) < 0) {
        formData.Notes = formData.Notes || '';
        formData.Notes += entry.name + ': ' + entry.value;
        return;
      }
      formData[entry.name] = entry.value;
    });

    return formData;
  }

//   // change is-checked class on buttons
//   $('.button-group').each(function( i, buttonGroup ) {
//     const $buttonGroup = $( buttonGroup );
//     $buttonGroup.on( 'click', 'button', function() {
//       $buttonGroup.find('.is-checked').removeClass('is-checked');
//       $( this ).addClass('is-checked');
//     });
//   });

});