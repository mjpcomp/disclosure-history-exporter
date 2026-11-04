async function inject(tabId, file) {
  await chrome.scripting.executeScript({target:{tabId},files:[file]});
}
chrome.action.onClicked.addListener(async tab => {
  if (!tab.id) return;
  try {
    await inject(tab.id, 'prepare.js');
    await chrome.action.setBadgeText({tabId:tab.id,text:''});
    await chrome.action.setTitle({tabId:tab.id,title:'Open Disclosure History Exporter'});
  } catch (error) {
    await chrome.action.setBadgeText({tabId:tab.id,text:'!'});
    await chrome.action.setTitle({tabId:tab.id,title:'Open the signed-in Disclosure History webpage, then click again.'});
    console.warn('Exporter could not open on this tab:', error.message);
  }
});
chrome.runtime.onMessage.addListener((message,sender,respond) => {
  if(message?.type!=='disclosure-open-exporter'||sender.id!==chrome.runtime.id||!sender.tab?.id)return;
  inject(sender.tab.id,'content.js').then(()=>respond({ok:true}),error=>respond({ok:false,error:error.message}));
  return true;
});
