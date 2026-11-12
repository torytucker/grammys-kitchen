'use strict';
const $ = s => document.querySelector(s);
const KEY='grammys-kitchen-v1';
// Family convention: all recipe temperatures are Fahrenheit unless no temperature is supplied.
function fahrenheitText(value){return String(value||'').replace(/\s*\(scale not (?:printed|written)\)/gi,'').replace(/\s*The printed recipe does not state the temperature scale\./gi,'').replace(/(\d+(?:\.\d+)?)\s*°(?!\s*C\b)(?:\s*(?:F\b|Fahrenheit\b))?/gi,'$1°F').replace(/(\d+(?:\.\d+)?)\s+degrees(?:\s+(?:F\b|Fahrenheit\b))?/gi,'$1°F').trim()}
function fahrenheitTemperature(value){const text=fahrenheitText(value);const numeric=text.match(/^(\d+(?:\.\d+)?(?:\s*[–-]\s*\d+(?:\.\d+)?)?)\s*(?:F|Fahrenheit)?$/i);return numeric?numeric[1]+'°F':text}

const RECIPE_COVERS=Object.fromEntries(COOKBOOK_CATALOG.recipes.filter(r=>r.cover).map(r=>[r.id,r.cover]));
function photoFor(r){return CookbookStore.photoUrl(r.photo||'')}
function coverFor(r){return CookbookStore.photoUrl(r.cover||RECIPE_COVERS[r.id]||r.photo||'')}
function inferCookMethod(recipe){const steps=(recipe.steps||[]).join(' ');if(/\b(?:bake|baking|roast|roasting|overbake)\b/i.test(steps))return 'Bake';if(/\b(?:cook|boil|simmer|sauté|fry|microwave|grill|heat)\b/i.test(steps))return 'Cook';if(/refrigerate|chill/i.test(steps))return 'Chill';if(/freeze/i.test(steps))return 'Freeze';return 'Cook'}
function shortRecipeTime(value){return String(value||'').replace(/\bminutes?\b/gi,'min').replace(/\bhours?\b/gi,'hr').replace(/\bseconds?\b/gi,'sec')}
function recipeTimingLabels(recipe){
 const prep=recipe.prepTime||({'Drinks':'5 minutes','Sauces':'10 minutes','Breakfast':'10 minutes'}[categoryFor(recipe)]||'15 minutes');
 const estimated=!recipe.prepTime||recipe.prepTimeEstimated!==false;
 const method=recipe.cookMethod||inferCookMethod(recipe),time=recipe.cookTime||recipe.time||'—';
 return ['Prep: '+(estimated?'~':'')+shortRecipeTime(prep),method+': '+shortRecipeTime(time)];
}
function recipeTimingMarkup(recipe){const labels=recipeTimingLabels(recipe);return `<div class="card-times"><span title="${recipe.prepTimeEstimated!==false?'Estimated active preparation; excludes cooking, rising and chilling.':'Active preparation time.'}">${escapeHTML(labels[0])}</span><span>${escapeHTML(labels[1])}</span></div>`}

