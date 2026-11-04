# Compact report layout - v0.1.3

The report document is initialized with an explicit HTML doctype and checked for standards mode. Disclosure detail headers and cells now explicitly use Arial 10px, line-height 1.15, and 3px vertical / 4px horizontal padding. Styles are scoped to table.disclosure-details. The title, monthly status summary, disclaimers, and metadata retain their existing font and spacing rules. Full text wrapping, repeated column headers, all detail rows, all columns, and status totals are retained; there is no truncation or row filtering change.

Collection, refresh preparation, month/year filtering, count-change checks, status calculation, and CSV formats are unchanged. The preparation component still identifies itself as v0.1.1; the extension card and collector are v0.1.3. The console script remains unchanged.

Update the existing extension folder, reload it on edge://extensions, and refresh the history webpage before exporting. Compare the same month and matching-record count using the same paper size, Landscape, scale, margins, and browser header/footer options. Expect a denser table, but no specific page count is guaranteed. Verify the PDF preview, untruncated VINs and statuses, monthly totals, and both CSV downloads. Static syntax/layout checks do not establish a live Edge print result.

No customer records or screenshots are included in this source change.
