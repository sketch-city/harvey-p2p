const requestPromise = require('request-promise');
const debug = require('debug')('hnp2p:zendesk');

const postOptions = {
  method: 'POST',
  uri: process.env.ZENDESK_API_ENDPOINT,
  json: true,
};

// Just some constants to help keep things standardized.
const NEED  = 'need';
const OFFER = 'offer';

const PHONE = 'phone';
const WEB   = 'web';

const SOURCES = {
  [PHONE]:  'Phone',
  [WEB]:    'Web'
};

const DEFAULTS = {
  [NEED]:   {
    Need_Type: '',
    Need_Detail: '',
    Language: 'English',
    Name: '',
    Email: '',
    Matched: 'False',
    Matched_by: '',
    Notes: '',
    Housing: ''
  },
  [OFFER]:  {
    Offer_Type: '',
    Offer_Detail: '',
    Language: 'English',
    Name: '',
    Email: '',
    Matched: 'False',
    Matched_by: '',
    Notes: ''
  }
};

const FIELD_MAPPINGS = {
  'Need/Offer': 114098252371, // Values: 'need', 'offer'
  'Language': 114098252571,
  'Housing': 114098252551,
  'Home Zip': 114098554412,
  'uuid': 114098201972,
  'Source': 114098202012,
  'Current Zip': 114098252531,
  'Phone': 114098253311,
};

// Note: To allow anonymous requests, the following Customers settings must be
// set in the Support admin interface:
//   - Enable "Anyone can submit tickets"
//   - Disable "Require CAPTCHA"
//   - Disable "Ask users to register"
// See Managing end-user settings in the Zendesk Support Help Center.

function makeRequestOptions(postType, source, ...data){
  // We want to set the following:
  // If available, set email; otherwise leave empty
  // + Phone number
  // + Name if available, otherwise phone number
  // + Need/Offer (need, offer)
  // + Source (Web, Phone)
  // + Home Zip
  // + Current Zip
  // + Housing
  // + Text_Input
  // + Language
  
  const defaultData = DEFAULTS[postType];
  const formData = Object.assign({}, defaultData, ...data);

  var body = {
    request: {
      requester: {
        name: formData['Name'] || formData['Phone'],
        // optionally: email
      },
      subject: formData['Text_Input'],
      comment: {
        body: formData['Text_Input'],
      },
      custom_fields: [
        {
          id: FIELD_MAPPINGS['Need/Offer'],
          value: postType,
        },
        {
          id: FIELD_MAPPINGS['Phone'],
          value: formData['Phone'],
        },
        {
          id: FIELD_MAPPINGS['Source'],
          value: SOURCES[source],
        },
        {
          id: FIELD_MAPPINGS['Home Zip'],
          value: formData['Zip_Home'],
        },
        {
          id: FIELD_MAPPINGS['Current Zip'],
          value: formData['Zip'],
        },
        {
          id: FIELD_MAPPINGS['Housing'],
          value: formData['Housing'],
        },
        {
          id: FIELD_MAPPINGS['Language'],
          value: formData['Language'],
        },
      ],
    },
  };

  if (formData['Email'] !== '') {
    body.request.requester.email = formData['Email'];
  }

  // Make a new object and assign to merge form data to
  // prevent mutation of postOptions constant.
  const requestOptions = Object.assign({}, postOptions, {body});

  return requestOptions;
}

function addItem(postType, source, ...data) {
  const requestOptions = makeRequestOptions(postType, source, ...data);

  debug('requestOptions:', requestOptions);

  // Make the request.
  return requestPromise(requestOptions)
    .catch(function(error){
      // Get the actual response to the post.
      // The Google app is weird and redirects the response location
      // for some reason.
      if (error.response && error.response.statusCode === 302) {
        return requestPromise({
          uri: error.response.headers.location
        })
      }

      // A different error occured
      debug('error:', error);
      throw error;
    });
}

function genAddItem(postType, source) {
  return (...data) => {
    return addItem(postType, source, ...data);
  };
}

// Fulfill the same contract provided by helpers/sheeter
module.exports = {
  need: {
    addByPhone: genAddItem(NEED, PHONE),
    addByWeb: genAddItem(NEED, WEB),
  },
  offer: {
    addByPhone: genAddItem(OFFER, PHONE),
    addByWeb: genAddItem(OFFER, WEB),
  },
}