const seed=COOKBOOK_CATALOG.recipes;
let selectedCategory='';
let recipes=structuredClone(COOKBOOK_INITIAL), onlyFavorites=false, editingId=null, currentId=null, selectedPhoto='', installPrompt;
function toast(message){$('#toast').textContent=message;$('#toast').hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').hidden=true,5000)}
function escapeHTML(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function safePhoto(value){return CookbookStore.validMedia(value)}
function validate(data){if(!Array.isArray(data)||data.length>500)throw Error('Choose a valid backup containing up to 500 recipes.');const ids=new Set();return data.map(r=>{if(!r||typeof r.title!=='string'||!r.title.trim()||!Array.isArray(r.ingredients)||!Array.isArray(r.steps))throw Error('The backup contains an invalid recipe.');let id=typeof r.id==='string'?r.id:crypto.randomUUID();if(ids.has(id))throw Error('The backup has duplicate recipe IDs.');ids.add(id);const str=v=>typeof v==='string'?v.slice(0,20000):'';return {id,title:str(r.title).slice(0,120),category:str(r.category).slice(0,60),yield:str(r.yield),temperature:fahrenheitTemperature(str(r.temperature)),time:str(r.time),prepTime:str(r.prepTime||seed.find(item=>item.id===id)?.prepTime),prepTimeEstimated:r.prepTimeEstimated===undefined?(seed.find(item=>item.id===id)?.prepTimeEstimated!==false):!!r.prepTimeEstimated,cookTime:str(r.cookTime||(r.time===seed.find(item=>item.id===id)?.time?seed.find(item=>item.id===id)?.cookTime:r.time)),cookMethod:['Bake','Cook','Chill','Freeze','Rest'].includes(r.cookMethod)?r.cookMethod:(r.time===seed.find(item=>item.id===id)?.time?seed.find(item=>item.id===id)?.cookMethod:inferCookMethod(r))||inferCookMethod(r),ingredients:r.ingredients.slice(0,500).map(str),steps:r.steps.slice(0,500).map(str).map(fahrenheitText),notes:str(r.notes),sourceNotes:str(r.sourceNotes),unverified:r.unverified!==false,favorite:!!r.favorite,photo:safePhoto(r.photo),cover:safePhoto(r.cover)||seed.find(item=>item.id===id)?.cover||''}})}
recipes=validate(recipes);
function persist(next){try{CookbookStore.save(next);recipes=next;render();return true}catch(error){toast(error.message||'Could not save. Back up your recipes and check device storage.');return false}}
const COOKBOOK_CATEGORIES=['Breakfast','Cookies','Breads','Cakes','Pies','Desserts','Soups','Casseroles','Main dishes','Side dishes','Salads','Sauces','Drinks','Other'];
function categoryFor(recipe){
 const name=(recipe.category||'Other').trim().replace(/\s+/g,' ')||'Other';
 const aliases={pie:'Pies',pies:'Pies',cake:'Cakes',cakes:'Cakes',cookie:'Cookies',cookies:'Cookies',bread:'Breads',breads:'Breads',soup:'Soups',soups:'Soups',casserole:'Casseroles',casseroles:'Casseroles',salad:'Salads',salads:'Salads',dessert:'Desserts',desserts:'Desserts',sauce:'Sauces',sauces:'Sauces',drink:'Drinks',drinks:'Drinks','main dish':'Main dishes','main dishes':'Main dishes','side dish':'Side dishes','side dishes':'Side dishes'};
 const label=name.toLowerCase();
 const known=aliases[label]||COOKBOOK_CATEGORIES.find(c=>c.toLowerCase()===label);if(known)return known;
 // Broader dish type takes priority over protein in older/imported category labels.
 if(/\bsoups?\b|\bstews?\b/.test(label))return 'Soups';
 if(/\bcasseroles?\b/.test(label))return 'Casseroles';
 if(/\bsalads?\b/.test(label))return 'Salads';
 if(/\bpies?\b/.test(label))return 'Pies';
 if(/\bcakes?\b/.test(label))return 'Cakes';
 if(/\bcookies?\b/.test(label))return 'Cookies';
 if(/\bbreads?\b/.test(label))return 'Breads';
 if(/\bchicken\b|\bpork\b|\bbeef\b|\bfish\b|\bseafood\b|\bturkey\b|\bham\b|\blamb\b|\bvegetarian\b|\bdinner\b|\bentrees?\b/.test(label))return 'Main dishes';
 return 'Other';
}
function categoryGraphic(name){
 const paths={
 'All recipes':'<path d="M4 4h7c1 0 1 1 1 1s0-1 1-1h7v15h-7c-1 0-1 1-1 1s0-1-1-1H4zM12 5v15"/>',
 'Breakfast':'<path d="M3 14h18M5 14a7 7 0 0 1 14 0M12 3v3M4 7l2 2M20 7l-2 2M5 18h14"/>',
 'Cookies':'<path d="M20 12a8 8 0 1 1-8-8 5 5 0 0 0 8 8Z"/><circle cx="9" cy="10" r=".7"/><circle cx="8" cy="15" r=".7"/><circle cx="13" cy="16" r=".7"/>',
 'Breads':'<path d="M5 20V10C1 8 4 3 8 4a6 6 0 0 1 8 0c4-1 7 4 3 6v10ZM9 8v3M15 8v3"/>',
 'Desserts':'<path d="m4 11 16-5v14H4zM4 15h16M15 6V3"/><circle cx="15" cy="3" r="1"/>',
 'Soups':'<path d="M3 12h18a9 9 0 0 1-18 0ZM7 21h10M7 8c-3-2 3-3 0-5M12 8c-3-2 3-3 0-5M17 8c-3-2 3-3 0-5"/>',
 'Casseroles':'<path d="M5 10h14v9H5ZM2 12h3M19 12h3M4 8h16M10 5h4M8 13v3M12 13v3M16 13v3"/>',
 'Main dishes':'<circle cx="12" cy="12" r="6"/><path d="M2 4v6M4 4v6M3 10v10M22 4v16M22 4c-3 2-3 7 0 7"/>',
 'Side dishes':'<path d="M4 12h16a8 8 0 0 1-16 0ZM7 9l2-3M12 9V4M17 9l-2-3M7 21h10"/>',
 'Salads':'<path d="M4 13h16a8 8 0 0 1-16 0ZM12 12C5 12 5 5 5 5s7 0 7 7ZM12 12c0-8 7-8 7-8s1 7-7 8Z"/>',
 'Pies':'<path d="M3 11h18l-3 9H6ZM3 11c0-3 3-5 5-3 2-3 6-3 8 0 2-2 5 0 5 3M8 4l1 2M12 3v3M16 4l-1 2"/>',
 'Cakes':'<path d="M4 11h16v9H4ZM4 15c2 2 3-2 5 0s3-2 5 0 4-2 6 0M7 11V7h10v4M12 7V3"/><path d="M11 3c0-2 2-2 2 0"/>',
 'Sauces':'<path d="M4 11h13v8H4ZM17 12h3c3 0 3 5 0 5h-3M6 7c-2-2 2-2 0-4M11 7c-2-2 2-2 0-4"/>',
 'Drinks':'<path d="M5 8h14l-2 13H7ZM12 8l3-6h4M6 12h12"/>',
 'Other':'<circle cx="6" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="18" cy="12" r="1"/>'};
 return `<svg class="category-graphic" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${paths[name]||paths.Other}</svg>`;
}
function compareListingNames(a,b){return a.localeCompare(b,'en',{sensitivity:'base',numeric:true,ignorePunctuation:true})}
let browseCompactLockUntil=0,browseScrollQueued=false;
function measureBrowseNavigation(){
 const header=document.querySelector('body>header'),nav=$('.browse-nav');
 if(header)document.documentElement.style.setProperty('--site-header-height',header.getBoundingClientRect().height+'px');
 if(nav)document.documentElement.style.setProperty('--browse-nav-height',nav.getBoundingClientRect().height+'px');
}
function setBrowseCompact(compact,lock=false){
 if(lock)browseCompactLockUntil=performance.now()+800;
 document.body.classList.toggle('browse-compact',compact);measureBrowseNavigation();
}
function syncBrowseNavigation(){
 browseScrollQueued=false;
 if(document.body.classList.contains('recipe-page')||$('#detail').open||performance.now()<browseCompactLockUntil)return;
 if(window.scrollY>200)setBrowseCompact(true);
 else if(window.scrollY<40)setBrowseCompact(false);
}
window.addEventListener('scroll',()=>{if(!browseScrollQueued){browseScrollQueued=true;requestAnimationFrame(syncBrowseNavigation)}},{passive:true});
window.addEventListener('resize',measureBrowseNavigation);
$('#detail').addEventListener('close',()=>{browseCompactLockUntil=performance.now()+400});
if('ResizeObserver' in window){const browseObserver=new ResizeObserver(measureBrowseNavigation);browseObserver.observe(document.querySelector('body>header'));browseObserver.observe($('.browse-nav'))}
measureBrowseNavigation();
function render(){
 const categories=[...new Set(recipes.map(categoryFor))].sort(compareListingNames);
 const navScroll=$('#categories').scrollLeft;const favoriteFocused=document.activeElement?.id==='favorites';const focusedCategory=$('#categories').contains(document.activeElement)&&!favoriteFocused?document.activeElement.dataset.category:null;
 const categoryRecipes=onlyFavorites?recipes.filter(r=>r.favorite):recipes;
 const favoriteCount=recipes.filter(r=>r.favorite).length;
 if(selectedCategory&&!categories.includes(selectedCategory))selectedCategory='';
 const allLabel=onlyFavorites?'All favorites':'All recipes';
 const genreButtons=categories.map(c=>`<button type="button" class="category-chip" data-category="${escapeHTML(c)}" aria-pressed="${selectedCategory===c}">${categoryGraphic(c)}<span class="category-name">${escapeHTML(c)}</span><span class="category-count">${categoryRecipes.filter(r=>categoryFor(r)===c).length}</span></button>`).join('');
 $('#categories').innerHTML=`<button type="button" class="category-chip" data-category="" aria-pressed="${!selectedCategory}">${categoryGraphic('All recipes')}<span class="category-name">${allLabel}</span><span class="category-count">${categoryRecipes.length}</span></button><button type="button" id="favorites" class="category-chip favorites-chip" aria-pressed="${onlyFavorites}"><svg class="category-graphic" viewBox="0 0 24 24" aria-hidden="true" fill="${onlyFavorites?'currentColor':'none'}" stroke="currentColor" stroke-width="1.5"><path d="M12 20 4 12C-2 5 7-1 12 6c5-7 14-1 8 6Z"/></svg><span class="category-name">Favorites</span><span class="category-count">${favoriteCount}</span></button>${genreButtons}`;
 $('.section-title h2').textContent=onlyFavorites?'Favorite recipes':'Our family recipes';
 $('#categories').scrollLeft=navScroll;if(favoriteFocused)$('#favorites').focus({preventScroll:true});if(focusedCategory!==null){[...$('#categories').querySelectorAll('button')].find(b=>b.dataset.category===focusedCategory)?.focus({preventScroll:true})}
 const q=$('#search').value.trim().toLowerCase();
 const filtered=recipes.filter(r=>(!onlyFavorites||r.favorite)&&(!selectedCategory||categoryFor(r)===selectedCategory)&&[r.title,r.category,r.notes,...r.ingredients].join(' ').toLowerCase().includes(q)).sort((a,b)=>compareListingNames(a.title.trim(),b.title.trim())||compareListingNames(a.id,b.id));
 const visible=filtered;
 $('#count').textContent=`${filtered.length} ${filtered.length===1?'recipe':'recipes'}`;
 $('#empty').hidden=filtered.length>0;$('#empty').textContent=q?'No matching recipes. Try another search or category.':onlyFavorites?(selectedCategory?`No favorite recipes in ${selectedCategory} yet. Tap a recipe’s heart to save it.`:'No favorites yet. Tap a recipe’s heart to save it here.'):selectedCategory?`No recipes in ${selectedCategory} yet. Add one below.`:'No recipes yet. Add your first recipe below.';
 $('#grid').innerHTML=visible.map(r=>`<article class="card"><div class="card-heading"><h3><button type="button" class="card-link" data-action="open" data-id="${escapeHTML(r.id)}">${escapeHTML(r.title)}</button></h3><button class="favorite" data-action="favorite" data-id="${escapeHTML(r.id)}" aria-label="${r.favorite?'Remove from':'Add to'} favorites: ${escapeHTML(r.title)}" aria-pressed="${r.favorite}" title="${r.favorite?'Saved favorite — click to remove':'Save to favorites'}">${r.favorite?'♥':'♡'}</button></div><div class="card-top">${coverFor(r)?`<img src="${coverFor(r)}" alt="${escapeHTML(r.title)}${RECIPE_COVERS[r.id]?' — illustrative food image':' photo'}" loading="lazy">`:'✧'}</div><div class="card-body"><span class="tag">${escapeHTML(categoryFor(r))}</span>${r.yield?`<p class="card-yield">${escapeHTML(r.yield.replace(/ per batch \(handwritten note\)/,''))}</p>`:''}${recipeTimingMarkup(r)}</div></article>`).join('');

 
}
function openRecipe(id){const sameRecipe=currentId===id&&$('#detail').open;const recipeScroll=$('#detail').scrollTop;saveFamilyNotes();const r=recipes.find(r=>r.id===id);if(!r)return;currentId=id;$('#detail-content').innerHTML=`<div class="recipe-sticky"><button type="button" class="recipe-back" data-recipe-back>← Back to main menu</button><div><p class="eyebrow">${escapeHTML(categoryFor(r))}</p><h2 id="recipe-title">${escapeHTML(r.title)}</h2></div><div class="recipe-header-actions"><button type="button" class="recipe-favorite" data-detail="favorite" aria-label="${r.favorite?'Remove from':'Add to'} favorites" aria-pressed="${r.favorite}" title="${r.favorite?'Remove from favorites':'Save to favorites'}">${r.favorite?'♥':'♡'}</button><details class="recipe-timer-menu"><summary><span class="timer-menu-label">◷ Timer</span></summary>${timerMarkup(r)}</details><button class="icon close" aria-label="Close recipe">×</button></div></div><p class="muted">${escapeHTML([r.yield,r.temperature,...recipeTimingLabels(r)].filter(Boolean).join(' · '))}</p>${coverFor(r)?`<figure class="recipe-cover"><img src="${coverFor(r)}" alt="${escapeHTML(r.title)}${RECIPE_COVERS[r.id]?' — illustrative food image':' photo'}"></figure>`:''}<div class="recipe-columns"><section class="recipe-ingredients"><h3>Ingredients</h3>${renderIngredientSections(r)}</section><section class="recipe-directions"><div class="directions-heading">${r.steps.length?'<h3>Directions</h3>':''}<span id="step-progress" role="status"></span><button type="button" class="text" data-reset-checklist hidden>Reset checks</button></div>${renderDirections(r)}</section></div>${r.sourceNotes?`<p class="muted source-note">${escapeHTML(r.sourceNotes)}</p>`:''}<section class="family-notes"><label for="family-notes"><h3>Family notes</h3></label><textarea id="family-notes" data-recipe-id="${escapeHTML(r.id)}" rows="3" placeholder="Add your family notes…">${escapeHTML(r.notes)}</textarea><p id="notes-save-status" class="muted" role="status"></p></section>${RECIPE_COVERS[r.id]?'<p class="muted">Food image is illustrative.</p>':''}<div class="actions"><button data-detail="edit">Edit recipe</button>${r.photo?'<button class="secondary" data-detail="photo">Original recipe photo</button>':''}<button class="secondary" data-detail="print">Print</button><button class="secondary" data-share-recipe>Share</button><button class="text" data-detail="delete">Delete recipe</button></div>`;presentRecipeView(id,sameRecipe);if(!isMobileRecipePage()){$('#detail').scrollTop=sameRecipe?recipeScroll:0}paintCookingChecks();tickBakeTimer()}
function openEditor(id=null){editingId=id;const r=recipes.find(r=>r.id===id);const form=$('#recipe-form');form.reset();$('#form-error').textContent='';$('#editor-title').textContent=r?'Edit recipe':'Add a new recipe';for(const key of ['title','category','yield','temperature','prepTime','time','notes'])form.elements[key].value=key==='category'?(r?categoryFor(r):''):(r?.[key]||'');for(const key of ['ingredients','steps'])form.elements[key].value=(r?.[key]||[]).join('\n');selectedPhoto=r?.photo||'';$('#photo-preview').src=CookbookStore.photoUrl(selectedPhoto);$('#photo-preview').hidden=!selectedPhoto;$('#editor').showModal();$('#editor').scrollTop=0}
$('#grid').addEventListener('click',e=>{const b=e.target.closest('button[data-action]');if(!b)return;const r=recipes.find(r=>r.id===b.dataset.id);if(!r)return;if(b.dataset.action==='open')openRecipe(r.id);else persist(recipes.map(x=>x.id===r.id?{...x,favorite:!x.favorite}:x))});
$('#detail').addEventListener('click',e=>{const action=e.target.closest('[data-detail]')?.dataset.detail;const r=recipes.find(r=>r.id===currentId);if(!action||!r)return;if(action==='edit'){if(!isMobileRecipePage())$('#detail').close();openEditor(r.id)}if(action==='favorite'&&persist(recipes.map(x=>x.id===r.id?{...x,favorite:!x.favorite}:x)))openRecipe(r.id);if(action==='photo'&&r.photo){$('#original-photo-content').innerHTML=`<div class="photo-heading"><h2>Original recipe photo</h2><button class="icon close" aria-label="Close original recipe photo">×</button></div><p class="muted">${escapeHTML(r.title)}</p><img class="original-scan" src="${photoFor(r)}" alt="Original recipe photo for ${escapeHTML(r.title)}">`;$('#original-photo').showModal()}if(action==='print')window.print();if(action==='delete'&&confirm(`Delete “${r.title}” from this device? Export a backup first if you want to keep it.`)&&persist(recipes.filter(x=>x.id!==r.id)))$('#detail').close()});
document.addEventListener('click',e=>{if(e.target.closest('.close'))e.target.closest('dialog').close()});
$('#add').onclick=()=>openEditor();$('#search').oninput=()=>{render();if(getComputedStyle($('.browse-nav')).position==='sticky')scrollToRecipeResults()};
$('#category-menu').onclick=()=>{const expanded=$('#category-menu').getAttribute('aria-expanded')!=='true';$('#category-menu').setAttribute('aria-expanded',String(expanded));$('#categories').hidden=!expanded;measureBrowseNavigation()};
$('#categories').onclick=e=>{if(e.target.closest('#favorites')){onlyFavorites=!onlyFavorites;selectedCategory='';render();scrollToRecipeResults();return}const button=e.target.closest('[data-category]');if(!button)return;selectedCategory=button.dataset.category;render();scrollToRecipeResults()};
function scrollToRecipeResults(){setBrowseCompact(true,true);const nav=$('.browse-nav');const navHeight=getComputedStyle(nav).position==='sticky'?nav.getBoundingClientRect().height:0;const top=$('#grid').getBoundingClientRect().top+window.scrollY-navHeight-document.querySelector('body>header').getBoundingClientRect().height-18;window.scrollTo({top:Math.max(0,top),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})}
let photoLoading=false;
$('#photo').onchange=async e=>{const file=e.target.files[0];if(!file)return;photoLoading=true;$('#form-error').textContent='Preparing photo…';try{if(!file.type.startsWith('image/'))throw Error('Please choose an image.');if(file.size>25000000)throw Error('Choose an image smaller than 25 MB.');const bitmap=await createImageBitmap(file);const scale=Math.min(1,1800/Math.max(bitmap.width,bitmap.height));const canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);const ctx=canvas.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();selectedPhoto=await CookbookStore.storePhoto(canvas.toDataURL('image/jpeg',.8));$('#photo-preview').src=CookbookStore.photoUrl(selectedPhoto);$('#photo-preview').hidden=false;$('#recipe-form').elements.removePhoto.checked=false;$('#form-error').textContent=''}catch(err){$('#form-error').textContent=err.message||'This image could not be opened. Try a JPEG or PNG.'}finally{photoLoading=false}};
$('#recipe-form').onsubmit=e=>{e.preventDefault();if(photoLoading){$('#form-error').textContent='Please wait for the photo to finish.';return}const f=e.target.elements;const title=f.title.value.trim();if(!title){$('#form-error').textContent='Enter a recipe name.';return}const existing=recipes.find(r=>r.id===editingId);const r={id:editingId||crypto.randomUUID(),title,category:categoryFor({category:f.category.value}),yield:f.yield.value.trim(),temperature:fahrenheitTemperature(f.temperature.value),time:f.time.value.trim(),prepTime:f.prepTime.value.trim(),prepTimeEstimated:existing?.prepTime===f.prepTime.value.trim()?existing.prepTimeEstimated:false,cookTime:existing?.time===f.time.value.trim()?existing.cookTime:f.time.value.trim(),cookMethod:existing?.cookMethod&&existing.steps.join('\n')===f.steps.value?existing.cookMethod:inferCookMethod({steps:f.steps.value.split('\n')}),notes:f.notes.value,sourceNotes:existing?.sourceNotes||'',ingredients:f.ingredients.value.split('\n').map(s=>s.trim()).filter(Boolean),steps:f.steps.value.split('\n').map(s=>fahrenheitText(s)).filter(Boolean),cover:existing?.cover||'',unverified:existing?.unverified??true,favorite:existing?.favorite||false,photo:f.removePhoto.checked?'':selectedPhoto};const next=existing?recipes.map(x=>x.id===editingId?r:x):[...recipes,r];if(persist(next)){$('#editor').close();toast('Recipe saved on this device.');openRecipe(r.id)}else $('#form-error').textContent='Recipe was not saved. Export a backup or try a smaller photo.'};
$('#export').onclick=async()=>{try{saveFamilyNotes();toast('Preparing your backup, including pictures…');const portable=await CookbookStore.bundle(recipes);const blob=new Blob([JSON.stringify(portable)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`grammys-kitchen-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Backup prepared. Keep the downloaded JSON file safe.')}catch(error){toast(error.message||'The backup could not be prepared.')}};
$('#import').onclick=()=>$('#backup-file').click();$('#backup-file').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>250000000)throw Error('Backup must be smaller than 250 MB.');const data=JSON.parse(await file.text());const next=validate(CookbookStore.unpack(data));if(confirm(`Replace the ${recipes.length} recipes on this device with ${next.length} recipes from the backup?`)){await CookbookStore.hydrate(next);if(persist(next))toast('Backup restored.')}}catch(err){toast(err.message||'Unable to restore this backup.')}e.target.value=''};
$('#earlier-backup').onclick=async()=>{try{const earlier=await CookbookStore.dbGet('backups','before-v2-migration');if(!earlier?.raw)throw Error('No earlier backup is available.');const blob=new Blob([JSON.stringify({version:1,exportedAt:earlier.savedAt,recipes:JSON.parse(earlier.raw)},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='grammys-kitchen-before-update.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Earlier backup prepared.')}catch(error){toast(error.message||'The earlier backup could not be opened.')}};
$('#install').onclick=()=>$('#help').showModal();window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;$('#native-install').hidden=false});$('#native-install').onclick=async()=>{if(!installPrompt)return;await installPrompt.prompt();installPrompt=null;$('#native-install').hidden=true};
render();
if('serviceWorker' in navigator && location.protocol!=='file:')navigator.serviceWorker.register('./sw.js').catch(()=>toast('Offline setup unavailable. You can still use the cookbook while online.'));

if('serviceWorker' in navigator){let refreshing=false;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(refreshing)return;if($('#editor').open||bakeTimer?.status==='running'||bakeTimer?.status==='paused'){toast('An update is ready. Finish your current activity, then reopen the cookbook.');return}refreshing=true;location.reload()})}

let familyNotesTimer;
function saveFamilyNotes(){
 clearTimeout(familyNotesTimer);
 const field=$('#family-notes');if(!field)return;
 const recipe=recipes.find(r=>r.id===field.dataset.recipeId);if(!recipe||field.value===recipe.notes)return;
 const saved=persist(recipes.map(r=>r.id===recipe.id?{...r,notes:field.value}:r));
 const status=$('#notes-save-status');if(status)status.textContent=saved?'Saved on this device':'Notes could not be saved. Keep a copy and try again.';
}
$('#detail').addEventListener('input',event=>{if(event.target.id!=='family-notes')return;$('#notes-save-status').textContent='Saving…';clearTimeout(familyNotesTimer);familyNotesTimer=setTimeout(saveFamilyNotes,600)});
$('#detail').addEventListener('change',event=>{if(event.target.id==='family-notes')saveFamilyNotes()});
$('#detail').addEventListener('close',saveFamilyNotes);

function syncSiteHeaderHeight(){const header=document.querySelector('body>header');document.documentElement.style.setProperty('--site-header-height',header.getBoundingClientRect().height+'px')}
syncSiteHeaderHeight();window.addEventListener('resize',syncSiteHeaderHeight);if('ResizeObserver' in window)new ResizeObserver(syncSiteHeaderHeight).observe(document.querySelector('body>header'));
