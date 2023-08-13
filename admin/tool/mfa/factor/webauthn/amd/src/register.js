// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * For collecting WebAuthn authenticator details on factor setup
 *
 * @module     factor_webauthn/register
 * @copyright  Catalyst IT
 * @author     Alex Morris <alex.morris@catalyst.net.nz>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import * as utils from './utils';

export const init = (initialCreateArgs) => {
    document.getElementById('id_submitbutton').disabled = true;
    document.addEventListener('click', async(e) => {
        if (!e.target.closest('#factor_webauthn-register')) {
            return;
        }

        if (!navigator.credentials || !navigator.credentials.create) {
            throw new Error('Browser not supported.');
        }

        const createArgs = JSON.parse(initialCreateArgs);
        if (createArgs.success === false) {
            throw new Error(createArgs.msg || 'unknown error occured');
        }
        e.preventDefault();

        utils.recursiveBase64StrToArrayBuffer(createArgs);

        const cred = await navigator.credentials.create(createArgs);

        const authenticatorResponse = {
            transports: cred.response.getTransports ? cred.response.getTransports() : null,
            clientDataJSON: cred.response.clientDataJSON ? utils.arrayBufferToBase64(cred.response.clientDataJSON) : null,
            attestationObject: cred.response.attestationObject ? utils.arrayBufferToBase64(cred.response.attestationObject) : null,
        };

        const inputResponse = document.getElementById('id_response_input');
        inputResponse.value = JSON.stringify(authenticatorResponse);
        document.getElementById('id_submitbutton').disabled = false;

        // Do not use form.submit as it bypasses the change checker submit listener.
        inputResponse.form.elements.submitbutton.click();
    });
};
