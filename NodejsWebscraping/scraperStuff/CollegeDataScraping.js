var http = require("http"); //getting html
var cheerio = require("cheerio"); //parsing html
var fs = require("fs"); //file writing

//other files
var tools = require('./PropFunc');
var dataEdit = require('./DataEdit.js');
var cleaner = require('./Cleaner.js');

var nada = '';

//this function takes one source and parses it
function getMessages(sources, messages, size) {
	if (sources.length > 0) {
		var source = sources.pop();

		var request = http.get(source, function(res) {
			var body = '';
			//console.log('message pages to get: ' + sources.length)
			res.on('error', function(err) {
				console.log(err);
			});

			res.on('data', function(chunk) {
				if (res.statusCode === 200) {
					body += chunk;
				}
			});
			res.on('end', function () {
				//once again load the html
				$ = cheerio.load(body, {
					ignoreWhitespace: true
				});
				
				//get the message text
				$('div.Message').each(function(index, elem) {
					//if the message has the desired length then put it into an array based on line breaks or list items and add it to the messages array
					var msg = $(this).html();
					var splitter = '';

					if (msg.split('<li>').length > 15) {
						splitter = '<li>';
					}
					else if (msg.split('<br>').length > 15) {
						splitter = '<br>';
					}
					if (splitter) {
						//console.log(msg.split(splitter));
						messages.push({lines: msg.split(splitter), college: source.replace(/(http:\/\/talk\.collegeconfidential\.com\/)|(\/.+)|/g,'').replace('-',' ')});
						dataEdit.format(messages[messages.length-1].college, messages[messages.length-1].lines);
					} else { //the message is too short

					}
				});

				console.log(messages.length + ' messages completed')
				
				setTimeout(getMessages(sources, messages, size), tools.randInt(0,100));	
			});
		});

		request.setTimeout(30000, function () {
			console.log('request timed out');
			//console.log(line);
			request.abort();
			//console.log(completed_requests);
		});

		request.on('error', function(e) {
			console.log('we got an error!');
			console.log(e.message);
			//console.log(line);
			completed_requests++;

		});
	}
}

//line reader works perfectly fine

//this takes all the urls and recursively gets the requests on them


function runRequest(lines) {
	if (continueRequesting && lines.length > 0) {
		var line = lines.pop()
		
		console.log('urls to get: ' + lines.length)
		var request =	http.get(line, function(res) {
			var body = '';

			res.on('error', function(err) {
				console.log('we got an error!')
				console.log(e.message);});

			res.on('data', function(chunk) {	body += chunk; });

			res.on('end', function() {
				uniqueURLArray.push(line);
				//load the cheerio object
				var $ = cheerio.load(body);
				//first thing to do is determine the number of pages to link to (there will be a max of 3 pages of info to scrape through and it'd be better to find those pages using cheerio than doing it manually
				// the urls are all p2, p3, p4 etc and if we put the first url in there then the rest will follow
			  var url = $('a.Next').prev().attr('href'); //the sibling of the next button (which is the last page of results)
			  
			  //console.log(url, line);
				if (url != null) {
					pgNum = url.replace('.html', '').slice(-2).replace(/[^\d]/g,''); //get the page number
					for (var ii = 2; ii <= pgNum; ii++) {
						uniqueURLArray.push(url.replace(/(-p(\d+)[.]html)/g, '-p' + ii + '.html'));
					}
				}

				//if the request timed out
				if (timeout) {
					timeout = false;
					console.log(completed_requests, line);
				}

				//once 5 requests are completed start parsing the data
				if (completed_requests++ == 5) {
		     	continueRequesting = true;
		      //now get the messages
		      console.log('num urls: ' + uniqueURLArray.length);
		      
		      var messages = [];


		      getMessages(uniqueURLArray, messages, uniqueURLArray.length);
		      //now the messages are all here
		      //time to filter  
				}

				setTimeout(runRequest(lines), tools.randInt(0,100)); //works with 500-1000
			});
		});

		//request stuff
		request.setTimeout(90000, function () {
			request.abort();
			console.log('request timed out');
			timeout = true;
		});
		request.on('error', function(e) {
			console.log(e);
			completed_requests++;
		});
	}
}


var lineReader = require('readline').createInterface({
  input: require('fs').createReadStream('CollegeURLs.txt')
});

var uniqueURLArray = [];
var urls = [];
var messages = [];
var completed_requests = 0;
var timeout = false;

lineReader.on('line', function (line) { //each line is a url
	urls.push(line);
});

var continueRequesting = true;
var numUrlsToPull = 415;

lineReader.on('close', function () {
	runRequest(urls);
});