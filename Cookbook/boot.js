'use strict';
(async()=>{
 const grid=document.querySelector('#grid');grid.textContent='Opening the cookbook…';
 for(const button of document.querySelectorAll('button'))button.disabled=true;
 try{
  const [catalog,baseline]=await Promise.all(['./data/catalog.v2.json','./data/legacy-baseline.json'].map(async path=>{const response=await fetch(path);if(!response.ok)throw Error('Cookbook files could not be loaded.');return response.json()}));
  window.COOKBOOK_CATALOG=catalog;
  window.COOKBOOK_INITIAL=await CookbookStore.prepare(catalog,baseline);
  for(const file of ['timer.js','checklists.js','app.js','share-recipe.js','recipe-navigation.js'])await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=file+'?v=46';script.onload=resolve;script.onerror=()=>reject(Error('A cookbook file is missing: '+file));document.body.append(script)});
  for(const button of document.querySelectorAll('button'))button.disabled=false;
  // Render restores browsing and form states after initial controls were disabled.
  render();try{const earlier=await CookbookStore.dbGet('backups','before-v2-migration');document.querySelector('#earlier-backup').hidden=!earlier?.raw}catch{}if(CookbookStore.notice)toast(CookbookStore.notice);
 }catch(error){grid.textContent=(error.message||'Cookbook could not be opened.')+' Refresh while online to try again.';for(const button of document.querySelectorAll('button'))button.disabled=true}
})();
