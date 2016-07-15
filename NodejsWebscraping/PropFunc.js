/*
This function contains all the proprietary functions that don't need any modification and are not essential to the development of the web app
*/

module.exports = {
  //this is for testing purposes only to compare times for certain things
   getDateTime: function() {

      var date = new Date();

      var hour = date.getHours();
      hour = (hour < 10 ? "0" : "") + hour;

      var min  = date.getMinutes();
      min = (min < 10 ? "0" : "") + min;

      var sec  = date.getSeconds();
      sec = (sec < 10 ? "0" : "") + sec;

      var year = date.getFullYear();

      var month = date.getMonth() + 1;
      month = (month < 10 ? "0" : "") + month;

      var day  = date.getDate();
      day = (day < 10 ? "0" : "") + day;

      return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;
  },

  //this prints a category
  printCategory: function(name, categories, data) {
    var index = categories.indexOf(name);
    var newData = [];
    if (index != -1) {
      for (var ll = 0; ll < data.length; ll++) {
        newData.push(data[ll][index]);
      }
      console.log(newData);
    }
  }
};