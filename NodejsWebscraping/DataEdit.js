//this file contains all the data editing functions

var sep = ':';
var lineSplit = '<br>';
var nada = 'N/A';

module.exports = {
  //this function just edits the headers to format them the way we want
  editHeaders: function(commentOutline) {
    commentOutline = module.exports.filter(commentOutline); //remove non colon values and whitespace
    commentOutline[0] = ('Decision:'); //add the decision marker to the beginning of the line
    commentOutline.splice(commentOutline.indexOf('[size=+2]Decision: Rejected[/size]'), 1); //remove this one
    commentOutline.splice(commentOutline.indexOf('[size=+2]Decision: Waitlisted[/size]'), 1); //remove this one
    commentOutline.pop(); //remove "generalcomments[noparse]"
    commentOutline.push('General Comments:');
    return commentOutline;
  },
  //this function takes a line and formats it based on the constraints in messages[0]
  //if the text in the line before the colon is matched to a header, then validate that string by returning everything after the colon
  //it lines up the data to make a smooth read
  format: function(lines, headers) {
    for (var ii = 0; ii < headers.length; ii++) { //filter through the headers
      if (lines[ii] != null && lines[ii].includes(headers[ii])) { //if the next line isn't null and has the expected header within it
        lines[ii] = lines[ii].replace(headers[ii], ""); //remove the header part
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
            if ("write error to console") {
              console.log("In the message where the user had these comments: " + lines[lines.length-1]);
              console.log("There was an error on line: " + ii);
              console.log("The header should've been: " + headers[ii]);
              console.log("But it was: " + lines[ii]);
              console.log("And it was meant to be higher up the ladder at: " + index)
              console.log("^^^^^^^^");
            }
          }
        } else { //if it doesn't exist
          if((lines[ii+1] != null && lines[ii+1].includes(headers[ii+1])) || (lines[ii+2] != null && lines[ii+2].includes(headers[ii+2]))) {//someone used the wrong header name but the next one is the correct one or the one after that is correct
            lines[ii] = lines[ii].slice(lines[ii].indexOf(sep)+1);
            //console.log("Replacing");
          } else {
            lines.splice(ii, 1);
            ii--;
            //console.log("Removing");
          }
        }
      }
    }
  },
  //this is a filter function; it means its sorting through hundreds of lines to make sure the data is sound - where all the filtering and editing happens
  //this filters out all the spaces and non colon values and other stuff... no formatting occurs just editing
  filter: function(array) {
    var removeFromHeader = ['[size=+2]','[/size]'];
    array = array.filter(function(str) {
      return /\S/.test(str);
    }); //copied from stack overflow to remove whitespace
    array = array.filter(function(str) {
        return /.:/.test(str);
    }); //remove non colon values
    for (var ii = 0; ii < array.length; ii++) {//this is for sorting through the data and making mass changes where necessary
      array[ii] = array[ii].trim();/*replace(/\r?\n|\r/g, "");*/ //remove newLine characters
      if (array[0] != '[size=+2]Decision: Accepted[/size]' && array[ii].slice(array[ii].indexOf(sep)+1) == '') {// don't edit if it's the headers
        array[ii] = array[ii] + nada;
      }
      if (array[ii].includes(',')) { //if there a commas put delimiters
        array[ii] = array[ii].slice(0, array[ii].indexOf(sep)+1) + "\"" + array[ii].slice(array[ii].indexOf(sep)+1) + "\""; //here i'm putting quotes between any strings that have commas: such as Activites:"Soccer, Math club, Student Government"
      }
      array[ii] = array[ii].replace(/<(?:.|\n)*?>/gm, ''); //strip any html
    }
    for (remove of removeFromHeader) { //remove a custom set text from the headers
      array[0] = array[0].replace(remove, '');
    }
    return array;
  }
};