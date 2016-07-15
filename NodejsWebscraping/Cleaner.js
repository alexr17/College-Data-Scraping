//this file cleans and tidys all the data
var nada = 'N/A';

module.exports = {
  //this function cleans up all the data making things like "3.87ish GPA" into just "3.87"
  clean: function(dataSet, categories) {
    var gpaIndex = find(categories, 'GPA');
    var actIndex = find(categories, 'ACT');
    var decIndex = find(categories, 'Decision');
    var objIndex = find(categories, 'Objective');
    var rankIndex = find(categories, 'Rank');
    var decisions = ["Accepted","Waitlisted","Deferred","Rejected"];
    var schools = ["College of Engineering", "Carnegie Institute of Technology", "College of Fine Arts", "Dietrich College of Humanities and Social Sciences", "Heinz College: Information Systems, Public Policy and Management", "Mellon College of Science", "School of Computer Science", "Tepper School of Business"];

    for (var kk = 0; kk < dataSet.length; kk++) {
      //GPA
      if (gpaIndex != -1) {
        dataSet[kk][gpaIndex] = editNumber(dataSet[kk][gpaIndex], 4, 4.0); // 4.0 max value 4 digits (including the decimal)
      }

      //ACT
      if (actIndex != -1) {
        dataSet[kk][actIndex] = editNumber(dataSet[kk][actIndex], 2, 36); //36 max score 2 digits
      }

      //decision and specific college
      if (decIndex != -1 && objIndex != -1) {
        var dec = editText(dataSet[kk][decIndex], decisions); //get the decision
        var otherText = dataSet[kk][decIndex].replace(dec, ""); //remove it from the text
        dataSet[kk][objIndex] = getSchool(otherText, dataSet[kk][objIndex], schools); //get the school
        dataSet[kk][decIndex] = dec; //assign the decision
      }

      //ranking
      if (rankIndex != -1) {
        var rank = dataSet[kk][rankIndex].replace(/[^/%. 0-9]/g, ''); //remove all non numbers, keeping ".","/", and "%"
        
        var tempRank = 0;
        for (token of rank.split(' ')) {
          if (token.match(/[0-9]/g) != null && token.includes('/')) { //if it has numbers and a slash
            tempRank = (eval(token) * 100).toFixed(1);
          }
          if (token.includes('%') && !tempRank) { //if a percent is involved and tempRank hasn't been assigned yet
            tempRank = parseFloat(token); //get the num value of the rank since it's a percent
          }
        }
        if (!tempRank) {
          dataSet[kk][rankIndex] = nada;
          console.log('nada')
        } else {
          dataSet[kk][rankIndex] = tempRank;
          console.log('not nada');
        }
        //console.log(dataSet[kk][rankIndex]);
      }

    }
    return dataSet;
  }
};

//this function finds a keyword in a given array and returns the index
function find(array, keyword) {
  //console.log(array);
  //console.log(keyword);
  for (var zz = 0; zz < array.length; zz++) {
    if (array[zz].includes(keyword) || keyword.includes(array[zz])) {
      return zz;
    }
  }
  //console.log("bummer");
  return -1;
}

//this function takes a string that should be a number, the expected length of the number and the maximum number that number should be, and formats it appropriately
function editNumber(num, numLength, maxVal) {
  if ((num) <= maxVal && num.length <= numLength) { //if it's all normal
    return num;
  }

  //if it's not
  num = num.replace(/[^\d.-]/g, ''); //remove all non numeric characters but keep the dot
  if (num.length > numLength) {//if there are too many numbers 

    if (num.slice(0,numLength) <= maxVal) { //if the first few characters are correct but theres some baggage in there
       return num.slice(0,numLength);
    } else {
      //debug time and manual correction stuff yay
      console.log("error with num");
    }
  }
  else if (num == '' || num > maxVal) {//person didn't provide their gpa
    num = nada;
  }
  return num;
}

//this finds one of "options" in the text
function editText(text, options) {
  var index = find(options, text);
  if (index != -1) { //if one of the options is somewhere in the text
    return options[index];
  } else {
    return nada;
  }
}

//this functions takes the text from the decision, the text from the objective piece and the schools list and determines what school the student applied to
function getSchool(otherText, objText, schools) {
  var text = (otherText + " " + objText).split(' '); //split the text based on the spaces so CIT ECE => ["CIT", "ECE"]
  var mostMatches = 0;
  var bestIndex = -1;

  for (var xx = 0; xx < schools.length; xx++) {
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