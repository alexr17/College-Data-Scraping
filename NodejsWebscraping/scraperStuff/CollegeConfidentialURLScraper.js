//This file will go through and pull several hundreds of URLs from College Confidential with the goal of compiling all the related URLs corresponding to results from colleges
//var urlStruct = "http://talk.collegeconfidential.com/search?Page=p" + pageNum + "&adv=1&search=&title=results&author=&cat=" + collegeNum + "&tags=&discussion_d=1&within=1+day&date=";



var request = require("request"); //getting html
var cheerio = require("cheerio"); //parsing html
var async = require("async");
var auxClean = require("./AuxiliaryCleaners.js");

//23-52 --ivy league & top universities (note that there are some blanks in here)
var urls = [];
var keywords = ["early decision", "early action", "regular decision"];
var inc = 2;
var links = [];

for (var ii = 23; ii <= 52; ii++ ) {
  urls.push("http://talk.collegeconfidential.com/search?Page=p1&adv=1&search=&title=results&author=&cat=" + ii + "&tags=&discussion_d=1&within=1+day&date=");
}

function runRequest(url, cb) {
  request(url, function(error, response, html) {
    if (!error) {
      //load the cheerio object
      var $ = cheerio.load(html);

      //parsing time
      if ($('div.Column.ContentColumn').has('p').length != 0) { //if it doesn't have any more results
        //console.log("has p");
        cb(null, null);
      } else {

          $('li.Item.Item-Search').each(function(index, element) { //go through each link
            var title = $(this).children('h3').text();
            if (title.search(/(20)[012]\d/g) != -1) { //number between 2000 and 2029
              title = title.toLowerCase();
              if ((title.match(/^\*|\*$/g) != null && title.match(/^\*|\*$/g).length > 1) || auxClean.find(keywords, title) || auxClean.find(title.split(' '),'rd ea ed')) { //this conditional is confusing so i've chunked it -- the first deals with stars; if there is a star at both the front and back then it's obviously official -- the second deals with finding at least one of the keywords in the array -- the third deals with abbreviations (finding an ea, ed, or rd)
                //console.log(title + " is good $$$$$$$$$");
                links.push($(this).find('a').attr('href'));
              } else {
              //console.log(title);
              }
            } else {
              //console.log(title);
            }
            //console.log($(this).find('a').attr('href'));
          });
        cb(null, url);
        //console.log("nope");
      }
    }
  });
}

function callBack(err, results) {
  urls = results
  urls = urls.filter(function(url){return url != null;});
  for (var jj = 0; jj < urls.length; jj++) { //increment pages
    urls[jj] = urls[jj].replace('Page=p' + (inc-1), 'Page=p' + inc);
  }
  inc++;
  //console.log(urls);
  if (urls.length != 0) { //until there are no more urls to go through
    async.map(urls, runRequest, callBack);
  } else {
    console.log(links);
  }
}

async.map(urls, runRequest, callBack);
