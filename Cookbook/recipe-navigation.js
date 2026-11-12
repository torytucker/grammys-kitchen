'use strict';
const recipePageMedia=matchMedia('(max-width: 700px)');
let recipeListScroll=0,ignoredRecipeCloses=0;
function isMobileRecipePage(){return document.body.classList.contains('recipe-page')}
function recipeRouteId(){if(!location.hash.startsWith('#recipe/'))return null;try{return decodeURIComponent(location.hash.slice(8))}catch{return null}}
function presentRecipeView(id,sameRecipe=false){
 const detail=document.querySelector('#detail');
 if(recipePageMedia.matches){
  const alreadyPage=isMobileRecipePage();
  if(!alreadyPage){recipeListScroll=window.scrollY;if(detail.open){ignoredRecipeCloses++;detail.close()}document.body.classList.add('recipe-page');}
  if(!detail.open)detail.show();
  const route='#recipe/'+encodeURIComponent(id);
  if(location.hash!==route){if(alreadyPage)history.replaceState(history.state,'',route);else history.pushState({grammysRecipePage:true},'',route)}
  if(!sameRecipe)window.scrollTo({top:0,behavior:'instant'});
  document.title=(recipes.find(r=>r.id===id)?.title||'Recipe')+' · Grammy’s Kitchen';
 }else{
  if(isMobileRecipePage()){ignoredRecipeCloses++;detail.close();document.body.classList.remove('recipe-page');window.scrollTo({top:recipeListScroll,behavior:'instant'})}
  if(!detail.open)detail.showModal();
 }
}
function restoreRecipeList(){
 saveFamilyNotes();
 for(const id of ['original-photo','share-recipe','editor']){const dialog=document.getElementById(id);if(dialog?.open)dialog.close()}
 const detail=document.querySelector('#detail');const wasPage=isMobileRecipePage();document.body.classList.remove('recipe-page');
 if(detail.open){ignoredRecipeCloses++;detail.close()}
 document.title='Grammy’s Kitchen';
 if(wasPage)requestAnimationFrame(()=>window.scrollTo({top:recipeListScroll,behavior:'instant'}));
}
function backToRecipeMenu(){
 saveFamilyNotes();
 if(recipeRouteId()&&history.state?.grammysRecipePage){history.back()}
 else{history.replaceState(null,'',location.pathname+location.search);restoreRecipeList()}
}
function applyRecipeRoute(){
 const id=recipeRouteId();
 if(!id){if(isMobileRecipePage()||document.querySelector('#detail').open)restoreRecipeList();return}
 if(!recipes.some(r=>r.id===id)){history.replaceState(null,'',location.pathname+location.search);restoreRecipeList();toast('That recipe is no longer in this cookbook.');return}
 if(document.querySelector('#detail').open&&currentId===id)return;
 openRecipe(id);
}
document.addEventListener('click',event=>{
 if(event.target.closest('[data-recipe-back]')||(isMobileRecipePage()&&event.target.closest('a.brand'))){event.preventDefault();backToRecipeMenu()}
});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&isMobileRecipePage()&&!document.querySelector('dialog:modal')){event.preventDefault();backToRecipeMenu()}});
document.querySelector('#detail').addEventListener('close',()=>{
 if(ignoredRecipeCloses){ignoredRecipeCloses--;return}
 if(isMobileRecipePage())backToRecipeMenu();
 else if(recipeRouteId()){history.replaceState(null,'',location.pathname+location.search);document.title='Grammy’s Kitchen'}
});
window.addEventListener('popstate',applyRecipeRoute);window.addEventListener('hashchange',applyRecipeRoute);
recipePageMedia.addEventListener('change',()=>{if(document.querySelector('#detail').open)presentRecipeView(currentId,true)});
if(recipeRouteId())applyRecipeRoute();
