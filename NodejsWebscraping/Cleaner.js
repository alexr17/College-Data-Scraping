//this file cleans and tidys all the data
var nada = ' N/A';
var auxClean = require("./AuxiliaryCleaners.js");

module.exports = {
  //this function cleans up all the data making things like "3.87ish GPA" into just "3.87"
  clean: function(dataSet, categories) {
    var gpaIndex = auxClean.find(categories, 'GPA');
    var actIndex = auxClean.find(categories, 'ACT');
    var decIndex = auxClean.find(categories, 'Decision');
    var objIndex = auxClean.find(categories, 'Objective');
    var rankIndex = auxClean.find(categories, 'Rank');
    var satIndex = auxClean.find(categories, 'SAT');
    var decisions = ["Accepted","Waitlisted","Deferred","Rejected"];
    var schools = ["College of Engineering", "Carnegie Institute of Technology", "College of Fine Arts", "Dietrich College of Humanities and Social Sciences", "\"Heinz College: Information Systems, Public Policy and Management\"", "Mellon College of Science", "School of Computer Science", "Tepper School of Business"];

    for (var kk = 0; kk < dataSet.length; kk++) {
      //GPA
      if (gpaIndex != -1) {
        dataSet[kk][gpaIndex] = getNumber(dataSet[kk][gpaIndex], 4, 4.0); // 4.0 max value 4 digits (including the decimal)
      }

      //ACT
      if (actIndex != -1) {
        dataSet[kk][actIndex] = getNumber(dataSet[kk][actIndex], 2, 36); //36 max score 2 digits
      }

      //decision and specific college
      if (decIndex != -1 && objIndex != -1) {
        var dec = auxClean.editText(dataSet[kk][decIndex], decisions); //get the decision
        var otherText = dataSet[kk][decIndex].replace(dec, ""); //remove it from the text
        dataSet[kk][objIndex] = getSchool(otherText, dataSet[kk][objIndex], schools); //get the school
        dataSet[kk][decIndex] = dec; //assign the decision
      }

      //ranking
      if (rankIndex != -1) {
        dataSet[kk][rankIndex] = getRank(dataSet[kk][rankIndex].replace(/[^/% 0-9]/g, '')); //remove all non numbers, keeping ".","/", and "%"
      }

      //sat
      if (satIndex != -1) {
        var sat = getSATScore(dataSet[kk][satIndex]);
        //console.log("SAT: " + sat);
        dataSet[kk][satIndex] = "\"" + sat.join() + "\""; //for csv stuff
      }
    }
    return dataSet;
  }
};

//this function takes the sat text and returns the values of each section on the sat as a nicely formatted string
function getSATScore(text) {
  var sections = ['Critical Reading','Math','Writing'];
  var scores = [0,0,0];
  var unassigned = [];
  var assigned = false;
  var total = 0;
  var words = text.replace(/\d+/g, function(match) { //put spaces between the numbers
    return ' ' + match + ' ';
  });
  words = words.replace(/\w+/g, function(match) { //put spaces between any alphanumeric words
    return ' ' + match + ' ';
  });
  words = words.trim().split(/\s+/g); //get the words of the sat text (split by whitespace)
  
  //console.log("array: " + words);
  var numIndex  = -1;
  for (var word of words) { //traverse through the words
    if (!isNaN(word) && word <= 800) { //if it's a number less than 800
      //console.log("word: " + word);
      numIndex = words.indexOf(word) //get the index associated with it
      //console.log("index: " + numIndex);
      if (numIndex != 0) { //if the index isn't zero (for the prev val)
        //console.log("prev");
        var prev = words[numIndex-1]; //get the value of the prev word
        assigned = auxClean.modSatArray(words, word, scores, prev, sections, numIndex, -1);
      }
      if (numIndex < words.length-1 && !assigned) { //if the index isn't at the end and it hasn't already been assigned
        //console.log("next");
        var next = words[numIndex+1]; //get the value of the next word
        assigned = auxClean.modSatArray(words, word, scores, next, sections, numIndex, +1);
      }
      if (!assigned) { //if there were no modifying words found
        unassigned.push(word); //add the number to the array
      }
    } else if (word <= 2400) { //if it's a total score
      total = word;
    }
    assigned = false;
  }
  //if there were unassigned things
  for (var aa = 0; aa < unassigned.length; aa++) {
    if (scores.indexOf(0) != -1) {
      scores[scores.indexOf(0)] = unassigned[aa];
    }
  }
  return scores;
}



