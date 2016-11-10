//this file contains all the helper methods for the cleaner file
var nada = '';

module.exports = {
  //this array takes several data values and basically determines if a given "adjacent" corresponds to a section such as critical reading or math.  if does correspond then modifies the data accordingly
 
  modSatArray: function(words, word, scores, adjacent, sections, numIndex, incrementer) {
    //console.log("adjacent: " + adjacent);
    var index = sections.map(function(elem){ return elem.replace(/[^A-Z]/g, ''); }).indexOf(adjacent.toUpperCase()); //get the index which is most likely -1
    if (index == -1) {
      index  = sections.indexOf(adjacent.charAt(0).toUpperCase() + adjacent.slice(1));
    }
    if (index != -1) {//if the prev word is in the sections as an acronym (M, CR, W) or the actual word exists
      //console.log("index in scores: " + index);
      scores[index] = word; //assign the index to its respective score
      //console.log("scores: " + scores);
      //console.log("removing: " + (words[numIndex+incrementer]));
      words.splice(numIndex+incrementer,1); //remove the word before it because that word represents some section
      
      return true;
    }
    return false;
  },
  //this function finds a keyword in a given array and returns the index
  find: function(array, keyword) {
    //console.log(array);
    //console.log(keyword);
    for (var zz = 0; zz < array.length; zz++) {
      if (array[zz] != null && (array[zz].includes(keyword) || keyword.includes(array[zz]))) {
        return zz;
      }
    }
    //console.log("bummer");
    return -1;
  },
  //this finds one of "options" in the text
  editText: function(text, options) {
    var index = module.exports.find(options, text);
    if (index != -1) { //if one of the options is somewhere in the text
      return options[index];
    } else {
      return nada;
    }
  },

  capFL: function(str) { //capitalize the first letter of a string
  return str.charAt(0).toUpperCase + str.slice(1).toLowerCase();
  }
};