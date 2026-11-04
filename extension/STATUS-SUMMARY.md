# Monthly status summary - v0.1.2

The printable report now includes a Monthly status breakdown below its title: Sent, Viewed, Acknowledged, and the total matching records. Other/unknown is shown when needed. Zero counts are displayed for the three named statuses, including months without matches. The completed progress panel also shows these totals.

Counts are calculated only from records included in the selected sent-date month. They reflect each record's displayed status at collection time, not when the status changed. Categories are mutually exclusive; Acknowledged is not also counted as Viewed or Sent. Repeated sends count separately, not as unique buyers. Blank/dash-date exclusions remain outside the monthly summary and in their separate review CSV. Unexpected statuses are counted as Other/unknown. A missing Status column stops the export rather than showing misleading zeroes.

The monthly and undated CSV formats are unchanged (detail rows only). Summary appears on screen and in Print / Save as PDF. Refresh and automatic 100-row preparation remain unchanged; the preparation screen identifies its component as v0.1.1 while the extension card and collector are v0.1.2.

Update the existing extension folder, reload its card on edge://extensions, and refresh the history webpage. Compare the sum of the categories (including Other/unknown if shown) with the report's matching-record count. Test against the monthly detail CSV. Unit and syntax checks do not replace a live application test.