function getRank(rank) {
  var tempRank = 0;
  for (token of rank.split(' ')) {
    if (token.match(/[0-9]+/g)  != null && token.match(/[0-9]+/g).length > 1 && token.includes('/')) { //if it has numbers and a slash
      tempRank = (eval(token) * 100).toFixed(1);
    }
    if (token.includes('%') && !tempRank) { //if a percent is involved and tempRank hasn't been assigned yet
      tempRank = parseFloat(token); //get the num value of the rank since it's a percent
    }
  }
  if (!tempRank) {
    return nada;
    //console.log('nada')
  } else {
    return tempRank;
    //console.log('not nada');
  }
  //console.log(dataSet[kk][rankIndex]);

}



//this function takes a string that should be a number, the expected length of the number and the maximum number that number should be, and formats it appropriately
function getNumber(num, numLength, maxVal) {
  if ((num) <= maxVal && num.length <= numLength) { //if it's all normal
    return num;
  }

  //if it's not
  num = num.replace(/[^\d.]/g, ' ').trim(); //remove all non numeric characters but keep the dot
  if (num.length > numLength) {//if there are too many numbers 

    if (num.slice(0,numLength) <= maxVal) { //if the first few characters are correct but theres some baggage in there
       return num.slice(0,numLength);
    } else {
      //debug time and manual correction stuff yay
      console.log("error with num");
      console.log("The number line is: " + num + ".  The length should be: " + numLength + ".  The max value should be: " + maxVal);
      return nada;
    }
  }
  else if (num == '' || num > maxVal) {//person didn't provide their gpa
    return nada
  }
  return num;
}

//console.log(getNumber(" 33 (31 En, 33 Ma, 33 Sci, 36 Rd, 29 Wr)", 2, 36));

//this functions takes the text from the decision, the text from the objective piece and the schools list and determines what school the student applied to
function getSchool(otherText, objText, schools) {
  var text = (otherText + " " + objText).replace(/[^\w]+/g, ' ').split(/\s+/g); //split the text based on the spaces so CIT ECE => ["CIT", "ECE"]
  var mostMatches = 0;
  var bestIndex = -1;
  //console.log(text);
  //console.log(text.map(function(x) {return x.toUpperCase();}));
  for (var xx = 0; xx < schools.length; xx++) {
    //console.log(schools[xx].replace(/[^A-Z]/g, ''));
    if (text.map(function(x) {return x.toUpperCase();}).indexOf(schools[xx].replace(/[^A-Z]/g, '')) != -1 || (otherText + " " + objText).includes(schools[xx])) { //if they abbreviated the college or if the college name is somewhere in the text
      return schools[xx];
    }
    else {//now onto the hard part, finding matches
      var matches = 0;
      
      for (var yy = 0; yy < text.length; yy++) {
        if (schools[xx].split(' ').indexOf(text[yy]) != -1) {//if a word from the user input matches a word from the colleges, then increment
          matches++;
        }
      }
      if (matches > mostMatches) {
        bestIndex = xx;
      }
    }
  }
  if (bestIndex != -1) {
    return schools[bestIndex];
  }
  return nada;
}

//console.log(getSchool("   Accepted- CFA: Architecture!  Objective:", "N/A",["College of Engineering", "Carnegie Institute of Technology", "College of Fine Arts", "Dietrich College of Humanities and Social Sciences", "\"Heinz College: Information Systems, Public Policy and Management\"", "Mellon College of Science", "School of Computer Science", "Tepper School of Business"]));