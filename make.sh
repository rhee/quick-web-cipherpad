#!/bin/sh -e

# # install required modules
# npm install --save-dev --only=dev
# npm install --save --only=prod

PATH=$PWD/node_modules/.bin:$PATH
export PATH

set -x

# htmlminify
htmlminify uncompressed.html -o minified_.html

# minify using closure compiler api
# NOTE: js source order is obeyed
curl -s \
    -d compilation_level=ADVANCED_OPTIMIZATIONS \
    -d output_format=text \
    -d output_info=compiled_code \
    -d charset=utf-8 \
    --data-urlencode 'js_code@js-sha256.js' \
    --data-urlencode 'js_code@aes-js.js' \
    --data-urlencode 'js_code@main.js' \
    http://closure-compiler.appspot.com/compile > minified_.js

# make installer html
node make-installer.js minified_.html minified_.js installer.html
