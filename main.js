document.addEventListener('DOMContentLoaded', function () {
    'use strit';

    /** @constant */
    var debug = false;

    var aesjs = require('aes-js');
    var sha256 = require('js-sha256').sha256;
    var heredoc = require('kmkr-heredoc');

    function fil(f) {
        return function () {
            this.innerText = f(this.innerText);
        }
    }

    function int32_to_buffer(n) {
        return new Buffer([n / 256 / 256 / 256,
            n / 256 / 256 & 0xff,
            n / 256 & 0xff,
            n & 0xff
        ]);
    }

    function buffer_to_int32(b) {
        return b[0] * 256 * 256 * 256 +
            b[1] * 256 * 256 +
            b[2] * 256 +
            b[3];
    }

    function prompt_password(label, hint, callback) {
        var overlay = document.createElement('div'),
            input,
            onsubmit;
        overlay.className = 'overlay';
        overlay.innerHTML = heredoc(function () {
            /** @preserve {{{
<div class="popup">
<table border="0" style="width:100%">
<tr>
<td width="1">
Password:
</td>
<td width="*">
<input name="password" type="password" size="25" style="width:100%"/>
</td>
<td width="1">
<input name="submit" type="button" value="OK"/>
</td>
</tr>
</table>
</div>
}}} */
        });
        overlay.style.visibility = 'visible';
        overlay.style.opacity = '1.0';
        document.body.appendChild(overlay);
        console.log('overlay: ', overlay);
        input = overlay.querySelector('input[name="password"]');
        submit = overlay.querySelector('input[name="submit"]');
        onsubmit = function (e) {
            document.body.removeChild(overlay);
            if (callback) {
                password = input.value;
                callback(password)
            }
        };
        input.addEventListener('keydown', function (e) {
            if (event.keyCode == 13) { /* enter key */
                onsubmit(e);
            }
        });
        submit.addEventListener('click', onsubmit);
    }

    function password_to_key(key_text, salt) {
        //return aesjs.util.convertStringToBytes(pbkdf2.pbkdf2Sync(key_text, 'qwnpot', 5, 16, 'sha512'));
        salt = salt || new Date() & 0xffffffff;
        return [salt, aesjs.util.convertStringToBytes(sha256(key_text + salt).substring(0, 16))];
    }

    function encrypt() {
        var
            elem = this,
            txt = elem.textContent,
            inputBytes,
            pass,
            key_hint,
            ctr,
            aesCtr,
            encryptedBytes;

        if (!txt) {
            console.warn('encrypt: no txt');
            return;
        }

        inputBytes = aesjs.util.convertStringToBytes(txt);

        prompt_password('Enter key:', 'key text here', function (pass) {

            if (!pass) {
                console.warn('encrypt: no password');
                return;
            }

            key_hint = password_to_key(pass, 0);
            ctr = key_hint[0];
            aesCtr = new aesjs.ModeOfOperation.ctr(key_hint[1], new aesjs.Counter(ctr));
            encryptedBytes = Buffer.concat([int32_to_buffer(ctr), aesCtr.encrypt(inputBytes)]);

            if (debug) {
                console.log('encrypt:');
                console.log('    inputBytes: ', inputBytes);
                console.log('           ctr: ', ctr, int32_to_buffer(ctr));
                console.log('           key: ', key_hint[1]);
                console.log('         bytes: ', encryptedBytes);
            }

            elem.textContent = aesjs.util.convertBytesToString(encryptedBytes, 'hex')

        });

    }

    function decrypt() {
        var
            elem = this,
            txt = elem.textContent,
            inputBytes,
            ctr,
            pass,
            key_hint,
            aesCtr,
            decryptedBytes;

        if (!txt) {
            console.warn('decrypt: no txt');
            return;
        }

        inputBytes = aesjs.util.convertStringToBytes(txt, 'hex');
        if (!inputBytes) {
            console.warn('decrypt: input is not hex');
            return;
        }

        ctr = buffer_to_int32(inputBytes.slice(0, 4));

        prompt_password('Enter key:', 'key text here', function (pass) {

            if (!pass) {
                console.warn('decrypt: no password');
                return;
            }

            key_hint = password_to_key(pass, ctr);
            aesCtr = new aesjs.ModeOfOperation.ctr(key_hint[1], new aesjs.Counter(ctr));
            decryptedBytes = aesCtr.decrypt(inputBytes.slice(4));

            if (debug) {
                console.log('decrypt:');
                console.log('    inputBytes: ', inputBytes);
                console.log('           ctr: ', ctr, int32_to_buffer(ctr));
                console.log('           key: ', key_hint[1]);
                console.log('         bytes: ', decryptedBytes);
            }

            elem.textContent = aesjs.util.convertBytesToString(decryptedBytes)

        });

    }

    Array.prototype.map.call(
        document.getElementsByClassName('conv'),
        function (e) {
            e.addEventListener('click', function () {
                var elem = document.getElementById('editbox'),
                    expr = e.getAttribute('exec'),
                    wbrk = e.getAttribute('wbrk');
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