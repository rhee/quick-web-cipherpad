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

1. Open `install.html` using your favorite browser.
    - drag install.html to your browser if your desktop environment support file drag
    - type `file://<absolute-path-to install.html>` in your browser's url bar
2. Find link named `memo` and drag that link to your browser's bookmark bar 

Click the new created bookmark to open a simple notepad, without requesting any Internet connection.

## Test

If you want to test html from github source directly, open  [this link](https://raw.githubusercontent.com/rhee/quick-web-cipherpad/master/installer.html) and then drag the link
to your bookmark bar

# Note

[D2Coding font](http://dev.naver.com/projects/d2coding/) is recommended.
