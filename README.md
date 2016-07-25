# quick-web-notepad
Simple notepad script for modern web browsers

## Features

- encry - encrypt text, using aes-256, ctr, salt from `new Date()`
- decry - decrypt text encrypted using `encry`
- b64enc - encode edit box content as base64, and replace with it
- b64dec - decode edit box content from base64
- urlenc - replace edit box content with encodeURI(...)
- urldec - replace edit box content with decodeURI(...)
- self - insert page html source into the edit box. ( including edit box content it self )
- wrap - toggle long text line wrap mode between 'normal' and 'break-all'

## Make a Bookmarklet

1. Open "copy-this-to-your-bookmark-bar.txt" and copy the contents to clipboard
2. Create a bookmark for current page.
3. Edit the new bookmark and then paste clipboard into the url field.

You can easily get the html code for the page (`self` button),
and then encode it base64 (`b64enc` button),
and then prepend 'data:text/html;base64,' to make new bookmarklet for your edited html source.

Click the new created bookmark to open a simple notepad, without requesting any Internet connection.

## Test

If you want to test html from github source directly, click [here](https://rawgit.com/rhee/quick-web-notepad/master/uncompressed.html)

# Note

[D2Coding font](http://dev.naver.com/projects/d2coding/) is recommended.
