//this file contains all the data editing functions
var fs = require('fs')
var sep = ':';
var nada = '';
var auxClean = require('./AuxiliaryCleaners.js');
var cleaner = require('./Cleaner.js');

module.exports = {
  
  //this is a filter function; it means its sorting through hundreds of lines to make sure the data is sound - where all the filtering and editing happens
  //this filters out all the spaces and non colon values and other stuff... no formatting occurs just editing
  filter: function(array) {
    array = array.filter(function(str) {
      return /\S/.test(str);
    }); //copied from stack overflow to remove whitespace
    var top = array[0];
    array = array.filter(function(str) { //remove non colon values --needs improvement
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
      
      if (array[ii].includes(',')) { //if there a commas put delimiters
        array[ii] = array[ii].slice(0, array[ii].indexOf(sep)+1) + "\"" + array[ii].slice(array[ii].indexOf(sep)+1) + "\""; //here i'm putting quotes between any strings that have commas: such as Activites:"Soccer, Math club, Student Government"
      }
      
    }
    //console.log(array)
    return array;

  },

  //this function takes a line and formats it based on the constraints in messages[0]
  //if the text in the line before the colon is matched to a header, then validate that string by returning everything after the colon
  //it lines up the data to make a smooth read
  format: function(college, lines) {
    try {
      var headers = ['Decision','SAT','ACT','GPA','Rank'];
      var allStats = [];
      lines = module.exports.filter(lines)
      //console.log(lines)
      for (line of lines) {
        compare(line, headers, allStats);
        //console.log(line)
        //console.log(headers)
        //console.log(allStats)
      }
      //console.log(allStats.length)
      if (allStats.length > 0) {
        if (allStats.length < 5) {
          allStats[5] = '';
        }
        var decisions = ['Accepted','Deferred','Waitlisted','Rejected']
        if (allStats[0] == null && auxClean.find(decisions, lines[0]) != -1) {
          console.log('people are dumb')
          allStats[0] = decisions[auxClean.find(decisions, lines[0])];
        }
        //console.log(allStats[0])
        //console.log(lines[0])
        allStats = cleaner.clean(allStats, ['Decision','SAT','ACT','GPA','Rank']);
        //console.log(lines);
        //console.log(allStats);
        if (allStats[0] != null && allStats[0].length > 7) {//if there's a decision
        fs.appendFile('CollegeStatisticsData.csv', college + ', ' + allStats.join() + '\n', function(){});
          //now we have the comments
        }
      }
    } catch (err) {
      console.log(err.message)
    }
  },

};

//this takes an expected header and an actual header and determines if they are similar enough to each other
//it basically removes all the non alphanumeric values and replaces them with spaces, converting these words into arrays, searching for matches
//if at least 20% of the words match, then i return true
function recognizeHeader(headers, actual, index) {
  if (headers.indexOf(auxClean.capFL(actual)) == -1) { //if it doesn't exist
    actual = actual.replace(/\([^\)]*\)/g,'').replace(/[^ \w+]/g, ''); //remove all non alphanumeric values
    //now all the junk has been filtered out --> time for recognition
    //challenging that recognizing SAT I is not the same as SAT II but also recognizing that ACT superscore is the same as ACT breakdown
    for (var header of headers) {
      if (isSimilar(actual, header.replace(/\([^\)]*\)/g,'').replace(/[^ \w+]/g, ''))) {
        return headers.indexOf(auxClean.capFL(header));
      }
    }
    return -1;
  } else if (index < 2) { //if it's subjective or objective 
    return index;
  } else {//return its index
    return headers.indexOf(auxClean.capFL(actual));
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

function compare(line, headers, stats) {
  if (auxClean.find(headers, line) != -1) {
    var index = auxClean.find(headers, line)
    if (line.includes(':')) {
      line = line.slice(line.indexOf(':')+1);
    }
    if (line.length > 1) {

      stats[index] = line.trim();
      headers[index] = null;
    }
  } else {

  }

}