//this file contains all the data editing functions

var sep = ':';
var nada = ' N/A';
var auxClean = require('./AuxiliaryCleaners.js');

module.exports = {
  //this function just edits the headers to format them the way we want
  editHeaders: function(commentOutline) {

    //console.log(commentOutline);
    commentOutline[0] = ('Decision:'); //add the decision marker to the beginning of the line
    commentOutline[1] = ('Objective:'); //they don't have an objective column
    commentOutline = module.exports.filter(commentOutline); //remove non colon values and whitespace
    commentOutline.splice(commentOutline.indexOf('Use the following template, and remove the spaces:""'), 1); //remove this one
    commentOutline.splice(commentOutline.indexOf('Decision: Rejected'), 1); //remove this one

    commentOutline = ['Decision:','Objective:','SAT I (breakdown):','ACT:','SAT II:','Unweighted GPA (out of 4.0):','Rank (percentile if rank is unavailable):','AP (place score in parenthesis):','IB (place score in parenthesis):','Senior Year Course Load:','Major Awards (USAMO, Intel etc.):','Subjective:','Extracurriculars (place leadership in parenthesis):','Job/Work Experience:','Volunteer/Community service:','Summer Activities:','Essays:','Teacher Recommendation:','Counselor Rec:','Additional Rec:','Interview:','State (if domestic applicant):','Country (if international applicant):','School Type:','Ethnicity:','Gender:','Income Bracket:','Hooks (URM, first generation college, etc.):','Reflection','Strengths:','Weaknesses:','Why you think you were accepted/waitlisted/rejected:','Where else were you accepted/waitlisted/rejected:','General Comments:']
    //commentOutline.pop(); //remove "generalcomments[noparse]"
    //commentOutline.push('General Comments:');
    return commentOutline;
  },
  //this function takes a line and formats it based on the constraints in messages[0]
  //if the text in the line before the colon is matched to a header, then validate that string by returning everything after the colon
  //it lines up the data to make a smooth read
  format: function(lines, headers) {
    for (var ii = 0; ii < headers.length; ii++) { //filter through the headers
      if (lines[ii] != null && (ii == 0 || recognizeHeader(lines[ii].slice(0, lines[ii].indexOf(sep) + 1 ), headers[ii], headers, ii) )) { //if the next line isn't null and has some sort of semblance of a column header... cuz people are making all sorts of shit up for these column headers
        console.log(lines[ii] + " has a header similar to this: " + headers[ii])
        lines[ii] = lines[ii].slice(lines[ii].indexOf(sep)+1); //remove the header part

        //if it's not a header and has that wretched [size+=2] then replace it
      } else {
        var index = headers.length; //for if lines[ii] is null
        if (lines[ii] != null) {
          index = headers.indexOf(lines[ii].slice(0,lines[ii].indexOf(sep)+1)); //get the index in headers of the misplaced header that appears in lines
        }
        if (index != -1) { //if it exists
          if (index > ii) {//if there have been some lines skipped
            for (var jj = ii; jj < index; jj++) {
              lines.splice(jj, 0, nada); //add an N/A to fix it for each spot in between the two
            }
            ii = index; //shift the incrementer down a bit
            if (index != headers.length) {
              lines[ii] = lines[ii].replace(headers[ii], ""); //remove the header part
            }
          } else { //if it's something that should have been put back somewhere else:
            //we're too far ahead at this point which means that the code went wrong somewhere so troubleshooting needs to occur
            console.log("error with placement with this line: " + lines[ii]);
            //console.log(lines[ii]);
            lines.splice(ii,1); //remove the stuff
            ii--;
            //console.log(lines[ii]);

            if (0) {
              console.log("In the message where the user had these comments: " + lines[lines.length-1]);
              console.log("There was an error on line: " + ii);
              console.log("The header should've been: " + headers[ii]);
              console.log("But it was: " + lines[ii]);
              console.log("And it was meant to be higher up the ladder at: " + index)
              console.log("^^^^^^^^");}}
        } else { //if it doesn't exist
          if ((lines[ii+1] != null && lines[ii+1].includes(headers[ii+1])) || (lines[ii+2] != null && lines[ii+2].includes(headers[ii+2]))) {//someone used the wrong header name but the next one is the correct one or the one after that is correct
            
            //console.log("Replacing: " + lines[ii]);
            lines[ii] = lines[ii].slice(lines[ii].indexOf(sep)+1);
          } else {
            //console.log("Removing: " + lines[ii]);

            lines.splice(ii, 1);
            ii--;
          }
        }
      }
    }

  },
  //this is a filter function; it means its sorting through hundreds of lines to make sure the data is sound - where all the filtering and editing happens
  //this filters out all the spaces and non colon values and other stuff... no formatting occurs just editing
  filter: function(array) {
    var removeFromHeader = [];
    array = array.filter(function(str) {
      return /\S/.test(str);
    }); //copied from stack overflow to remove whitespace
    var top = array[0];
    array = array.filter(function(str) {
      if (str == array[0]) {
        return str;
      } else {
        return /.:/.test(str);
      }
    }); //remove non colon values
    for (var ii = 0; ii < array.length; ii++) {//this is for sorting through the data and making mass changes where necessary
      array[ii] = array[ii].replace(/<(?:.|\n)*?>/gm, ''); //strip any html
      array[ii] = array[ii].replace(/\[([^\]]+)\]/g,''); //strip anything inside brackets
      array[ii] = array[ii].trim();
      array[ii] = array[ii].replace(/\r?\n|\r/g, ' '); //remove newLine characters
      array[ii] = array[ii].replace(/&[^ ;]{1,6};/g, ''); //remove html characters like &apos; or &#x22;
      if (array[0] != 'Decision:' && array[ii].slice(array[ii].indexOf(sep)+1) == '') {// don't edit if it's the headers
        array[ii] = array[ii] + nada;
      } else if (array[0] == 'Decision:'){ //add quotes if the header has quotes in it
        if (array[ii].includes(',')) {
          array[ii] = '"' + array[ii] + '"';
        }
      }
      if (array[ii].includes(',')) { //if there a commas put delimiters
        array[ii] = array[ii].slice(0, array[ii].indexOf(sep)+1) + "\"" + array[ii].slice(array[ii].indexOf(sep)+1) + "\""; //here i'm putting quotes between any strings that have commas: such as Activites:"Soccer, Math club, Student Government"
      }
      
    }
    for (remove of removeFromHeader) { //remove a custom set text from the headers
      array[0] = array[0].replace(remove, '');
    }
    return array;
  }
};

