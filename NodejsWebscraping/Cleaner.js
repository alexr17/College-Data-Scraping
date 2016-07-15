//this file cleans and tidys all the data
var nada = 'N/A';

module.exports = {
  //this function cleans up all the data making things like "3.87ish GPA" into just "3.87"
  clean: function(dataSet, categories) {
    var gpaIndex = find(categories, 'GPA');
    var actIndex = find(categories, 'ACT');
    var decIndex = find(categories, 'Decision');
    var objIndex = find(categories, 'Objective');
    var decisions = ["Accepted","Waitlisted","Deferred","Rejected"];
    var schools = ["College of Engineering", "Carnegie Institute of Technology", "College of Fine Arts", "Dietrich College of Humanities and Social Sciences", "Heinz College: Information Systems, Public Policy and Management", "Mellon College of Science", "School of Computer Science", "Tepper School of Business"];

    for (var kk = 0; kk < dataSet.length; kk++) {
      //GPA
      if (gpaIndex != -1) {
        dataSet[kk][gpaIndex] = editNumber(dataSet[kk][gpaIndex], 4, 4.0);
      }

      //ACT
      if (actIndex != -1) {
        dataSet[kk][actIndex] = editNumber(dataSet[kk][actIndex], 2, 36);
      }

      if (decIndex != -1 && objIndex != -1) {
        var dec = editText(dataSet[kk][decIndex], decisions); //get the decision
        var otherText = dataSet[kk][decIndex].replace(dec, ""); //remove it from the text
        dataSet[kk][objIndex] = getSchool(otherText, dataSet[kk][objIndex], schools); //get the school
        dataSet[kk][decIndex] = dec; //assign the decision
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
  else if (num == '') {//person didn't provide their gpa
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