// Disclosure History Exporter - run in the browser console on the history page.
// Reads rendered rows locally. Does not upload exports or modify records.
(async () => {
  "use strict";
  const YEAR = 2026, MONTH = 10;
  const period = `${YEAR}-${String(MONTH).padStart(2, "0")}`;
  const start = YEAR * 10000 + MONTH * 100 + 1;
  const end = MONTH === 12 ? (YEAR + 1) * 10000 + 101 : YEAR * 10000 + (MONTH + 1) * 100 + 1;
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const esc = x => String(x).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  let win, owned = false;
  try {
    if (window.__disclosureExportRunning) throw Error("An export is already running.");
    window.__disclosureExportRunning = true; owned = true;
    const pager = () => document.querySelector("#pagination-container");
    const button = label => pager()?.querySelector(`button[aria-label="${label}"]`);
    const unavailable = b => !b || b.disabled || b.getAttribute("aria-disabled") === "true";
    const read = () => {
      const table = [...document.querySelectorAll("table")].find(t =>
        [...t.querySelectorAll("thead th")].some(h => h.textContent.trim() === "Car Buyer Name"));
      const match = pager()?.textContent.match(/Showing\s+([\d,]+)\s*[-–]\s*([\d,]+)\s+of\s+([\d,]+)/i);
      if (!table || !match) throw Error("History table or record count not found.");
      const [first, last, total] = match.slice(1).map(n => Number(n.replaceAll(",", "")));
      const headers = [...table.querySelectorAll("thead th")].map(h => (h.querySelector("p") || h).textContent.trim());
      const rows = [...table.querySelectorAll("tbody tr")].map(tr => [...tr.querySelectorAll("td")].map(td => {
        const parts = [...td.querySelectorAll("p, span")].filter(e => !e.querySelector("p, span")).map(e => e.textContent.trim()).filter(Boolean);
        return parts.length ? parts.join(" | ") : td.textContent.trim();
      }));
      return {first, last, total, headers, rows, key: JSON.stringify([first, last, total, rows])};
    };
    const wait = async (oldKey, expected) => {
      const deadline = Date.now() + 30000;
      let key = "", since = 0;
      while (Date.now() < deadline) {
        await sleep(300);
        let p;
        try { p = read(); } catch { continue; }
        if (p.first !== expected || p.key === oldKey || !p.rows.length ||
            p.rows.length !== p.last - p.first + 1 || p.rows.some(r => r.length !== p.headers.length)) {
          key = ""; since = 0; continue;
        }
        if (key !== p.key) { key = p.key; since = Date.now(); }
        if (Date.now() - since >= 2000) return p;
      }
      throw Error(`Timed out waiting for a stable page at row ${expected}.`);
    };
    const parseDate = value => {
      const text = String(value ?? "").trim();
      if (/^[\s\u2014\u2013-]*$/.test(text)) return null;
      const m = text.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),\s+(\d{4})\b/i);
      if (!m) throw Error("Unexpected sent-date format. Export stopped rather than discarding it.");
      const month = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"].indexOf(m[1].toLowerCase()) + 1;
      const day = Number(m[2]), year = Number(m[3]), d = new Date(year, month - 1, day);
      if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) throw Error("Invalid sent date.");
      return year * 10000 + month * 100 + day;
    };
    if (document.querySelector('input[name="Search"]')?.value.trim()) throw Error("Clear the search first.");
    const initial = read();
    win = window.open("", "_blank");
    if (!win) throw Error("Allow pop-ups for this site, then retry.");
    win.document.body.textContent = "Collecting history. Leave the source tab open and do not navigate it.";
    if (initial.first !== 1) {
      const first = button("First page");
      if (unavailable(first)) throw Error("Cannot navigate to the first page.");
      first.click();
    }
    let page = await wait(initial.first === 1 ? null : initial.key, 1);
    const total = page.total, headers = page.headers, dateIndex = headers.indexOf("Sent Date");
    if (dateIndex < 0) throw Error("Sent Date column not found.");
    const matched = [], undated = [], seen = new Set();
    let scanned = 0, finished = false;
    const started = new Date().toISOString();
    for (let n = 1; n <= 10000; n++) {
      if (win.closed) throw Error("Report window closed; export cancelled.");
      if (page.total !== total) throw Error("History count changed during export. Retry when activity is quieter.");
      if (JSON.stringify(page.headers) !== JSON.stringify(headers)) throw Error("Table columns changed.");
      if (page.first !== scanned + 1 || seen.has(page.key)) throw Error("Unexpected or repeated page.");
      seen.add(page.key);
      for (const row of page.rows) {
        const date = parseDate(row[dateIndex]);
        if (date === null) undated.push(row);
        else if (date >= start && date < end) matched.push(row);
      }
      scanned += page.rows.length;
      const status = `${period}: ${matched.length} matches; ${undated.length} undated; scanned ${scanned}/${total}.`;
      console.log("[Disclosure export] " + status);
      win.document.body.textContent = status;
      if (page.last === total) { finished = true; break; }
      const next = button("Next page");
      if (unavailable(next)) throw Error("Next page unavailable before scan completion.");
      const oldKey = page.key, expected = page.last + 1;
      await sleep(500); next.click();
      page = await wait(oldKey, expected);
    }
    if (!finished || scanned !== total) throw Error("Incomplete scan; no completed report generated.");
    const completed = new Date().toISOString();
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Disclosure History ${period}</title><style>
      @page{size:landscape;margin:10mm}body{font:10px Arial,sans-serif;margin:20px;color:#111}
      h1{font-size:20px}p{line-height:1.6}button{padding:9px;margin:0 8px 14px 0}
      table{width:100%;border-collapse:collapse;table-layout:fixed}th,td{border:1px solid #ccc;padding:5px;text-align:left;vertical-align:top;overflow-wrap:anywhere}
      th{background:#eee}th:nth-child(3){width:23%}thead{display:table-header-group}tr{break-inside:avoid;page-break-inside:avoid}
      @media print{.toolbar{display:none}body{margin:0}}
      </style></head><body><div class="toolbar"><button id="print">Save / Print PDF</button><button id="csv">Download monthly CSV</button><button id="unknown">Download undated CSV</button></div>
      <h1>Disclosure History - ${period}</h1><p>Matching records: ${matched.length}<br>History rows scanned: ${scanned} / ${total}<br>
      Undated rows excluded from monthly results: ${undated.length}<br>Started: ${esc(started)}<br>Completed: ${esc(completed)}</p>
      <p>Filtered by the displayed sent calendar date; all statuses included. Current application filters still apply.
      ${undated.length ? "WARNING: Undated rows cannot be assigned to a month. Review the separate undated CSV; monthly completeness is not verified." : ""}
      Locally generated history report, not a vendor-certified export or the underlying disclosure documents.</p>
      <table><thead><tr>${headers.map(h => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${matched.map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></body></html>`;
    win.document.open(); win.document.write(html); win.document.close();
    const download = (rows, name) => {
      const cell = v => { let s = String(v); if (/^\s*[=+\-@]/.test(s)) s = "'" + s; return '"' + s.replaceAll('"', '""') + '"'; };
      const csv = "\uFEFF" + [headers, ...rows].map(r => r.map(cell).join(",")).join("\r\n");
      const url = URL.createObjectURL(new Blob([csv], {type:"text/csv;charset=utf-8"}));
      const a = win.document.createElement("a"); a.href = url; a.download = name; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    };
    win.document.getElementById("print").onclick = () => win.print();
    win.document.getElementById("csv").onclick = () => download(matched, `disclosure-history-${period}.csv`);
    win.document.getElementById("unknown").onclick = () => download(undated, `disclosure-history-undated-review-${period}.csv`);
    console.log(`[Disclosure export] Complete: ${matched.length} matches; ${undated.length} undated exclusions.`);
  } catch (error) {
    console.error("[Disclosure export]", error);
    if (win && !win.closed) win.document.body.textContent = "Export stopped: " + error.message + " No completed report was generated.";
  } finally {
    if (owned) window.__disclosureExportRunning = false;
  }
})();
