'use strict';
// Timer deadlines use wall-clock time so delayed browser ticks do not stretch a bake.
const KitchenClock = {
  duration(text) {
    const value=String(text||'').toLowerCase().replace(/−|—/g,'–');
    const range=value.match(/^\s*(\d+(?:\.\d+)?)\s*(?:–|-|to)\s*(\d+(?:\.\d+)?)\s*(minutes?|mins?|hours?|hrs?)\b/);
    if(range){const factor=/^(hour|hr)/.test(range[3])?60:1;return {minutes:Number(range[1])*factor,max:Number(range[2])*factor}}
    const parts=[...value.matchAll(/(\d+(?:\.\d+)?)\s*(hours?|hrs?|minutes?|mins?)\b/g)];
    if(!parts.length)return {minutes:null,max:null};
    return {minutes:parts.reduce((sum,p)=>sum+Number(p[1])*(/^(hour|hr)/.test(p[2])?60:1),0),max:null};
  },
  remaining(timer,now=Date.now()){return timer.status==='running'?Math.max(0,timer.endsAt-now):timer.remaining},
  advance(timer,now=Date.now()) {
    if(!timer||timer.status!=='running')return {timer,events:[]};
    const remaining=this.remaining(timer,now),events=[];
    const next={...timer};
    // On returning after the deadline, announce completion rather than a stale turn reminder.
    if(remaining===0){next.status='done';next.remaining=0;next.message='Time’s up! Check your bake.';events.push('done')}
    else if(next.halfway&&!next.halfNotified&&remaining<=next.total/2){next.halfNotified=true;next.message='Halfway! Turn or rotate if needed.';events.push('halfway')}
    return {timer:next,events};
  }
};
let bakeTimer=null, timerAudio=null;
const TIMER_KEY='grammys-kitchen-timer-v1';
try{const value=JSON.parse(sessionStorage.getItem(TIMER_KEY));if(value&&typeof value.recipeId==='string'&&typeof value.title==='string'&&['running','paused','done'].includes(value.status)&&Number.isFinite(value.total)&&value.total>0&&value.total<=86400000&&Number.isFinite(value.endsAt)&&Number.isFinite(value.remaining))bakeTimer=value}catch{}
function saveBakeTimer(){try{if(bakeTimer)sessionStorage.setItem(TIMER_KEY,JSON.stringify(bakeTimer));else sessionStorage.removeItem(TIMER_KEY)}catch{}}
function clockText(ms){const seconds=Math.max(0,Math.ceil(ms/1000));return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`}
function timerMarkup(recipe){
 const parsed=KitchenClock.duration(recipe.time),minutes=parsed.minutes;
 return `<section class="kitchen-timer" aria-label="Kitchen timer"><div class="timer-heading"><h3>Kitchen timer</h3><span aria-hidden="true">◷</span></div><div data-timer-setup><div class="timer-options"><label for="timer-minutes">Minutes<input id="timer-minutes" type="number" min="0.1" max="1440" step="any" inputmode="decimal" value="${minutes||''}" placeholder="Set time"></label>${parsed.max&&parsed.max!==minutes?`<div class="timer-presets"><span class="muted">Recipe: ${minutes}–${parsed.max} min</span><button type="button" class="secondary" data-timer-preset="${minutes}">${minutes} min</button><button type="button" class="secondary" data-timer-preset="${parsed.max}">${parsed.max} min</button></div>`:''}</div><label class="timer-half"><input id="timer-halfway" type="checkbox"> Remind me to turn halfway</label><button type="button" data-timer-action="start">Start timer</button><p class="timer-error" role="alert"></p></div><div data-timer-active hidden><output class="timer-countdown" aria-label="Time remaining"></output><p class="timer-phase"></p><p class="timer-message" role="status" aria-live="polite"></p><div class="timer-buttons"><button type="button" data-timer-action="pause">Pause</button><button type="button" class="secondary" data-timer-action="reset">Reset</button></div></div><p class="timer-other" hidden></p><details class="timer-tips"><summary>Timer tips</summary><p>Keep the cookbook open for sound and reminders. Phone background or lock-screen alerts aren’t guaranteed. A halfway reminder keeps the full baking time running.</p></details></section>`;
}
function prepareTimerAudio(){try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;timerAudio??=new Audio();timerAudio.resume().catch(()=>{})}catch{}}
function timerBeep(){try{if(!timerAudio||timerAudio.state!=='running')return;for(let i=0;i<3;i++){const tone=timerAudio.createOscillator(),volume=timerAudio.createGain(),start=timerAudio.currentTime+i*.28;tone.frequency.value=740;tone.connect(volume);volume.connect(timerAudio.destination);volume.gain.setValueAtTime(0,start);volume.gain.linearRampToValueAtTime(.18,start+.02);volume.gain.exponentialRampToValueAtTime(.001,start+.19);tone.start(start);tone.stop(start+.2)}}catch{}}
function paintTimer(){
 const label=document.querySelector('.timer-menu-label');if(label)label.textContent=bakeTimer?.recipeId===currentId?'◷ '+(bakeTimer.status==='done'?'Done':clockText(KitchenClock.remaining(bakeTimer))):'◷ Timer';
 const panel=document.querySelector('.kitchen-timer');
 if(panel){const ours=bakeTimer?.recipeId===currentId;panel.querySelector('[data-timer-setup]').hidden=ours;panel.querySelector('[data-timer-active]').hidden=!ours;
 if(ours){const remaining=KitchenClock.remaining(bakeTimer);panel.querySelector('.timer-countdown').textContent=clockText(remaining);const half=clockText(bakeTimer.total/2);panel.querySelector('.timer-phase').textContent=bakeTimer.status==='done'?'Finished':bakeTimer.status==='paused'?'Paused':bakeTimer.halfway&&!bakeTimer.halfNotified?`Halfway reminder at ${half} remaining`:'Baking timer';const message=panel.querySelector('.timer-message');if(message.textContent!==bakeTimer.message)message.textContent=bakeTimer.message||'';const pause=panel.querySelector('[data-timer-action="pause"]');pause.hidden=bakeTimer.status==='done';pause.textContent=bakeTimer.status==='paused'?'Resume':'Pause';panel.querySelector('[data-timer-action="reset"]').textContent=bakeTimer.status==='done'?'Done':'Reset';}
 const other=panel.querySelector('.timer-other');other.hidden=!bakeTimer||ours;if(bakeTimer&&!ours)other.textContent=`${bakeTimer.title}: ${bakeTimer.status==='done'?'finished':clockText(KitchenClock.remaining(bakeTimer))+' remaining'}. Starting a new timer replaces it.`;
 }
 const dock=document.querySelector('#timer-dock');if(dock){dock.hidden=!bakeTimer;if(bakeTimer){dock.querySelector('span').textContent=`${bakeTimer.title} · ${bakeTimer.status==='done'?'Time’s up!':clockText(KitchenClock.remaining(bakeTimer))}${bakeTimer.status==='paused'?' · paused':''}`;dock.classList.toggle('timer-done',bakeTimer.status==='done');const notice=dock.querySelector('.timer-dock-message');if(notice.textContent!==bakeTimer.message)notice.textContent=bakeTimer.message||'';}}
}
function tickBakeTimer(){const result=KitchenClock.advance(bakeTimer);bakeTimer=result.timer;if(result.events.length){saveBakeTimer();timerBeep()}paintTimer()}
document.addEventListener('click',event=>{
 const preset=event.target.closest('[data-timer-preset]');if(preset){document.querySelector('#timer-minutes').value=preset.dataset.timerPreset;return}
 const button=event.target.closest('[data-timer-action]');if(!button)return;
 const action=button.dataset.timerAction;
 if(action==='open'){if(bakeTimer){const found=recipes.find(r=>r.id===bakeTimer.recipeId);if(found)openRecipe(found.id);else toast('The recipe for this timer is no longer in the cookbook.')}return}
 if(action==='start'){
  const panel=button.closest('.kitchen-timer'),input=panel.querySelector('#timer-minutes'),minutes=Number(input.value),error=panel.querySelector('.timer-error');
  if(!input.value.trim()||!Number.isFinite(minutes)||minutes<.1||minutes>1440){error.textContent='Enter a time between 0.1 and 1,440 minutes.';input.focus();return}
  if(bakeTimer&&bakeTimer.status!=='done'&&!confirm(`Replace the timer for ${bakeTimer.title}?`))return;
  const recipe=recipes.find(r=>r.id===currentId);if(!recipe)return;
  prepareTimerAudio();const total=Math.round(minutes*60000);bakeTimer={recipeId:recipe.id,title:recipe.title,total,remaining:total,endsAt:Date.now()+total,status:'running',halfway:panel.querySelector('#timer-halfway').checked,halfNotified:false,message:''};
 }
 if(action==='pause'&&bakeTimer){tickBakeTimer();if(bakeTimer.status==='running'){bakeTimer.remaining=KitchenClock.remaining(bakeTimer);bakeTimer.status='paused'}else if(bakeTimer.status==='paused'){prepareTimerAudio();bakeTimer.endsAt=Date.now()+bakeTimer.remaining;bakeTimer.status='running'}}
 if(action==='reset')bakeTimer=null;
 saveBakeTimer();paintTimer();
});
document.addEventListener('visibilitychange',tickBakeTimer);window.addEventListener('pageshow',tickBakeTimer);setInterval(tickBakeTimer,500);
