const requestPromise = require('request-promise');

const postOptions = {
  method: 'POST',
  uri: process.env.GOOGLE_SHEET_ENDPOINT
};

const dataToSheet = {
  need: 'NEEDS'
};

function makeRequestOptions(postType, ...data) {

  // Get sheet name based on what is being posted about.
  // Adds flexbility for one place to update sheet names
  // as needed for different types.
  const sheetName = dataToSheet[postType];

  // Merge input data objects with sheetName to make
  // one formData object.
  const formData = Object.assign({
    sheet_name: sheetName
  }, ...data);

  // Make a new object and assign to merge form data to
  // prevent mutation of postOptions constant.
  const requestOptions = Object.assign({}, postOptions, {formData});

  // Return the fresh requestOptions, which is a plain object
  // with data smushed with sheetName into formData,
  // along with method and uri.
  return requestOptions;
}

function addNeed(...data) {

  // Make options for need based on data and type.
  const requestOptions = makeRequestOptions('need', ...data);

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

// Alias a function for adding with Source set as 'Phone' for formData.
function addNeedByPhone(...data){
  return addNeed({
    Source: 'Phone'
  }, ...data);
}

// Alias a function for adding with Source set as 'Web' for formData.
function addNeedByWeb(...data){
  return addNeed({
    Source: 'Web'
  }, ...data);
}

module.exports = { addNeedByPhone, addNeedByWeb };
