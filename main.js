document.addEventListener('DOMContentLoaded', function () {

    var debug = true;

    var aesjs = require('aes-js');
    //var pbkdf2 = require('pbkdf2');
    var sha256 = require('js-sha256').sha256;

    var editbox = document.getElementById('editbox');

    Array.prototype.map.call(
        document.getElementsByClassName('conv'),
        function (e) { e.addEventListener('click', function () { eval(e.getAttribute('exec')) }) });

    function int32_to_buffer(n) {
      return new Buffer([n / 256 / 256 / 256,
			 n / 256 / 256 & 0xff,
			 n / 256 & 0xff,
			 n & 0xff]);
    }

    function buffer_to_int32(b) {
      return b[0] * 256 * 256 * 256 +
	     b[1] * 256 * 256 +
	     b[2] * 256 +
	     b[3];
    }

    function password_to_key(key_text, salt) {
        //return aesjs.util.convertStringToBytes(key_text.repeat(16).substring(0, 16));
        //return aesjs.util.convertStringToBytes(pbkdf2.pbkdf2Sync(key_text, 'qwnpot', 5, 16, 'sha512'));
	salt = salt || new Date() & 0xffffffff;
        return [ salt, aesjs.util.convertStringToBytes(sha256(key_text+salt).substring(0, 16)) ];
    }

    function encrypt(txt) {
        var
            inputBytes = aesjs.util.convertStringToBytes(txt),
            key_hint = password_to_key(prompt("Enter key:", "key text here"), 0),
	    ctr = key_hint[0],
            aesCtr = new aesjs.ModeOfOperation.ctr(key_hint[1], new aesjs.Counter(ctr)),
            encryptedBytes = Buffer.concat([int32_to_buffer(ctr), aesCtr.encrypt(inputBytes)]);

	if (debug) {
	  console.log('encrypt:');
	  console.log('    inputBytes: ', inputBytes);
	  console.log('           ctr: ', ctr, int32_to_buffer(ctr));
	  console.log('           key: ', key_hint[1]);
	  console.log('         bytes: ', encryptedBytes);
	}

        return aesjs.util.convertBytesToString(encryptedBytes, 'hex')
    }

    function decrypt(txt) {
        var
            inputBytes = aesjs.util.convertStringToBytes(txt, 'hex'),
	    ctr = buffer_to_int32(inputBytes.slice(0,4)),
            key_hint = password_to_key(prompt("Enter key:", "key text here"), ctr),
            aesCtr = new aesjs.ModeOfOperation.ctr(key_hint[1], new aesjs.Counter(ctr)),
            decryptedBytes = aesCtr.decrypt(inputBytes.slice(4));

	if (debug) {
	  console.log('decrypt:');
	  console.log('    inputBytes: ', inputBytes);
	  console.log('           ctr: ', ctr, int32_to_buffer(ctr));
	  console.log('           key: ', key_hint[1]);
	  console.log('         bytes: ', decryptedBytes);
	}

        return aesjs.util.convertBytesToString(decryptedBytes)
    }

    window.encrypt = encrypt;
    window.decrypt = decrypt;
    window.onbeforeunload = function () { return "Sure you want to close this?" }

})