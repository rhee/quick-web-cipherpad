var fs = require('fs'),
    heredoc = require('kmkr-heredoc'),
    html_file = process.argv[2],
    script_file = process.argv[3],
    output_file = process.argv[4];

heredoc(function(){
    /*{{{

What is the maximum length of a URL in different browsers?

(1) If the long uri is only used for browser, and not used for
any web server outside:

http://stackoverflow.com/a/15090286/496899

I could not find any limits on Chrome and Safari. Both are based on WebKit
and it seems to have similar limits as Firefox has.
Firefox stops displaying after 64k characters,
but can serve more than 100k characters.

(2) If the long uri can be used with some http servers:

http://stackoverflow.com/a/417184/496899

Short answer - de facto limit of 2000 characters

If you keep URLs under 2000 characters, they'll work in virtually
any combination of client and server software.

    }}}*/
});

var installer_template = heredoc(function(){
    /*{{{
<body>
drag this to your bookmark toolbar ({{bytes}} bytes) =&gt; <a href="{{uri}}">memo</a>
</body>
    }}}*/
})

function make_installer(html) {
  var uri = 'data:text/html, '+
	  encodeURIComponent(html).replace(/%2C/g, ',').replace(/%20/, '+'),
      bytes = uri.length,
      html = installer_template.replace(/{{bytes}}/, ''+bytes).replace(/{{uri}}/, uri);
  return html;
}

function make_html(html_template, script) {
    return html_template.replace(/{{script}}/, script)
}

fs.readFile(html_file, 'utf8', function (err, data) {
    if (err) return console.error(err);
    var html_template = data;
    fs.readFile(script_file, 'utf8', function (err, data) {
	if (err) return console.error(err);
	var script = data;
	var html = make_html(html_template, script);
	var installer_html = make_installer(html);
        fs.writeFile(output_file, installer_html, function (err,data) {
	    if (err) return console.error(err);
        })
    });
});