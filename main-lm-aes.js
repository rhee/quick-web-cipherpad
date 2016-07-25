document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    /** @constant */
    var debug = true;

    var sha256 = require('js-sha256').sha256;
    /*
     * Note:
     * - replaced heredoc() with plane string,
     *   since closure-compile moves comments with @preserve
     *   to the top of the main.js script,
     *   and make heredoc() unusable
     */
    //var heredoc = require('kmkr-heredoc');

    function fil(f) {
        return function () {
            this.innerText = f(this.innerText);
        }
    }

    var prompt_password = require('./prompt_password.js');

    //     var aesjs = require('aes-js');
    // 
    // function int32_to_array(n) {
    //     // NOTE: Uint8Array().concat() is not a method
    //     return [n >> 24 & 0xff,
    // 	n >> 16 & 0xff,
    // 	n >> 8 & 0xff,
    // 	n & 0xff
    //     ];
    // }
    // 
    // function array_to_int32(b) {
    //     return b[0] * 256 * 256 * 256 +
    // 	b[1] * 256 * 256 +
    // 	b[2] * 256 +
    // 	b[3];
    // }
    // 
    //     function password_to_key(key_text, salt) {
    //         //return aesjs.util.convertStringToBytes(pbkdf2.pbkdf2Sync(key_text, 'qwnpot', 5, 16, 'sha512'));
    //         salt = salt || new Date() & 0xffffffff;
    //         return [salt, aesjs.util.convertStringToBytes(sha256(key_text + salt).substring(0, 16))];
    //     }
    // 
    //     function encrypt() {
    //         var
    //             elem = this,
    //             txt = elem.textContent,
    //             inputBytes,
    //             pass,
    //             key_hint,
    //             ctr,
    //             aesCtr,
    //             encryptedBytes;
    // 
    //         if (!txt) {
    //             console.warn('encrypt: no txt');
    //             return;
    //         }
    // 
    //         inputBytes = aesjs.util.convertStringToBytes(txt);
    // 
    //         prompt_password('Enter key:', 'key text here', function (pass) {
    // 
    //             if (!pass) {
    //                 console.warn('encrypt: no password');
    //                 return;
    //             }
    // 
    //             key_hint = password_to_key(pass, 0);
    //             ctr = key_hint[0];
    //             aesCtr = new aesjs.ModeOfOperation.ctr(key_hint[1], new aesjs.Counter(ctr));
    //             encryptedBytes = Buffer.concat([int32_to_array(ctr), aesCtr.encrypt(inputBytes)]);
    // 
    //             if (debug) {
    //                 console.log('encrypt: ');
    //                 console.log('    inputBytes: ', inputBytes);
    //                 console.log('           ctr: ', ctr, int32_to_array(ctr));
    //                 console.log('           key: ', key_hint[1]);
    //                 console.log('         bytes: ', encryptedBytes);
    //             }
    // 
    //             elem.textContent = aesjs.util.convertBytesToString(encryptedBytes, 'hex')
    // 
    //         });
    // 
    //     }
    // 
    //     function decrypt() {
    //         var
    //             elem = this,
    //             txt = elem.textContent,
    //             inputBytes,
    //             ctr,
    //             pass,
    //             key_hint,
    //             aesCtr,
    //             decryptedBytes;
    // 
    //         if (!txt) {
    //             console.warn('decrypt: no txt');
    //             return;
    //         }
    // 
    //         inputBytes = aesjs.util.convertStringToBytes(txt, 'hex');
    //         if (!inputBytes) {
    //             console.warn('decrypt: input is not hex');
    //             return;
    //         }
    // 
    //         ctr = array_to_int32(inputBytes.slice(0, 4));
    // 
    //         prompt_password('Enter key:', 'key text here', function (pass) {
    // 
    //             if (!pass) {
    //                 console.warn('decrypt: no password');
    //                 return;
    //             }
    // 
    //             key_hint = password_to_key(pass, ctr);
    //             aesCtr = new aesjs.ModeOfOperation.ctr(key_hint[1], new aesjs.Counter(ctr));
    //             decryptedBytes = aesCtr.decrypt(inputBytes.slice(4));
    // 
    //             if (debug) {
    //                 console.log('decrypt: ');
    //                 console.log('    inputBytes: ', inputBytes);
    //                 console.log('           ctr: ', ctr, int32_to_array(ctr));
    //                 console.log('           key: ', key_hint[1]);
    //                 console.log('         bytes: ', decryptedBytes);
    //             }
    // 
    //             elem.textContent = aesjs.util.convertBytesToString(decryptedBytes)
    // 
    //         });
    // 
    //     }

    var AES = require('./AES');

    function tohex(arr) {
        return arr.map(function (word) {
            return ('0' + word.toString(16)).slice(-8);
        }).join('')
    }

    function fromhex(hex) {
        var words = [], i;
        for (i = 0; i < hex.length; i += 8) {
            words.push(parseInt(hex.slice(i, i + 8), 16));
        }
        return words;
    }

    function password_to_key(key_text, salt) {
        salt = salt || new Date() & 0xffffffff;
        return [salt, AES.Codec.strToWords(sha256(key_text + salt).substring(0, 16))];
    }

    function encrypt() {
        var
            elem = this,
            txt = elem.textContent,
            inputWords,
            pass,
            key_hint,
            ctr,
            iv,
            aesCtr,
            encryptedWords;

        if (!txt) {
            console.warn('encrypt: no txt');
            return;
        }

        inputWords = AES.Codec.strToWords(txt);

        prompt_password('Enter key:', 'key text here', function (pass) {

            if (!pass) {
                console.warn('encrypt: no password');
                return;
            }

            key_hint = password_to_key(pass, 0);
            ctr = key_hint[0];
            iv = [ctr];
            aesCtr = new AES.CTR(key_hint[1], iv); // key, iv
            encryptedWords = iv.concat(aesCtr.encrypt(inputWords));

            if (debug) {
                console.log('encrypt: ');
                console.log('    inputWords: ', inputWords);
                console.log('           ctr: ', ctr);
                console.log('           key: ', key_hint[1]);
                console.log('         bytes: ', encryptedWords);
            }

            elem.textContent = tohex(encryptedWords)

        });

    }

    function decrypt() {
        var
            elem = this,
            txt = elem.textContent,
            inputWords,
            ctr,
            iv,
            pass,
            key_hint,
            aesCtr,
            decryptedWords;

        if (!txt) {
            console.warn('decrypt: no txt');
            return;
        }

        inputWords = fromhex(txt);
        if (!inputWords) {
            console.warn('decrypt: input is not hex');
            return;
        }

        ctr = inputWords[0];
        iv = [ctr];

        prompt_password('Enter key:', 'key text here', function (pass) {

            if (!pass) {
                console.warn('decrypt: no password');
                return;
            }

            key_hint = password_to_key(pass, ctr);
            aesCtr = new AES.CTR(key_hint[1], iv); // key, iv
            decryptedWords = aesCtr.decrypt(inputWords.slice(1));

            if (debug) {
                console.log('decrypt: ');
                console.log('    inputWords: ', inputWords);
                console.log('           ctr: ', ctr);
                console.log('           key: ', key_hint[1]);
                console.log('         bytes: ', decryptedWords);
            }

            elem.textContent = AES.Codec.wordsToStr(decryptedWords)

        });

    }

    Array.prototype.map.call(
        document.getElementsByClassName('conv'),
        function (e) {
            e.addEventListener('click', function () {
                var elem = document.getElementById('editbox'),
                    expr = e.getAttribute('exec'),
                    wbrk = e.getAttribute('wbrk'),
                    fun;
                if (expr) {
                    fun = eval(expr);
                    fun.call(elem);
                }
                wbrk = wbrk || 'normal';
                if ('toggle' == wbrk) {
                    if ('break-all' == elem.style.wordBreak) {
                        elem.style.wordBreak = 'normal';
                    } else {
                        elem.style.wordBreak = 'break-all';
                    }
                } else {
                    elem.style.wordBreak = wbrk;
                }
            })
        });

    // Note: To prevent closure-compiler mangling the name,
    // window['name'] = name, instead of window.name = name
    window['fil'] = fil;
    window['encrypt'] = encrypt;
    window['decrypt'] = decrypt;

    if (!debug) {
        window.onbeforeunload = function () {
            return 'Sure you want to close this?'
        }
    }

})
