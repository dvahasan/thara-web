// What the page does before the app starts. A file of its own, not a
// script written into the page, so the page's policy can refuse every
// script that is not a file beside it.
(function () {
  'use strict';

  // Never inside another site's frame: a page drawn over this one could
  // steer a press onto a button of the wallet. The app is not started
  // there (flutter_bootstrap.js looks at this flag).
  if (window.top !== window.self) {
    window.tharaFramed = true;
    document.documentElement.hidden = true;
    try {
      window.top.location = window.self.location.href;
    } catch (_) {
      // The other site may not be moved from here; staying hidden is enough.
    }
    return;
  }

  // Back from Google's own sign-in page: what Google answered is in the
  // address, after the '#'. It is put aside for the app to read once, for
  // this tab only, and taken out of the address at once, so it is neither
  // kept in the browser's history nor taken for a place in the app.
  // Two questions are asked of Google that way, told apart by the word the
  // app sent with each: "Continue with Google" (who the person is), and
  // reading the backups the phone app keeps in Google Drive (a pass to
  // Thara's own hidden folder there).
  var answer = window.location.hash ? window.location.hash.slice(1) : '';
  var forDrive = /(^|&)state=thara-drive-/.test(answer);
  var ours = /(^|&)state=thara-/.test(answer) &&
      (forDrive ? /(^|&)(access_token|error)=/ : /(^|&)(id_token|error)=/).test(answer);
  if (ours) {
    try {
      window.sessionStorage.setItem(forDrive ? 'thara-drive-answer' : 'thara-google-answer', answer);
    } catch (_) {
      // No storage for this tab: the sign-in simply did not happen.
    }
    try {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    } catch (_) {
      window.location.hash = '';
    }
  }

  // The first page goes when the app has drawn its own.
  var splash = document.getElementById('thara-splash');
  window.addEventListener('flutter-first-frame', function () {
    if (!splash) return;
    var leaving = splash;
    splash = null;
    leaving.classList.add('gone');
    window.setTimeout(function () { leaving.remove(); }, 280);
  });
  window.setTimeout(function () {
    var late = document.getElementById('thara-late');
    if (splash && late) late.hidden = false;
  }, 20000);
})();
