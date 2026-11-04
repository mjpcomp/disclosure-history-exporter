(() => {
  'use strict';
  const VERSION=chrome.runtime.getManifest().version;
  const KEY='__disclosureExportPrepV1';
  if(globalThis.__disclosureExporterPanelV1?.isConnected){globalThis.__disclosureExporterPanelV1.scrollIntoView();return;}
  if(globalThis[KEY]?.isConnected)return;
  const host=document.createElement('div');host.style.cssText='position:fixed;right:18px;top:18px;z-index:2147483647';
  document.documentElement.append(host);globalThis[KEY]=host;
  const root=host.attachShadow({mode:'closed'});
  const add=(tag,text,parent=root)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;parent.append(e);return e;};
  add('style',':host{all:initial}section{font:14px Arial,sans-serif;background:white;color:#17202a;width:330px;border:2px solid #2463b4;border-radius:10px;padding:18px;box-shadow:0 6px 30px #0005}h2{font-size:18px;margin:0 0 12px}p,output{line-height:1.5}button{font:inherit;padding:8px;margin:5px 6px 5px 0;cursor:pointer}output{display:block;white-space:pre-wrap}');
  const box=add('section');add('h2','Prepare disclosure history',box);
  add('p',`v${VERSION}: If this page has been open for a while, refresh it first. After reloading, click the extension icon again. Then prepare 100 rows and choose your export month.`,box);
  add('p','Clear search and all filters first. Preparation navigates to the first page. Refresh is optional and does not create a server snapshot.',box);
  const refresh=add('button','Refresh history',box),open=add('button','Set 100 rows & open exporter',box),close=add('button','Close',box),status=add('output','Ready.',box);
  status.setAttribute('aria-live','polite');
  let busy=false;
  const remove=()=>{host.remove();delete globalThis[KEY];};
  close.onclick=()=>{if(!busy)remove();};
  refresh.onclick=()=>{if(!busy&&window.confirm('Reload this history page? This discards the current page state. Once loading finishes, click the extension icon again.'))location.reload();};
  open.onclick=async()=>{
    if(busy)return;busy=true;open.disabled=refresh.disabled=close.disabled=true;
    try{
      if(document.querySelector('input[name="Search"]')?.value.trim())throw Error('Clear the history search first.');
      const select=document.querySelector('select[aria-label="Rows per page"]');
      if(!select||![...select.options].some(o=>o.value==='100'))throw Error('Open Disclosure History first. Its 100-row selector was not found.');
      status.textContent='Setting 100 rows per page...';
      if(select.value!=='100'){
        Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(select,'100');
        select.dispatchEvent(new Event('change',{bubbles:true}));
      }
      const sleep=ms=>new Promise(r=>setTimeout(r,ms));
      await sleep(1500);
      const first=document.querySelector('#pagination-container button[aria-label="First page"]');
      if(first&&!first.disabled&&first.getAttribute('aria-disabled')!=='true')first.click();
      const deadline=Date.now()+30000;let previous='',since=0,ready=false;
      while(Date.now()<deadline){
        await sleep(250);
        const p=document.querySelector('#pagination-container');
        const m=p?.textContent.match(/Showing\s+([\d,]+)\s*[-–]\s*([\d,]+)\s+of\s+([\d,]+)/i);
        const table=[...document.querySelectorAll('table')].find(t=>[...t.querySelectorAll('thead th')].some(h=>h.textContent.trim()==='Car Buyer Name'));
        const rows=table?[...table.querySelectorAll('tbody tr')]:[];
        if(!m||!table){previous='';since=0;continue;}
        const [a,b,total]=m.slice(1).map(n=>Number(n.replaceAll(',','')));
        if(document.querySelector('select[aria-label="Rows per page"]')?.value!=='100'||a!==1||b!==Math.min(100,total)||rows.length!==b){previous='';since=0;continue;}
        const signature=JSON.stringify([a,b,total,rows.map(r=>r.textContent)]);
        if(signature!==previous){previous=signature;since=Date.now();}
        if(Date.now()-since>=2500){ready=true;break;}
      }
      if(!ready)throw Error('Could not confirm a stable first page at 100 rows. Refresh history, reopen the extension, and retry.');
      status.textContent='Opening exporter...';
      const result=await chrome.runtime.sendMessage({type:'disclosure-open-exporter'});
      if(!result?.ok)throw Error(result?.error||'Could not open the exporter. Reload the extension and refresh this page.');
      remove();
    }catch(error){status.textContent=error.message;busy=false;open.disabled=refresh.disabled=close.disabled=false;}
  };
})();
