#!/bin/sh -e

# install required modules
npm install --only=dev --save
npm install --only=prod --save
#npm update --save

PATH=$PWD/node_modules/.bin:$PATH
export PATH

set -x

# htmlminify
htmlminify -o minified_.html uncompressed.html

# browserify
browserify main.js > bundled_.js

# minify using closure compiler api
curl -s \
    -d compilation_level=ADVANCED_OPTIMIZATIONS \
    -d output_format=text \
    -d output_info=compiled_code \
    -d charset=utf-8 \
    --data-urlencode 'js_code@-' \
    http://closure-compiler.appspot.com/compile < bundled_.js > minified_.js

# make installer html
node make-installer.js minified_.html minified_.js installer.html
