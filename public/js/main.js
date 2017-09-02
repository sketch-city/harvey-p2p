// function to submit needs form
$('#wf-form-Need-Form').submit(function(event) {
  event.preventDefault();
  var formData = $(this).serialize();
  $.post("/api/v1/web/needs", formData)
    .done(function(response) {
      // TODO: verify success
      $('.form').hide();
      $('.w-form-done').show();
    })
    .fail(function(error) {
      $('.form').hide();
      $('.w-form-fail').show();
    });
});