(() => {
  'use strict';
  const KEY = '__disclosureExporterPanelV1';
  if (globalThis[KEY]?.isConnected) { globalThis[KEY].scrollIntoView(); return; }
  const host = document.createElement('div');
  host.style.cssText = 'position:fixed;right:18px;top:18px;z-index:2147483647';
  document.documentElement.append(host); globalThis[KEY] = host;
  const root = host.attachShadow({mode:'closed'});
  const node = (tag, text, parent) => { const e = document.createElement(tag); if (text !== undefined) e.textContent = text; if (parent) parent.append(e); return e; };
  const style = node('style', undefined, root);
  style.textContent = ':host{all:initial}section{font:14px Arial,sans-serif;color:#17202a;background:#fff;width:330px;padding:18px;border:2px solid #2463b4;border-radius:10px;box-shadow:0 6px 30px #0005}h2{font-size:18px;margin:0 0 12px}p{line-height:1.45}label{display:block;margin:10px 0}input,select,button{font:inherit;padding:7px}input{width:90px}button{margin:5px 6px 5px 0;cursor:pointer}small{display:block;line-height:1.4}output{display:block;white-space:pre-wrap;margin-top:12px;line-height:1.5}';
  const panel = node('section', undefined, root);
  node('h2', 'Disclosure History Exporter', panel);
  node('small', 'v0.1.3 - local processing; no uploads', panel);
  const ml = node('label', 'Month: ', panel), month = node('select', undefined, ml);
  ['January','February','March','April','May','June','July','August','September','October','November','December'].forEach((name,i) => { const o=node('option',name,month); o.value=String(i+1); });
  const yl = node('label', 'Year: ', panel), year = node('input', undefined, yl);
  year.type='number'; year.min='1900'; year.max='9998'; year.required=true;
  const previous = new Date(); previous.setDate(1); previous.setMonth(previous.getMonth()-1);
  month.value=String(previous.getMonth()+1); year.value=String(previous.getFullYear());
  node('p', 'Clear search and filters before exporting. The preparation step sets 100 rows per page. Leave this page alone while scanning.', panel);
  const run=node('button','Generate report',panel), cancel=node('button','Cancel',panel), close=node('button','Close',panel);
  cancel.disabled=true;
  const status=node('output','Ready. Select a month and year.',panel); status.setAttribute('aria-live','polite');
  let running=false, cancelled=false;
  cancel.onclick=()=>{cancelled=true; status.textContent='Cancelling...';};
  close.onclick=()=>{if(!running){host.remove(); delete globalThis[KEY];}};
  function summarizeStatuses(rows, index) {
    if(index < 0) throw Error('Status column not found. Cannot produce a reliable monthly breakdown.');
    const totals = {Sent:0, Viewed:0, Acknowledged:0, Other:0};
    const labels = {sent:'Sent', viewed:'Viewed', acknowledged:'Acknowledged'};
    for(const row of rows) {
      const value = String(row[index] ?? '').trim().toLowerCase();
      const label = Object.prototype.hasOwnProperty.call(labels,value) ? labels[value] : 'Other';
      totals[label]++;
    }
    if(Object.values(totals).reduce((a,b)=>a+b,0)!==rows.length) throw Error('Status totals do not match monthly records.');
    return totals;
  }
  run.onclick=async()=>{
    if(running)return;
    let report;
    const check=()=>{if(cancelled)throw Error('Cancelled. No completed report generated.'); if(report?.closed)throw Error('Report window closed. Export cancelled.');};
    const sleep=async ms=>{await new Promise(r=>setTimeout(r,ms));check();};
    try{
      const y=Number(year.value),m=Number(month.value);
      if(!Number.isInteger(y)||y<1900||y>9998||!Number.isInteger(m)||m<1||m>12)throw Error('Enter a valid year and month.');
      const period=`${y}-${String(m).padStart(2,'0')}`,start=y*10000+m*100+1,end=m===12?(y+1)*10000+101:y*10000+(m+1)*100+1;
      const pager=()=>document.querySelector('#pagination-container');
      const button=label=>pager()?.querySelector(`button[aria-label="${label}"]`);
      const unavailable=b=>!b||b.disabled||b.getAttribute('aria-disabled')==='true';
      const read=()=>{
        const table=[...document.querySelectorAll('table')].find(t=>[...t.querySelectorAll('thead th')].some(h=>h.textContent.trim()==='Car Buyer Name'));
        const match=pager()?.textContent.match(/Showing\s+([\d,]+)\s*[-–]\s*([\d,]+)\s+of\s+([\d,]+)/i);
        if(!table||!match)throw Error('Open the signed-in Disclosure History page first. A nonempty history table is required.');
        const [first,last,total]=match.slice(1).map(n=>Number(n.replaceAll(',','')));
        const headers=[...table.querySelectorAll('thead th')].map(h=>(h.querySelector('p')||h).textContent.trim());
        const rows=[...table.querySelectorAll('tbody tr')].map(tr=>[...tr.querySelectorAll('td')].map(td=>{
          const parts=[...td.querySelectorAll('p,span')].filter(e=>!e.querySelector('p,span')).map(e=>e.textContent.trim()).filter(Boolean);
          return parts.length?parts.join(' | '):td.textContent.trim();
        }));
        return {first,last,total,headers,rows,key:JSON.stringify([first,last,total,rows])};
      };
      const wait=async(oldKey,expected)=>{
        const deadline=Date.now()+30000;let key='',since=0;
        while(Date.now()<deadline){
          await sleep(250);let p;try{p=read();}catch{continue;}
          if(p.first!==expected||p.key===oldKey||!p.rows.length||p.rows.length!==p.last-p.first+1||p.rows.some(r=>r.length!==p.headers.length)){key='';since=0;continue;}
          if(key!==p.key){key=p.key;since=Date.now();}
          if(Date.now()-since>=2000)return p;
        }
        throw Error(`Timed out loading row ${expected}. Check the session and retry.`);
      };
      const parse=text=>{
        text=String(text??'').trim();if(/^[\s\u2014\u2013-]*$/.test(text))return null;
        const a=text.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),\s+(\d{4})\b/i);
        if(!a)throw Error('Unexpected sent-date format. Export stopped instead of silently excluding it.');
        const mo=['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'].indexOf(a[1].toLowerCase())+1,d=Number(a[2]),yr=Number(a[3]),date=new Date(yr,mo-1,d);
        if(date.getFullYear()!==yr||date.getMonth()!==mo-1||date.getDate()!==d)throw Error('Invalid sent date.');
        return yr*10000+mo*100+d;
      };
      if(document.querySelector('input[name="Search"]')?.value.trim())throw Error('Clear the history search first.');
      const initial=read();
      if(!window.confirm('Export the selected month from the current history? Clear all filters first for full coverage. This will navigate every page; do not interact with the source page during the scan.'))return;
      report=window.open('','_blank');if(!report)throw Error('Allow pop-ups for this site and try again.');
      report.document.body.textContent='Preparing disclosure history export...';
      running=true;cancelled=false;run.disabled=true;cancel.disabled=false;close.disabled=true;month.disabled=true;year.disabled=true;
      if(initial.first!==1){const b=button('First page');if(unavailable(b))throw Error('Cannot navigate to the first page.');b.click();}
      let page=await wait(initial.first===1?null:initial.key,1);
      const total=page.total,headers=page.headers,di=headers.indexOf('Sent Date'),matched=[],unknown=[],seen=new Set(),started=new Date().toISOString();
      if(di<0)throw Error('Sent Date column not found.');
      const si=headers.findIndex(h=>h.trim().toLowerCase()==='status');
      if(si<0)throw Error('Status column not found. Cannot produce a reliable monthly breakdown.');
      let scanned=0,done=false;
      for(let n=1;n<=10000;n++){
        check();
        if(page.total!==total)throw Error('The history count changed during export. Retry when activity is quieter.');
        if(JSON.stringify(headers)!==JSON.stringify(page.headers)||page.first!==scanned+1||seen.has(page.key))throw Error('Unexpected columns or page sequence. Retry the export.');
        seen.add(page.key);
        for(const row of page.rows){const date=parse(row[di]);if(date===null)unknown.push(row);else if(date>=start&&date<end)matched.push(row);}
        scanned+=page.rows.length;
        status.textContent=`${period}\nScanned: ${scanned} / ${total}\nMatches: ${matched.length}\nUndated: ${unknown.length}`;
        report.document.body.textContent=status.textContent;
        if(page.last===total){done=true;break;}
        const next=button('Next page');if(unavailable(next))throw Error('Next page unavailable before scan completion.');
        const old=page.key,expected=page.last+1;await sleep(500);next.click();page=await wait(old,expected);
      }
      if(!done||scanned!==total)throw Error('Incomplete scan. No completed report generated.');
      check();
      const counts=summarizeStatuses(matched,si);
      const summaryText=`Sent: ${counts.Sent.toLocaleString()} | Viewed: ${counts.Viewed.toLocaleString()} | Acknowledged: ${counts.Acknowledged.toLocaleString()}${counts.Other ? ` | Other/unknown: ${counts.Other.toLocaleString()}` : ''} | Total: ${matched.length.toLocaleString()}`;
      const doc=report.document;
      // Static skeleton only; all record data is inserted below with textContent.
      doc.open();
      doc.write('<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Disclosure History</title></head><body></body></html>');
      doc.close();
      if(doc.compatMode!=='CSS1Compat')throw Error('Could not initialize the report in standards mode.');
      doc.title=`Disclosure History ${period}`;
      const add=(tag,text,parent=doc.body)=>{const el=doc.createElement(tag);if(text!==undefined)el.textContent=text;parent.append(el);return el;};
      add('style','@page{size:landscape;margin:10mm}body{font:10px Arial,sans-serif;color:#111;margin:20px}h1{font-size:20px}p{line-height:1.5}button{padding:9px;margin:0 8px 14px 0}table.disclosure-details{width:100%;border-collapse:collapse;table-layout:fixed;font-family:Arial,sans-serif;font-size:10px;line-height:1.15}table.disclosure-details th,table.disclosure-details td{font-family:Arial,sans-serif;font-size:10px;line-height:1.15;border:1px solid #ccc;padding:3px 4px;text-align:left;vertical-align:top;overflow-wrap:anywhere}table.disclosure-details th{background:#eee}table.disclosure-details th:nth-child(3){width:23%}table.disclosure-details thead{display:table-header-group}table.disclosure-details tr{break-inside:avoid;page-break-inside:avoid}.status-summary{border:1px solid #9aaabc;background:#f3f6fa;padding:10px;margin:12px 0;break-inside:avoid;font-size:12px}.status-summary h2{font-size:14px;margin:0 0 6px}.status-summary p{margin:5px 0}@media print{.toolbar{display:none}body{margin:0}}',doc.head);
      const bar=add('div');bar.className='toolbar';
      add('button','Save / Print PDF',bar).onclick=()=>report.print();
      const download=(rows,name)=>{
        const cell=v=>{let s=String(v);if(/^\s*[=+\-@]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};
        const csv='\uFEFF'+[headers,...rows].map(r=>r.map(cell).join(',')).join('\r\n');
        const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
        const a=doc.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);
      };
      add('button','Download monthly CSV',bar).onclick=()=>download(matched,`disclosure-history-${period}.csv`);
      add('button','Download undated CSV',bar).onclick=()=>download(unknown,`disclosure-history-undated-review-${period}.csv`);
      add('h1',`Disclosure History - ${period}`);
      const summary=add('section');summary.className='status-summary';
      add('h2','Monthly status breakdown',summary);
      add('p',summaryText,summary);
      add('p','Counts use each included record\'s displayed status when collected, not status-change events during the month. Categories are mutually exclusive. Repeated sends count separately; these are records, not unique buyers. Undated exclusions are not included.',summary);
      add('p',`Matching records: ${matched.length}. Scanned: ${scanned} / ${total}. Undated exclusions: ${unknown.length}. Started: ${started}. Completed: ${new Date().toISOString()}.`);
      add('p','Selected by displayed sent calendar date; all statuses included; current application filters apply. Locally generated report, not a vendor-certified export or underlying disclosure documents.');
      if(unknown.length)add('p','WARNING: Undated records cannot be assigned to a month. Review the separate undated CSV; monthly completeness is not verified.');
      if(!matched.length)add('p','No dated records matched this month.');
      const table=add('table');table.className='disclosure-details';
      const head=add('thead',undefined,table),hr=add('tr',undefined,head),body=add('tbody',undefined,table);
      headers.forEach(h=>add('th',h,hr));matched.forEach(row=>{const tr=add('tr',undefined,body);row.forEach(c=>add('td',c,tr));});
      status.textContent+= '\nComplete. '+summaryText+'\nUse the separate report window to save PDF or CSV. Keep this source tab open until downloads finish.';
    }catch(error){status.textContent=error.message;if(report&&!report.closed)report.document.body.textContent='Export stopped: '+error.message+' No completed report generated.';}
    finally{running=false;run.disabled=false;cancel.disabled=true;close.disabled=false;month.disabled=false;year.disabled=false;}
  };
})();
