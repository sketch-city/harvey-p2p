const requestPromise = require('request-promise');

const postOptions = {
  method: 'POST',
  uri: process.env.GOOGLE_SHEET_ENDPOINT
};

// Just some constants to help keep things standardized.
const NEED  = 'need';
const OFFER = 'offer';

const PHONE = 'phone';
const WEB   = 'web';

// Adds flexbility for one place to update sheet names
// as needed for different types.
const DATA_TO_SHEET = {
  [NEED]:   'NEEDS',
  [OFFER]:  'OFFERS'
};

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

function makeRequestOptions(postType, ...data){

  // Get sheet name based on what is being posted about.
  const sheetName = DATA_TO_SHEET[postType];
  const defaultData = DEFAULTS[postType];

  // Merge input data objects with sheetName to make
  // one formData object.
  const formData = Object.assign({
    sheet_name: sheetName
  }, defaultData, ...data);

  // TODO add "schema" validation for formData
  // i.e. if (! isValid(postType, formData) ) { throw up nicely. }

  // Make a new object and assign to merge form data to
  // prevent mutation of postOptions constant.
  const requestOptions = Object.assign({}, postOptions, {formData});

  // Return the fresh requestOptions, which is a plain object
  // with data smushed with sheetName into formData,
  // along with method and uri.
  return requestOptions;
}

function addToSheet(type, ...data){

  // Make options based on data and type.
  const requestOptions = makeRequestOptions(type, ...data);

  // Make the request.
  return requestPromise(requestOptions)
    .catch(function(error){
      // Get the actual response to the post.
      // The Google app is weird and redirects the response location
      // for some reason.
      return requestPromise({
        uri: error.response.headers.location
      })
    });
}

function addNeedByPhone(...data){
  return addToSheet(NEED, {
    Source: SOURCES[PHONE]
  }, ...data);
}

function addNeedByWeb(...data){
  return addToSheet(NEED, {
    Source: SOURCES[WEB]
  }, ...data);
}

function addOfferByPhone(...data){
  return addToSheet(OFFER, {
    Source: SOURCES[PHONE]
  }, ...data);
}

function addOfferByWeb(...data){
  return addToSheet(OFFER, {
    Source: SOURCES[WEB]
  }, ...data);
}

const need = {
  addByPhone:   addNeedByPhone,
  addByWeb:     addNeedByWeb
};

const offer = {
  addByPhone:   addOfferByPhone,
  addByWeb:     addOfferByWeb
};

module.exports = { need, offer };
