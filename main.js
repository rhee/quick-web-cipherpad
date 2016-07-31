(function () {
    "use strict";

    /** @const */ var debug = false;

    /** @const */ var tag_encrypt = 'encrypt';
    /** @const */ var tag_decrypt = 'decrypt';
    /** @const */ var tag_format = 'hex';

    /** @const */ var msg_no_text = 'no text';
    /** @const */ var msg_no_password = 'no password';
    /** @const */ var msg_wrong_format = 'wrong input format';
    /** @const */ var msg_prompt = 'Password:';
    /** @const */ var msg_prompt_hint = 'password here';

    //var aesjs = require('aes-js');
    //var sha256 = require('js-sha256').sha256;

    function fil(f) {
        return function () {
            this.innerText = f(this.innerText);
        }
    }

    function int32_to_buffer(n) {
        return new Buffer([n >> 24,
            n >> 16 & 0xff,
            n >> 8 & 0xff,
            n & 0xff
        ]);
    }

    function buffer_to_int32(b) {
        return b[0] * 256 * 256 * 256 +
            b[1] * 256 * 256 +
            b[2] * 256 +
            b[3];
    }

    //var prompt_password = require('./prompt_password.js');

/*
prompt_template pretty printed:
{{{
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
}}}
*/

    function prompt_password(label, hint, callback) {

	/** @const */
	var prompt_template = '<div class="popup"><table border="0" style="width:100%"><tr><td width="1">' + label + '</td><td width="*"><input name="password" type="password" size="25" style="width:100%" hint="' + hint + '"/></td><td width="1"><input name="submit" type="button" value="OK"/></td></tr></table></div>';

        var overlay = document.createElement('div'),
            input,
            submit,
            onsubmit;

        if (debug) {
            console.log('overlay template: ');
            console.log(prompt_template);
        }

        overlay.className = 'overlay';
        overlay.innerHTML = prompt_template;

        document.body.appendChild(overlay);

        input = overlay.querySelector('input[name="password"]');
        submit = overlay.querySelector('input[name="submit"]');

        input.focus();

        onsubmit = function (e) {
            var password;
            document.body.removeChild(overlay);
            if (callback) {
                password = input.value;
                callback(password)
            }
        };
        input.addEventListener('keydown', function (e) {
            if (e.keyCode == 13) { /* enter key */
                onsubmit(e);
            }
        });
        submit.addEventListener('click', onsubmit);
    }


    function password_to_key(key_text) {
        return aesjs.util.convertStringToBytes(sha256(key_text.repeat(32)).substring(0, 16));
    }

    function encrypt() {
        var
            elem = this,
            txt = elem.textContent,
            inputBytes,
            pass,
            key,
            aesCtr,
            encryptedBytes;

        if (!txt) {
            console.warn(tag_encrypt, msg_no_text);
            return;
        }

        inputBytes = aesjs.util.convertStringToBytes(txt);

        prompt_password(msg_prompt, msg_prompt_hint, function (pass) {

            if (!pass) {
                console.warn(tag_encrypt, msg_no_password);
                return;
            }

            key = password_to_key(pass);
            aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(0));
            encryptedBytes = aesCtr.encrypt(inputBytes);

            if (debug) {
                console.log(tag_encrypt, inputBytes, key, encryptedBytes);
            }

            elem.textContent = aesjs.util.convertBytesToString(encryptedBytes, tag_format)

        });

    }

    function decrypt() {
        var
            elem = this,
            txt = elem.textContent,
            inputBytes,
            pass,
            key,
            aesCtr,
            decryptedBytes;

        if (!txt) {
            console.warn(tag_decrypt, msg_no_text);
            return;
        }

        inputBytes = aesjs.util.convertStringToBytes(txt, tag_format);
        if (!inputBytes) {
            console.warn(tag_decrypt, msg_wrong_format);
            return;
        }

        prompt_password(msg_prompt, msg_prompt_hint, function (pass) {

            if (!pass) {
                console.warn(tag_decrypt, msg_no_password);
                return;
            }

            key = password_to_key(pass);
            aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(0));
            decryptedBytes = aesCtr.decrypt(inputBytes);

            if (debug) {
                console.log(tag_decrypt, inputBytes, key, decryptedBytes);
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
    window[tag_encrypt] = encrypt;
    window[tag_decrypt] = decrypt;

    if (!debug) {
        window.onbeforeunload = function () {
            return 'Sure you want to close this?'
        }
    }

})()