//this takes an expected header and an actual header and determines if they are similar enough to each other
//it basically removes all the non alphanumeric values and replaces them with spaces, converting these words into arrays, searching for matches
//if at least 20% of the words match, then i return true
function recognizeHeader(expected, actual, headers, index) {
  if (headers.indexOf(capFL(actual)) == index) {//if it matches exactly
    return true;
  } else if (headers.indexOf(capFL(actual)) == -1) { //if it doesn't exist
    expected = expected.replace(/\([^\)]*\)/g,'').replace(/[^ \w+]/g, ''); //replace all punctuation
    actual = actual.replace(/\([^\)]*\)/g,'').replace(/[^ \w+]/g, ''); //remove all non alphanumeric values
    //now all the junk has been filtered out --> time for recognition
    //challenging that recognizing SAT I is not the same as SAT II but also recognizing that ACT superscore is the same as ACT breakdown
    if (isSimilar(actual, expected)) {
      return true;
    }
  } else { //if it has the wrong placement
    return false;
  }
  

}

//console.log(recognizeHeader('Rank (percentile if rank is unavailable):', 'Weighted GPA:'));
function isSimilar(str1, str2) {
  if (str1 == str2) {
    return true;
  }
  if (str1.length > 2 && str2.length > 2) {
    if (str1.includes(str2) || str2.includes(str1)) {
      return true;
    //} else if (auxClean.find(str2, str1)) {
      //return true;
    }
  }
  return false;
}
function capFL(str) { //capitalize the first letter of a string
  return str.charAt(0).toUpperCase + str.slice(1).toLowerCase();
}