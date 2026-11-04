# Disclosure History Exporter extension - 0.1.1

Pilot for Edge and Chrome. The working console script is unchanged.

## Installation or update
Extract the repository to a permanent folder. Open edge://extensions (or chrome://extensions), enable Developer mode, and Load unpacked the extension folder containing manifest.json. For an existing install, replace its files, click Reload on its extension card, and refresh the history webpage. Verify version 0.1.1 on the extension card. Do not remove the extension folder. Unpacked installs do not auto-update from GitHub.

## Prepare and run
1. Open the signed-in Disclosure History page and clear search and all filters.
2. Click the extension icon. A new preparation screen appears.
3. If the page may be stale, click Refresh history and confirm. This reloads the source page and removes the panel. After loading finishes, click the extension icon again. Refresh does not preserve custom month/year selections or unsaved page state.
4. Click Set 100 rows & open exporter. The extension changes the existing page-size control, moves to the first page, and waits for a stable table. It then opens the existing month/year exporter.
5. Select a month and year and Generate report. Allow site pop-ups if necessary. Leave the source page alone during scanning and keep it open until report saving and downloads finish.

The original exporter panel still identifies its collection component as v0.1.0 and mentions manual page-size selection; the v0.1.1 preparation component has already done that step. On repeated exports with the panel still open, its icon reopens that panel rather than preparing again. Close the exporter panel to return to preparation on the next icon click.

## Outputs and safeguards
Print / Save as PDF and monthly CSV include the selected month using displayed calendar dates, with all statuses and repeated sends retained. Undated CSV covers excluded blank/dash-date records from the entire scanned history; it cannot assign them to a month. Unknown nonblank date formats abort. Cancel or closing the report stops collection without a completed report and does not restore the starting page.

The count-change safeguard remains enabled. A stale page may disagree with freshly loaded pagination; refreshing and preparation can reduce that risk but cannot guarantee a snapshot. A genuine addition, deletion, or reordering during scanning can still affect coverage. Retry from a fresh page if the count changes; do not accept a partial export. Even unchanged totals do not prove completeness. Search is checked; other filters cannot reliably be detected. Empty histories currently require a nonempty-table view.

## Privacy and testing
Only activeTab and scripting permissions; no permanent host access, telemetry, credentials, external libraries, remote executable code, record uploads, or persistent record storage. Normal page navigation uses the application's own network requests. Reports contain sensitive information; secure saved files. Public source contains no organization identifiers or customer records.

Test automatic page-size selection starting at 10 rows and from a later page; test refresh, October comparison with the working console report, undated output, cancellation, PDF and CSV. Syntax checks are not live application tests.
