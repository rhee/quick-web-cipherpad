#!/usr/bin/env node
//bin/true; exec node "$0" "$@"

// $1 = process.argv[2]
// console.error(process.argv);

if (process.argv.length < 3 || ! (process.arg[2] == '--base64' || process.argv[2] == '--urlencode')) {
    console.error('Usage: [node] make-data-uri (--base64|--urlencode) < input > output');
    process.exit(1);
}

var use_base64 = (process.argv[2] == '--base64'),
    btoa = use_base64 ? require('btoa') : null,
    chunk_list = [];

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(chunk) {
    chunk_list.push(chunk)
});

process.stdin.on('end', function() {
    var data = chunk_list.join(''),
	uri = use_base64 ? 'data:text/html;base64, ' + btoa(data) : 'data:text/html, ' + encodeURIComponent(data);
    process.stdout.write(uri);
});
