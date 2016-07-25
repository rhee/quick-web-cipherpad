#!/bin/sh -e

# install required modules
npm install
#npm update --save

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
node make-installer.js html-template.html minified_.js installer.html
