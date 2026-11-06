'use strict';
// Explicit headings preserve the author's grouping; wet/dry categories are never inferred.
function ingredientSections(recipe){
 const groups=[];let current={name:'',items:[]};
 const hasLegacyFrosting=recipe.ingredients.some(line=>/^Frosting\s*:/i.test(line));
 if(hasLegacyFrosting)current.name=recipe.title==='Orange Juice Cookies'?'Cookies':'Ingredients';
 const finish=()=>{if(current.items.length)groups.push(current)};
 recipe.ingredients.forEach((line,index)=>{
  const heading=line.match(/^\[([^\]\n]+)\]$/);
  if(heading){finish();current={name:heading[1].trim(),items:[]};return}
  const frosting=line.match(/^Frosting\s*:\s*(.+)$/i);
  if(frosting){if(current.name!=='Frosting'){finish();current={name:'Frosting',items:[]}}current.items.push({text:frosting[1],index});return}
  current.items.push({text:line,index});
 });
 finish();return groups;
}
function renderIngredientSections(recipe){
 const groups=ingredientSections(recipe);
 if(!groups.length)return '<p class="muted">No ingredients entered yet.</p>';
 return groups.map(group=>`<div class="ingredient-section">${group.name?`<h4>${escapeHTML(group.name)}</h4>`:''}<div class="ingredient-grid">${group.items.map(item=>`<label class="ingredient"><input type="checkbox" data-check-kind="ingredients" data-check-index="${item.index}"><span>${escapeHTML(item.text)}</span></label>`).join('')}</div></div>`).join('');
}
const CHECKLIST_KEY='grammys-kitchen-cooking-checks-v1';
let cookingChecks={};
try{const saved=JSON.parse(sessionStorage.getItem(CHECKLIST_KEY));if(saved&&typeof saved==='object'&&!Array.isArray(saved))cookingChecks=saved}catch{}
function checklistFor(recipe){
 const signature=JSON.stringify([recipe.ingredients,recipe.steps]);let value=cookingChecks[recipe.id];
 if(!value||value.signature!==signature||!Array.isArray(value.ingredients)||!Array.isArray(value.steps))value={signature,ingredients:[],steps:[]};
 cookingChecks[recipe.id]=value;return value;
}
function saveCookingChecks(){try{sessionStorage.setItem(CHECKLIST_KEY,JSON.stringify(cookingChecks))}catch{}}
function paintCookingChecks(){
 const recipe=recipes.find(r=>r.id===currentId);if(!recipe)return;
 const value=checklistFor(recipe);
 document.querySelectorAll('#detail [data-check-kind]').forEach(input=>{input.checked=value[input.dataset.checkKind].includes(Number(input.dataset.checkIndex))});
 const count=document.querySelector('#step-progress');
 if(count)count.textContent=value.steps.length?`${value.steps.length} of ${recipe.steps.length} complete`:'';
 const reset=document.querySelector('[data-reset-checklist]');if(reset)reset.hidden=!value.steps.length&&!value.ingredients.length;
}
function renderDirections(recipe){
 if(!recipe.steps.length)return '<p class="muted">No directions entered yet.</p>';
 return '<ol class="direction-checklist">'+recipe.steps.map((step,index)=>`<li><label class="direction-step"><input type="checkbox" data-check-kind="steps" data-check-index="${index}" aria-label="${escapeHTML('Step '+(index+1)+': '+step)}"><span class="step-number" aria-hidden="true">${index+1}.</span><span class="step-text">${escapeHTML(step)}</span></label></li>`).join('')+'</ol>';
}
document.addEventListener('change',event=>{
 const input=event.target.closest('#detail [data-check-kind]');if(!input)return;
 const recipe=recipes.find(r=>r.id===currentId);if(!recipe)return;const value=checklistFor(recipe),kind=input.dataset.checkKind,index=Number(input.dataset.checkIndex);
 value[kind]=input.checked?[...new Set([...value[kind],index])]:value[kind].filter(i=>i!==index);
 saveCookingChecks();paintCookingChecks();
});
document.addEventListener('click',event=>{if(!event.target.closest('[data-reset-checklist]'))return;const recipe=recipes.find(r=>r.id===currentId);if(!recipe)return;const value=checklistFor(recipe);value.ingredients=[];value.steps=[];saveCookingChecks();paintCookingChecks()});
