$(document).ready( function() {

  var expectedKeys = [
    'Text_Input',
    'Phone',
    'Zip',
    'Zip_Home',
    'Rent',
    'Offer_Type',
    'Offer_Detail',
    'Need_Type',
    'Needs_Detail',
    'Language',
    'Name',
    'Email',
    'Housing',
  ];

  initForm();
  initRouting();
  initAnalytics();

  function initForm(){

    $('input[name=Phone]').mask('(000) 000-0000');
    $('input[name=Zip]').mask('00000');
    $('input[name=Zip_Home]').mask('00000');

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
      /**
       * Syntax for naming inputs such that they will be concatenated into a
       * single field: inputs with name="FieldName[]" -> field FieldName
       */
      if (entry.name.substr(-2) === '[]') {
        entry.name = entry.name.substr(0, entry.name.length - 2);
        formData[entry.name] = formData[entry.name] || '';
        formData[entry.name] += (formData[entry.name] && ', ') + entry.value;
        return;
      }
      /**
       * Any unexpected form fields will get appended to the Notes field
       */
      if (expectedKeys.indexOf(entry.name) < 0) {
        formData.Notes = formData.Notes || '';
        formData.Notes += (formData.Notes && ', ') + entry.name + ': ' + entry.value;
        return;
      }

      formData[entry.name] = entry.value;
    });

    // Get current language name
    var googtrans = getCookie('googtrans');
    if (googtrans !== null) {
      var languageCode = googtrans.split('/')[2];
      formData.Language = languageCodes[languageCode] || 'Unknown';
    }

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

  function initAnalytics() {
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

    ga('create', 'UA-105727042-8', 'auto');
    ga('send', 'pageview');
  }

  /**
   * https://stackoverflow.com/a/22852843
   */
  function getCookie(c_name) {
    var c_value = " " + document.cookie;
    var c_start = c_value.indexOf(" " + c_name + "=");
    if (c_start == -1) {
        c_value = null;
    }
    else {
        c_start = c_value.indexOf("=", c_start) + 1;
        var c_end = c_value.indexOf(";", c_start);
        if (c_end == -1) {
            c_end = c_value.length;
        }
        c_value = unescape(c_value.substring(c_start,c_end));
    }
    return c_value;
  };
});
