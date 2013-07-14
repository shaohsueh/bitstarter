#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {

    if(infile) {
	var instr = infile.toString();
	if(fs.existsSync(instr))
	    return instr;
    }
    return '';
};

var cheerioHtmlFile = function(htmlfile) {

    return cheerio.load(fs.readFileSync(htmlfile));
};

var buildfn = function(checksfile) {

    var response = function(result, response) {

	if (result instanceof Error) {
	    console.error('Error: ' + util.format(response.message));
	} else {

	    $ = cheerio.load(response);
	    out = doCheck(checksfile);
	    var outJson = JSON.stringify(out, null, 4);
	    console.log(outJson);

	}
    };
    return response;
};

var checkHtmlFile = function(htmlfile, checksfile, htmlurl) {

    if(htmlfile && htmlfile !== '') {
	$ = cheerioHtmlFile(htmlfile);
	out = doCheck(checksfile);
	var outJson = JSON.stringify(out, null, 4);
	console.log(outJson);
    }
    else
    {
	var response = buildfn(checksfile);
	rest.get(htmlurl).on('complete', response);
    }

};
var loadChecks = function(checksfile) {

    return JSON.parse(fs.readFileSync(checksfile));
};

var doCheck = function(checksfile) {
    var checks = loadChecks(checksfile).sort();

    var out = {};
    for(var ii in checks) {
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {

    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
	.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
	.option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists))
	.option('-u, --url <html_url>', 'Url to index.html')
	.parse(process.argv);
    var checkJson = checkHtmlFile(program.file, program.checks, program.url);

} else {
    exports.checkHtmlFile = checkHtmlFile;
}
