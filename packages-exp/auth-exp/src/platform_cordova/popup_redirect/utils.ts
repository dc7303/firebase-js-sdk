import * as externs from '@firebase/auth-types-exp';
import { AuthErrorCode } from '../../core/errors';
import { debugAssert, _assert, _createError, _fail } from '../../core/util/assert';
import { _isAndroid, _isIOS, _isIOS7Or8 } from '../../core/util/browser';
import { _getRedirectUrl } from '../../core/util/handler';
import { Auth } from '../../model/auth';
import { AuthEvent, AuthEventType } from '../../model/popup_redirect';

const SESSION_ID_LENGTH = 20;

/**
 * Generates a (partial) {@link AuthEvent}.
 */
export function _generateNewEvent(auth: Auth, type: AuthEventType, eventId: string|null = null): AuthEvent {
  return {
    type,
    eventId,
    urlResponse: null,
    sessionId: generateSessionId(),
    postBody: null,
    tenantId: auth.tenantId,
    error: _createError(auth, AuthErrorCode.NO_AUTH_EVENT),
  };
}

/**
 * Generates the URL for the OAuth handler.
 */
export async function _generateHandlerUrl(auth: Auth, event: AuthEvent, provider: externs.AuthProvider): Promise<string> {
  debugAssert(event.sessionId, 'AuthEvent did not contain a session ID');
  const sessionDigest = await computeSha256(event.sessionId);

  const additionalParams: Record<string, string> = {};
  if (_isIOS()) {
    // iOS app identifier
    additionalParams['ibi'] = BuildInfo.packageName;
  } else if (_isAndroid()) {
    // Android app identifier
    additionalParams['apn'] = BuildInfo.packageName;
  } else {
    _fail(auth, AuthErrorCode.OPERATION_NOT_SUPPORTED);
  }

  if (BuildInfo.displayName) {
    additionalParams['appDisplayName'] = BuildInfo.displayName;
  }

  // Attached the hashed session ID
  additionalParams['sessionId'] = sessionDigest;
  return _getRedirectUrl(auth, provider, event.type, undefined, event.eventId ?? undefined, additionalParams);
}

export function _performRedirect(handlerUrl: string): Promise<void> {
  return new Promise(resolve => {
    cordova.plugins.browsertab.isAvailable(browserTabIsAvailable => {
      if (browserTabIsAvailable) {
        cordova.plugins.browsertab.openUrl(handlerUrl);
      } else {
        // TODO: Return the inappbrowser ref that's returned from the open call
        cordova.InAppBrowser.open(handlerUrl, _isIOS7Or8() ? '_blank' : '_system', 'location=yes');
      }
      resolve();
    });
  });
}

/**
 * Checks the configuration of the Cordova environment. This has no side effect
 * if the configuration is correct; otherwise it throws an error with the
 * missing plugin.
 */
export function _checkCordovaConfiguration(auth: Auth): void {
  // Check all dependencies installed.
  // https://github.com/nordnet/cordova-universal-links-plugin
  // Note that cordova-universal-links-plugin has been abandoned.
  // A fork with latest fixes is available at:
  // https://www.npmjs.com/package/cordova-universal-links-plugin-fix
  _assert(
    typeof window?.universalLinks?.subscribe === 'function',
    auth,
    AuthErrorCode.INVALID_CORDOVA_CONFIGURATION,
    {
      missingPlugin: 'cordova-universal-links-plugin-fix'
    }
  );

  // https://www.npmjs.com/package/cordova-plugin-buildinfo
  _assert(
    typeof window?.BuildInfo?.packageName !== 'undefined',
    auth,
    AuthErrorCode.INVALID_CORDOVA_CONFIGURATION,
    {
      missingPlugin: 'cordova-plugin-buildInfo'
    }
  );

  // https://github.com/google/cordova-plugin-browsertab
  _assert(
    typeof window?.cordova?.plugins?.browsertab?.openUrl === 'function',
    auth,
    AuthErrorCode.INVALID_CORDOVA_CONFIGURATION,
    {
      missingPlugin: 'cordova-plugin-browsertab'
    }
  );
  _assert(
    typeof window?.cordova?.plugins?.browsertab?.isAvailable === 'function',
    auth,
    AuthErrorCode.INVALID_CORDOVA_CONFIGURATION,
    {
      missingPlugin: 'cordova-plugin-browsertab'
    }
  );

  // https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-inappbrowser/
  _assert(
    typeof window?.cordova?.InAppBrowser?.open === 'function',
    auth,
    AuthErrorCode.INVALID_CORDOVA_CONFIGURATION,
    {
      missingPlugin: 'cordova-plugin-inappbrowser'
    }
  );
}

function generateSessionId(): string {
  const chars = [];
  const allowedChars = '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < SESSION_ID_LENGTH; i++) {
    const idx = Math.floor(Math.random() * allowedChars.length);
    chars.push(allowedChars.charAt(idx));
  }
  return chars.join('');
}

async function computeSha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', encoder.encode(text));

  const arr = new Uint8Array(buf);
  let hexString = '';

  // Can't iterate over typed arrays using for...of
  for (let i = 0; i < arr.length; i++) {
    const hex = arr[i].toString(16);
    hexString += hex.length === 1 ? `0${hex}` : hex;
  }

  return hexString;
}