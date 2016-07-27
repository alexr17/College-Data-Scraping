var request = require("request"); //getting html
var cheerio = require("cheerio"); //parsing html
var fs = require("fs"); //file writing

//url
var url = "http://talk.collegeconfidential.com/carnegie-mellon-university/1431553-official-carnegie-mellon-2017-results-thread.html";
var url2 = "http://talk.collegeconfidential.com/carnegie-mellon-university/1431553-official-carnegie-mellon-2017-results-thread-p";
//other files
var tools = require('./PropFunc');
var dataEdit = require('./DataEdit.js');
var cleaner = require('./Cleaner.js');

var lineSplit = ['<li>','<br>']; //always test for lists first because breaks usually come inside a list because people put multiple things inside their lists
var nada = ' N/A';

//this parses all the messages given
function parse(messages, commentOutline) {
	//now messages has all the data from the forum of the given url	
	//now time to parse it	
	var tempArrayOfVals = []; //this is the temporary array created by breaking up a message by the text it possess (<br>)	

	var dataSet = [];
	//console.log(commentOutline);
	var splitter = '';

	for (var message of messages) {
		if (message.split('<li>').length > 15) {
			splitter = '<li>';
		}
		else if (message.split('<br>').length > 15) {
			splitter = '<br>';
		}
		//console.log("message: " + message)
		if (splitter) {
			//console.log("splitter: " + splitter);
			tempArrayOfVals = message.split(splitter); //split the text into an array based on the breaks
			//console.log("------------------");

			console.log("before: ");

			tempArrayOfVals = dataEdit.filter(tempArrayOfVals); //remove white space and non colon values
			console.log(tempArrayOfVals);

			dataEdit.format(tempArrayOfVals, commentOutline); //this will change infostring into the desired output
			dataSet.push(tempArrayOfVals); //add this to the new dataSet to be formatted
			

			console.log("after: ");
			console.log(tempArrayOfVals);
			//console.log(tempArrayOfVals.length);
		}
		splitter = '';
	}
	//cleaner.clean(dataSet, commentOutline);
	//tools.printCategory("Objective:", commentOutline, dataSet);
	//tools.printCategory("SAT I (breakdown):", commentOutline, dataSet);
	//tools.printCategory("Rank (percentile if rank is unavailable):", commentOutline, dataSet);
	//tools.printCategory("Unweighted GPA (out of 4.0):", commentOutline, dataSet);
	//fs.appendFile('CollegeStatisticsData.csv',commentOutline.join() + '\n', function(err) {}); //add it to the file
	//tools.outputData(dataSet, commentOutline, )
	for (data of dataSet) {
		//fs.appendFile('CollegeStatisticsData.csv',data.join() + '\n', function(err) {});
	}
	//}
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
	  $("[href^='" + url2 + "']").each(function(index, elem) {
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
		var commentOutline = messages[0].split('<br>');
		commentOutline = dataEdit.editHeaders(commentOutline); //remove all unnecessary vals manually
		//fs.appendFile('CollegeStatisticsData.csv',commentOutline.join() + '\n', function(err) {});
		//messages.splice(0,1); //remove 1 element from the 0th index

		//now messages has a list of all the text of each message from one page (~10 or so posts per page)
		//to add the things from other pages we must traverse the uniqueURLArray
		for (var source of uniqueURLArray) {
			//now execute stuff
			//and put stuff from the urls into the file
			//console.log(tools.getDateTime());
			requestFromURLs(source, messages, commentOutline);
			//console.log(tools.getDateTime());
			messages = []; //make messages blank again for the other values that will come from any other urls

		}
	}
});
