'use strict';
// Shared catalog stays in files; only personal differences live in browser storage.
const CookbookStore={
 key:'grammys-kitchen-personal-v2',db:null,catalog:[],legacy:[],urls:new Map(),readOnly:false,notice:'',
 fields:['title','category','yield','temperature','time','prepTime','prepTimeEstimated','cookTime','cookMethod','ingredients','steps','notes','sourceNotes','favorite','photo','cover'],
 async openDatabase(){
  this.db=await new Promise((resolve,reject)=>{const request=indexedDB.open('grammys-kitchen-media-v2',1);request.onupgradeneeded=()=>{request.result.createObjectStore('media');request.result.createObjectStore('backups')};request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);request.onblocked=()=>reject(Error('Close other cookbook tabs and reopen this one.'))});
 },
 async dbGet(store,key){return new Promise((resolve,reject)=>{const tx=this.db.transaction(store,'readonly'),request=tx.objectStore(store).get(key);request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)})},
 async dbPut(store,key,value){return new Promise((resolve,reject)=>{const tx=this.db.transaction(store,'readwrite');tx.objectStore(store).put(value,key);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Save was interrupted.'))})},
 validMedia(value){return typeof value==='string'&&( /^assets\/[a-zA-Z0-9_./-]+\.(?:png|jpe?g|webp)$/.test(value)&&!value.includes('..')||/^local-photo:[a-zA-Z0-9-]+$/.test(value)||/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(value)&&value.length<6000000)?value:''},
 photoUrl(value){return value?.startsWith('local-photo:')?this.urls.get(value)||'':this.validMedia(value)},
 async storePhoto(value){
  if(!value)return '';
  if(value.startsWith('local-photo:')){if(!this.urls.has(value)){const blob=await this.dbGet('media',value);if(!blob)throw Error('A saved photo is missing. Restore a backup before changing this recipe.');this.urls.set(value,URL.createObjectURL(blob))}return value}
  if(!value.startsWith('data:'))return this.validMedia(value);
  if(!this.validMedia(value))throw Error('Photo is not a supported image.');
  const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))).map(b=>b.toString(16).padStart(2,'0')).join('');
  const published=this.catalog.find(r=>r.legacyPhotoHash===hash);if(published)return published.photo;
  const token='local-photo:'+hash;const blob=await (await fetch(value)).blob();await this.dbPut('media',token,blob);this.urls.set(token,URL.createObjectURL(blob));return token;
 },
 cleanRecord(r){const result={id:r.id};for(const field of this.fields)if(r[field]!==undefined)result[field]=r[field];return result},
 diff(next){
  const overrides={},added=[],ids=new Set(next.map(r=>r.id));
  for(const r of next){const base=this.catalog.find(b=>b.id===r.id);if(!base){added.push(this.cleanRecord(r));continue}const delta={};for(const field of this.fields)if(JSON.stringify(r[field]??(field==='favorite'?false:''))!==JSON.stringify(base[field]??(field==='favorite'?false:'')))delta[field]=r[field];if(Object.keys(delta).length)overrides[r.id]=delta}
  return {version:2,catalogVersion:this.version,curationVersion:this.curationVersion,overrides,added,deleted:this.catalog.filter(r=>!ids.has(r.id)).map(r=>r.id)};
 },
 compose(personal){
  const deleted=new Set(personal.deleted||[]);return this.catalog.filter(r=>!deleted.has(r.id)).map(r=>({...r,...personal.overrides?.[r.id]})).concat(personal.added||[]);
 },
 save(next){
  if(this.readOnly)throw Error(this.notice||'Personal storage is unavailable.');
  const personal=this.diff(next);localStorage.setItem(this.key,JSON.stringify(personal));return true;
 },
 async hydrate(next){for(const r of next)for(const field of ['photo','cover'])if(r[field])r[field]=await this.storePhoto(r[field]);return next},
 async prepare(catalog,baseline){
  this.catalog=catalog.recipes;this.version=catalog.version;this.legacy=baseline;this.curationVersion=catalog.curationVersion||'';const retired=new Set(catalog.retiredRecipeIds||[]);
  try{
   await this.openDatabase();
   const saved=localStorage.getItem(this.key);
   if(saved){const state=JSON.parse(saved);if(state.version!==2||!state.overrides||!Array.isArray(state.added)||!Array.isArray(state.deleted))throw Error('Saved personal data could not be read.');if(this.curationVersion&&state.curationVersion!==this.curationVersion){await this.dbPut('backups','before-'+this.curationVersion,{savedAt:new Date().toISOString(),personal:state});state.added=state.added.filter(r=>!retired.has(r.id));const next=await this.hydrate(this.compose(state));this.save(next);return next}return await this.hydrate(this.compose(state))}
   const raw=localStorage.getItem('grammys-kitchen-v1');
   if(raw){
    // Retain an exact backup before transforming any earlier prototype data.
    await this.dbPut('backups','before-v2-migration',{savedAt:new Date().toISOString(),raw});
    const verified=await this.dbGet('backups','before-v2-migration');if(verified?.raw!==raw)throw Error('The pre-update backup could not be verified.');
    const old=JSON.parse(raw);if(!Array.isArray(old)||old.some(r=>!r||typeof r.id!=='string'||typeof r.title!=='string'||!Array.isArray(r.ingredients)||!Array.isArray(r.steps)))throw Error('The old recipe backup could not be read.');
    const publishedIds=new Set(this.catalog.map(r=>r.id));const present=new Set(old.map(r=>r.id));const next=this.catalog.filter(r=>!this.legacy.some(b=>b.id===r.id)||present.has(r.id)).map(r=>({...r}));
    for(const oldRecord of old){if(retired.has(oldRecord.id))continue;const base=this.legacy.find(r=>r.id===oldRecord.id);const target=next.find(r=>r.id===oldRecord.id);const clean=this.cleanRecord(oldRecord);await this.hydrate([clean]);if(base&&target){for(const field of this.fields){if(field==='cover'&&clean[field]===undefined)continue;if(JSON.stringify(clean[field]??(field==='favorite'?false:''))!==JSON.stringify(base[field]??(field==='favorite'?false:'')))target[field]=clean[field]}}else if(!publishedIds.has(clean.id))next.push(clean)}
    this.save(next);localStorage.removeItem('grammys-kitchen-v1');this.notice='Cookbook updated. Your personal changes and a pre-update backup were preserved.';return next;
   }
   // Empty personal state does not copy the catalog into localStorage.
   this.save(this.catalog);return structuredClone(this.catalog);
  }catch(error){this.readOnly=true;this.notice=(error?.message||'Personal storage is unavailable.')+' The shared cookbook is available; personal changes are disabled to protect saved data.';return structuredClone(this.catalog)}
 },
 async bundle(next){
  // Store a shared source photo once even when several recipes use the same page.
  const recipes=structuredClone(next),media={},known=new Map();
  for(const recipe of recipes)for(const field of ['photo','cover'])if(recipe[field]){
   const original=recipe[field];
   if(!known.has(original)){
    const url=this.photoUrl(original);if(!url)throw Error('A recipe photo is unavailable.');
    const response=await fetch(url);if(!response.ok)throw Error('A recipe photo could not be backed up. Connect to the internet and try again.');
    const blob=await response.blob(),value=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(blob)});
    if(!this.validMedia(value))throw Error('A recipe photo could not be backed up.');
    const key='image-'+String(known.size+1).padStart(4,'0');known.set(original,key);media[key]=value;
   }
   recipe[field]='backup-media:'+known.get(original);
  }
  return {version:3,exportedAt:new Date().toISOString(),recipes,media};
 },
 unpack(data){
  if(!data||![1,2,3].includes(data.version))throw Error('Unsupported backup version.');
  if(!Array.isArray(data.recipes)||data.recipes.length>500)throw Error('Choose a valid backup containing up to 500 recipes.');
  if(data.version!==3)return data.recipes;
  if(!data.media||typeof data.media!=='object'||Array.isArray(data.media)||Object.keys(data.media).length>1000)throw Error('The backup has an invalid picture collection.');
  const recipes=structuredClone(data.recipes);
  for(const recipe of recipes){
   if(!recipe||typeof recipe!=='object')throw Error('The backup contains an invalid recipe.');
   for(const field of ['photo','cover'])if(recipe[field]){
    const value=recipe[field];if(typeof value!=='string'||!/^backup-media:image-\d{4}$/.test(value))throw Error('A backup picture reference is invalid.');
    const key=value.slice(13),image=Object.hasOwn(data.media,key)?data.media[key]:'';
    if(typeof image!=='string'||!image.startsWith('data:image/')||!this.validMedia(image))throw Error('A picture is missing or invalid in this backup.');
    recipe[field]=image;
   }
  }
  return recipes;
 },
 async portable(next){
  const data=structuredClone(next);for(const r of data)for(const field of ['photo','cover'])if(r[field]){const url=this.photoUrl(r[field]);if(!url)throw Error('A recipe photo is unavailable.');const response=await fetch(url);if(!response.ok)throw Error('A recipe photo could not be backed up. Connect to the internet and try again.');const blob=await response.blob();r[field]=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(blob)})}return data;
 }
};
