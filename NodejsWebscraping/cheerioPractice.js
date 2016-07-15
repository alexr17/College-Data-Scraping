var request = require("request"); //getting html
var cheerio = require("cheerio"); //parsing html
var fs = require("fs"); //file writing

//url
var url = "http://talk.collegeconfidential.com/carnegie-mellon-university/1840086-official-carnegie-mellon-class-of-2020-ed-results.html"

//other files
var tools = require('./PropFunc');
var dataEdit = require('./DataEdit.js');
var cleaner = require('./Cleaner.js');

var lineSplit = '<br>';
var nada = 'N/A';

//this parses all the messages given
function parse(messages, commentOutline) {
	//now messages has all the data from the forum of the given url	
	//now time to parse it	
	var tempArrayOfVals = []; //this is the temporary array created by breaking up a message by the text it possess (<br>)	

	var dataSet = [];

	for (message of messages) {
		tempArrayOfVals = message.split(lineSplit); //split the text into an array based on the breaks		

		if (tempArrayOfVals.length >= commentOutline.length-5) { //if someone actually used a template then there are a good amount of lines of typing that need to be sorted
			
			tempArrayOfVals = dataEdit.filter(tempArrayOfVals); //remove white space and non colon values
			dataEdit.format(tempArrayOfVals, commentOutline); //this will change infostring into the desired output
			//console.log(tempArrayOfVals.length);
			//console.log(commentOutline.length);
			//fs.appendFile('CollegeStatisticsData.csv',tempArrayOfVals.join() + '\n', function(err) {}); //add it to the file
			dataSet.push(tempArrayOfVals); //add this to the new dataSet to be formatted
		}
	}
	tools.printCategory("Decision:", commentOutline, dataSet);
	tools.printCategory("Objective:", commentOutline, dataSet);
	cleaner.clean(dataSet, commentOutline);
	tools.printCategory("Objective:", commentOutline, dataSet);
	
}

//this function takes one source and parses it
function requestFromURLs(source, messages, commentOutline) {
	request(source, function(error, response, html) {
		if (!error) {
			//once again load the html
			$ = cheerio.load(html, {
				ignoreWhitespace: true
			});
			
			//get the message text
			$('div.Message').each(function(index, elem) {
				messages.push($(this).html());
			});
			parse(messages, commentOutline);
		}
	});
}


//run the request
//console.log(tools.getDateTime());

request(url, function(error, response, html) {
	//console.log(tools.getDateTime());
	if (!error) {
		
		var messages = [];
		var urls = [];
		//load the cheerio object
		var $ = cheerio.load(html);
		
		//first thing to do is determine the number of pages to link to (there will be a max of 3 pages of info to scrape through and it'd be better to find those pages using cheerio than doing it manually
		// the urls are all p2, p3, p4 etc and if we put the first url in there then the rest will follow
	  $("[href^='http://talk.collegeconfidential.com/carnegie-mellon-university/1840086-official-carnegie-mellon-class-of-2020-ed-results-p']").each(function(index, elem) {
	    urls[index] = $(this).attr('href');
	  });
		//now the urls exist, but there are duplicates
		//filter the array removing all duplicates (copied from stack overflow) 
		uniqueURLArray = urls.filter(function(item, pos) {
    		return urls.indexOf(item) == pos;
		});	
		//get the text by getting each div.Message element
		$('div.Message').each(function(index, elem) {
  			messages[index] = $(this).html();
		});
		//edit and create the commentOutline
		var commentOutline = messages[0].split(lineSplit);
		commentOutline = dataEdit.editHeaders(commentOutline); //remove all unnecessary vals manually
		//fs.appendFile('CollegeStatisticsData.csv',commentOutline.join() + '\n', function(err) {});
		messages.splice(0,1); //remove 1 element from the 0th index

		//now messages has a list of all the text of each message from one page (~10 or so posts per page)
		//to add the things from other pages we must traverse the uniqueURLArray
		for (source of uniqueURLArray) {
			//now execute stuff
			//and put stuff from the urls into the file
			//console.log(tools.getDateTime());
			requestFromURLs(source, messages, commentOutline);
			//console.log(tools.getDateTime());
			messages = []; //make messages blank again for the other values that will come from any other urls
		}
	}
});
