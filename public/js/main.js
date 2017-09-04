$(document).ready( function() {

  var expectedKeys = ['Text_Input', 'Phone', 'Zip', 'Offer_Type', 'Offer_Detail', 'Need_Type', 'Needs_Detail', 'Language', 'Name', 'Email', 'Housing'];

  initForm();
  initRouting();

  function initForm(){

    $('input[name=Phone]').mask('(000) 000-0000');
    $('input[name=Zip]').mask('00000');

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
      $submit.attr('disabled', true);

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
          $submit.attr('disabled', false);
        });
    });
  }

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
        formData.Notes += (formData.Notes && ', ') + entry.name + ': ' + entry.value;
        return;
      }
      formData[entry.name] = entry.value;
    });

    return formData;
  }

  function initRouting(){
    var dataTabsToRoutes = {
      'Harvey Victims': 'needs',
      'Harvey Helpers': 'offers',
      'Harvey SMS': 'sms'
    };

    var routeToTabs = {
      '$needsTab': $('.tab-link[data-w-tab="Harvey Victims"]'),
      '$offersTab': $('.tab-link[data-w-tab="Harvey Helpers"]'),
      '$smsTab': $('.tab-link[data-w-tab="Harvey SMS"]')
    };

    $('.tab-link').on('click', function(clickEvent){
      clickEvent.preventDefault();
      var $this = $(this);
      page('/' + dataTabsToRoutes[$this.attr('data-w-tab')]);
    });

    function index(){}

    page('/', index);
    page('/needs', index);
    page('/offers', index);
    page('/sms', index);

    (routeToTabs['$' + location.pathname.replace(/\//g, '') + 'Tab'] || routeToTabs.$needsTab).trigger('click');
    page();
  }

});