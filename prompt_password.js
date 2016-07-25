(function (_window) {
    'use strict';

    /** @constant */
    var debug = false;

    function prompt_password(label, hint, callback) {
        var overlay = document.createElement('div'),
            template,
            input,
            submit,
            onsubmit;

/*
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

        template = '<div class="popup"><table border="0" style="width:100%"><tr><td width="1">' + label + '</td><td width="*"><input name="password" type="password" size="25" style="width:100%" hint="' + hint + '"/></td><td width="1"><input name="submit" type="button" value="OK"/></td></tr></table></div>';

        if (debug) {
            console.log('overlay template: ');
            console.log(template);
        }

        overlay.className = 'overlay';
        overlay.innerHTML = template;

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

    if (('undefined' !== typeof module) && module.exports) {
        // Publish as node.js module
        module.exports = prompt_password;
    } else if (typeof define === 'function' && define.amd) {
        // Publish as AMD module
        define(function () { return prompt_password; });
    } else {
        // Publish as global (in browsers)
        _previousRoot = _window.prompt_password;
        // **`noConflict()` - (browser only) to reset global 'prompt_password' var**
        prompt_password.noConflict = function () {
            _window.prompt_password = _previousRoot;
            return prompt_password;
        };
        _window.prompt_password = prompt_password;
    }

})('undefined' !== typeof window ? window : null);
