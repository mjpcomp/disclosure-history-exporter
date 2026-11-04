# Disclosure History Exporter extension - 0.1.0

Pilot build for Microsoft Edge and Google Chrome (Manifest V3).

## Install
1. Extract this folder to a permanent local location.
2. Open edge://extensions (or chrome://extensions).
3. Enable Developer mode and choose Load unpacked.
4. Select this folder, which contains manifest.json.
5. Pin Disclosure History Exporter to the toolbar.

## Use
Sign into the application and open Disclosure History. Clear search and all filters, select 100 rows per page, and let loading finish. Click the extension icon, choose month/year (defaults to the previous month), and Generate report. Confirm the filter warning. Allow site pop-ups if prompted. Leave the source page alone and keep it open during collection and downloads. The exporter scans every page, regardless of sort order. Use the separate report window for Print / Save as PDF, monthly CSV, or undated CSV. Cancel aborts without producing a completed report and does not restore the original history page. Close dismisses the panel when idle. Closing the report while scanning cancels the run.

## Privacy and limitations
Only activeTab and scripting permissions are requested. No persistent host access, credentials, telemetry, external libraries, remote executable code, network uploads, or persistent record storage. Normal application page navigation still makes its own requests. Results are in browser memory until their tabs are closed; downloaded reports contain sensitive information and must be secured. Public code contains no customer records or organization identifiers.

Month filtering uses displayed calendar dates. Blank and dash dates are excluded from monthly results and retained in a separate review CSV covering the full scanned history, not just the selected month. All statuses and repeated sends are retained. Unknown nonblank date formats abort the export. Search is checked; other application filters cannot reliably be detected. This is not an independent server snapshot: insertions or reordering during pagination can affect coverage even if total count is unchanged. The DOM structure is application-dependent and may require updates. Empty histories currently show a friendly error rather than an empty export.

No Dev Console is needed for normal use. If injection is blocked (for example on an internal browser page), the icon shows !; open the signed-in history website and retry. After an extension update, reload it on the extensions page and refresh the history tab before running. Keep the extension directory in place. A local unpacked installation does not automatically update from GitHub.

## Test checklist
- Compare the same month against the working console export (including undated exclusions).
- Try a month with no matches, year boundary, Cancel, closing the report, repeat runs, and a wrong page.
- Verify PDF layout and both CSV downloads. Keep the source tab open until saving is finished.
- Test Edge first, then Chrome. Static checks do not replace live application testing.
