'use strict';
const SHARE_PAGE={width:1080,height:1800,margin:72,bottom:1690};
let recipeShare={id:null,files:[],urls:[],generation:0};
function wrapShareText(context,text,width,font){
 context.font=font;const lines=[];
 for(const paragraph of String(text||'').split('\n')){
  let line='';
  for(const word of paragraph.split(/\s+/).filter(Boolean)){
   if(context.measureText(line?(line+' '+word):word).width<=width){line=line?line+' '+word:word;continue}
   if(line){lines.push(line);line=''}
   let piece='';for(const char of word){if(piece&&context.measureText(piece+char).width>width){lines.push(piece);piece=''}piece+=char}line=piece;
  }
  lines.push(line);
 }
 return lines;
}
function shareRecipeBlocks(recipe,includeNotes){
 const blocks=[];
 for(const group of ingredientSections(recipe)){
  if(group.name)blocks.push({kind:'group',text:group.name});
  group.items.forEach(item=>blocks.push({kind:'ingredient',text:item.text}));
 }
 blocks.unshift({kind:'heading',text:'Ingredients'});
 if(!recipe.ingredients.length)blocks.push({kind:'paragraph',text:'No ingredients entered.'});
 blocks.push({kind:'heading',text:'Directions'});
 if(!recipe.steps.length)blocks.push({kind:'paragraph',text:'No directions entered.'});
 recipe.steps.forEach((step,index)=>blocks.push({kind:'step',text:step,number:index+1}));
 if(recipe.sourceNotes)blocks.push({kind:'note',text:recipe.sourceNotes});
 if(includeNotes&&recipe.notes){blocks.push({kind:'heading',text:'Family notes'});blocks.push({kind:'paragraph',text:recipe.notes})}
 return blocks;
}
function planSharePages(context,recipe,options={}){
 const pages=[];let page,y;
 const bodyWidth=SHARE_PAGE.width-2*SHARE_PAGE.margin;
 const startPage=()=>{
  if(pages.length>=20)throw Error('This recipe is too long for an image set. Use Print to save it instead.');
  page={lines:[],header:[],cover:false};pages.push(page);
  let top=65;
  page.header.push({text:'Grammy’s Kitchen',x:72,y:top,font:'30px Georgia',color:'#785366'});top+=47;
  const titleLines=wrapShareText(context,recipe.title,bodyWidth,'50px Georgia');
  for(const text of titleLines){page.header.push({text,x:72,y:top,font:'50px Georgia',color:'#342c32'});top+=59}
  const metadata=[recipe.category,recipe.yield,recipe.temperature,recipe.time].filter(Boolean).join(' · ');
  for(const text of wrapShareText(context,metadata,bodyWidth,'22px sans-serif')){if(text){page.header.push({text,x:72,y:top+6,font:'22px sans-serif',color:'#70666d'});top+=31}}
  y=top+35;page.ruleY=y-15;
  if(pages.length===1&&options.includePhoto){page.cover=true;page.coverY=y;y+=250;if(RECIPE_COVERS[recipe.id]){page.lines.push({text:'Illustrative food image',x:72,y:y+2,font:'17px sans-serif',color:'#70666d'});y+=27}y+=22}
 };
 startPage();
 for(const block of shareRecipeBlocks(recipe,options.includeNotes)){
  const heading=block.kind==='heading',group=block.kind==='group',note=block.kind==='note';
  const font=heading?'36px Georgia':group?'bold 23px sans-serif':note?'24px sans-serif':'28px sans-serif';
  const lineHeight=heading?46:group?33:note?34:40;
  const indent=block.kind==='step'?42:block.kind==='ingredient'?22:0;
  const before=heading?21:group?12:8,after=heading?9:group?2:6;
  const lines=wrapShareText(context,block.text,bodyWidth-indent,font);
  if(y+before+lineHeight+(heading||group?80:0)>SHARE_PAGE.bottom)startPage();
  y+=before;
  lines.forEach((text,index)=>{
   if(y+lineHeight>SHARE_PAGE.bottom){startPage();if(block.kind==='step'&&index>0){page.lines.push({text:`Step ${block.number} continued`,x:72,y,font:'20px sans-serif',color:'#785366'});y+=32}}
   if(block.kind==='step'&&index===0)page.lines.push({text:block.number+'.',x:72,y,font:'28px sans-serif',color:'#785366'});
   if(block.kind==='ingredient'&&index===0)page.lines.push({text:'•',x:72,y,font:'28px sans-serif',color:'#785366'});
   page.lines.push({text,x:72+indent,y,font,color:heading||group?'#785366':note?'#70666d':'#342c32'});y+=lineHeight;
  });
  y+=after;
 }
 return pages;
}
function drawCoverImage(context,image,y){const width=936,height=250,scale=Math.max(width/image.naturalWidth,height/image.naturalHeight),sw=width/scale,sh=height/scale;context.drawImage(image,(image.naturalWidth-sw)/2,(image.naturalHeight-sh)/2,sw,sh,72,y,width,height)}
async function createRecipeImages(recipe,options){
 let image=null;
 if(options.includePhoto){const source=coverFor(recipe);if(source){image=new Image();image.src=source;await image.decode()}else options={...options,includePhoto:false}}
 const scratch=document.createElement('canvas'),context=scratch.getContext('2d');
 const pages=planSharePages(context,recipe,options),files=[];
 const slug=recipe.title.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,80)||'family-recipe';
 for(let index=0;index<pages.length;index++){
  const canvas=document.createElement('canvas');canvas.width=SHARE_PAGE.width;canvas.height=SHARE_PAGE.height;const ctx=canvas.getContext('2d');
  ctx.fillStyle='#fdfbf9';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.textBaseline='top';
  ctx.strokeStyle='#decdd5';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(72,pages[index].ruleY);ctx.lineTo(1008,pages[index].ruleY);ctx.stroke();
  if(pages[index].cover&&image)drawCoverImage(ctx,image,pages[index].coverY);
  for(const line of [...pages[index].header,...pages[index].lines]){ctx.fillStyle=line.color;ctx.font=line.font;ctx.fillText(line.text,line.x,line.y)}
  ctx.strokeStyle='#decdd5';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(72,1720);ctx.lineTo(1008,1720);ctx.stroke();ctx.fillStyle='#785366';ctx.font='19px sans-serif';ctx.fillText('Grammy’s Kitchen · Family recipe',72,1742);ctx.textAlign='right';ctx.fillText(`${index+1} / ${pages.length}`,1008,1742);ctx.textAlign='left';
  const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('Could not create the recipe image.')),'image/png'));
  files.push(new File([blob],slug+(pages.length>1?`-${index+1}`:'')+'.png',{type:'image/png'}));canvas.width=0;canvas.height=0;
 }
 return files;
}
function clearShareUrls(){recipeShare.urls.forEach(url=>URL.revokeObjectURL(url));recipeShare.urls=[]}
async function regenerateRecipeShare(){
 const generation=++recipeShare.generation;const recipe=recipes.find(r=>r.id===recipeShare.id);if(!recipe)return;
 const status=document.querySelector('#share-status'),native=document.querySelector('#share-native');native.hidden=true;recipeShare.files=[];clearShareUrls();document.querySelector('#share-pages').innerHTML='';status.textContent='Preparing your recipe image…';
 try{
  const files=await createRecipeImages(recipe,{includeNotes:document.querySelector('#share-include-notes').checked,includePhoto:document.querySelector('#share-include-photo').checked});
  if(generation!==recipeShare.generation||!document.querySelector('#share-recipe').open)return;
  recipeShare.files=files;recipeShare.urls=files.map(file=>URL.createObjectURL(file));
  document.querySelector('#share-pages').innerHTML=files.map((file,index)=>`<figure class="share-page"><a class="share-download" href="${recipeShare.urls[index]}" download="${escapeHTML(file.name)}">Download ${files.length>1?'image '+(index+1):'image'} ↓</a><img src="${recipeShare.urls[index]}" alt="${escapeHTML(recipe.title)} recipe image, page ${index+1} of ${files.length}"></figure>`).join('');
  let canShare=false;try{canShare=!!navigator.share&&!!navigator.canShare&&navigator.canShare({files})}catch{}
  native.hidden=!canShare;native.textContent=files.length>1?'Share images':'Share image';
  status.textContent=`${files.length===1?'Your image is ready.':`${files.length} images are ready so the full recipe stays readable.`} ${canShare?'Choose Share or download below.':'Download below, then attach the image to a message.'}`;
 }catch(error){if(generation===recipeShare.generation)status.textContent=error.message||'Could not create the recipe image. Try leaving out the photo.'}
}
function openRecipeShare(id){saveFamilyNotes();const recipe=recipes.find(r=>r.id===id);if(!recipe)return;recipeShare.id=id;document.querySelector('#share-recipe-title').textContent='Share '+recipe.title;document.querySelector('#share-include-notes').checked=false;document.querySelector('#share-include-photo').checked=!!coverFor(recipe);document.querySelector('#share-recipe').showModal();regenerateRecipeShare()}
document.addEventListener('click',event=>{const button=event.target.closest('[data-share-recipe]');if(button)openRecipeShare(currentId)});
document.querySelector('#share-include-notes').addEventListener('change',regenerateRecipeShare);document.querySelector('#share-include-photo').addEventListener('change',regenerateRecipeShare);
document.querySelector('#share-native').addEventListener('click',async()=>{
 if(!recipeShare.files.length)return;const button=document.querySelector('#share-native');button.disabled=true;
 try{await navigator.share({files:recipeShare.files,title:recipes.find(r=>r.id===recipeShare.id)?.title||'Family recipe'})}
 catch(error){if(error.name!=='AbortError')document.querySelector('#share-status').textContent='Sharing is unavailable here. Use the download buttons below.'}
 finally{button.disabled=false}
});
document.querySelector('#share-recipe').addEventListener('close',()=>{recipeShare.generation++;clearShareUrls();recipeShare.files=[];document.querySelector('#share-pages').innerHTML=''});
