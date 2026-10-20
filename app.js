import {Poker,evaluate,labels} from './engine.js';
const $=id=>document.getElementById(id),fmt=n=>n.toLocaleString('en-US');
let game=new Poker(),timer,finished=0;
try{const saved=JSON.parse(localStorage.getItem('river-club-v1'));if(saved&&Array.isArray(saved.stacks)&&saved.stacks.length===4&&saved.stacks.every(n=>Number.isInteger(n)&&n>=0)&&saved.stacks.reduce((a,b)=>a+b,0)===8000){game.players.forEach((p,i)=>p.stack=saved.stacks[i]);game.hand=Number.isInteger(saved.hand)?saved.hand:0;finished=game.hand;}}catch{}
function card(c,back=false){return back?'<div class="card back" aria-label="未公開底牌">♠</div>':c?`<div class="card ${c.s===1||c.s===2?'red':''}" aria-label="${['黑桃','紅心','方塊','梅花'][c.s]}${c.r}"><span>${({11:'J',12:'Q',13:'K',14:'A'})[c.r]||c.r}</span><em>${['♠','♥','♦','♣'][c.s]}</em></div>`:'<div class="card empty">♠</div>';}
function save(){try{localStorage.setItem('river-club-v1',JSON.stringify({stacks:game.players.map(p=>p.stack),hand:game.hand}));}catch{}}
function render(){
 const you=game.players[0],won=game.awards||[];
 game.players.forEach((p,i)=>{const seat=$(`seat${i}`);seat.classList.toggle('active',!game.done&&game.turn===i);seat.classList.toggle('folded',p.folded);seat.innerHTML=`${i===0?'':`<div class="avatar" style="background:${['','#6e7161','#8d6c5b','#5d7180'][i]}">${['','A','M','L'][i]}</div>`}<div class="cards">${p.cards.map(c=>card(c,i!==0&&(!game.done||p.folded||game.board.length<5))).join('')}</div><div class="seatbox">${game.dealer===i?'<b class="dealer">D</b>':''}<span class="name">${p.name}${i===0?' · YOU':''}</span><strong class="stack">◉ ${fmt(p.stack)}</strong></div><div class="playeraction">${game.done&&won.some(w=>w.i===i)?'贏得 +'+fmt(won.find(w=>w.i===i).amount):p.action}</div>`;});
 $('board').innerHTML=Array.from({length:5},(_,i)=>card(game.board[i])).join('');$('pot').textContent=fmt(game.pot);$('street').textContent=game.done?'本手結束':['翻牌前 · PRE-FLOP','翻牌 · FLOP','轉牌 · TURN','河牌 · RIVER'][game.street];$('hand').textContent=`第 ${game.hand} 手`;
 $('balance').textContent=fmt(you.stack);$('profit').textContent=(you.stack>=2000?'+':'')+fmt(you.stack-2000);$('played').textContent=finished;
 $('log').replaceChildren(...game.log.map(s=>{const li=document.createElement('li');li.textContent=s;return li;}));
 $('message').textContent=game.done?game.result:game.board.length>=3&&!you.folded?`你的目前牌型：${labels[evaluate([...you.cards,...game.board])[0]]}`:'兩張底牌，無限可能。';
 const human=!game.done&&game.turn===0;$('betting').hidden=game.done;$('next').hidden=!game.done;const over=you.stack===0||game.players.filter(p=>p.stack>0).length<2;
 $('next').textContent=over?'本場結束 · 重新開局 ↻':'下一手 →';$('hint').textContent=game.done?'本手已結算':human?'輪到你了':`${game.players[game.turn].name} 正在思考…`;
 const o=game.options();$('owed').textContent=game.done?'':human?o.call?`需跟注 ${fmt(Math.min(o.call,you.stack))}`:'你可以免費過牌':'等待對手行動';
 ['fold','call','bet','raise'].forEach(id=>$(id).disabled=!human);document.querySelectorAll('[data-size]').forEach(b=>b.disabled=!human||!o?.canRaise);
 if(human){$('call').innerHTML=o.call?`跟注 ${fmt(Math.min(o.call,you.stack))}<small>${o.call>=you.stack?'ALL IN':'CALL'}</small>`:'過牌<small>CHECK</small>';$('bet').disabled=!o.canRaise;$('raise').disabled=!o.canRaise;const minimum=Math.min(o.min,o.max);$('raise').min=minimum;$('raise').max=o.max;$('raise').value=Math.max(minimum,Math.min(Number($('raise').value),o.max));updateRaise();}
}
function updateRaise(){$('raisevalue').textContent=fmt(Number($('raise').value));}
function progress(){clearTimeout(timer);if(game.done){finished=game.hand;save();render();return;}render();if(game.turn!==0)timer=setTimeout(()=>{game.ai();progress();},850+Math.random()*450);}
function restart(){clearTimeout(timer);game=new Poker();finished=0;save();game.start();progress();}
function next(){if(game.players[0].stack===0||game.players.filter(p=>p.stack>0).length<2){restart();return;}game.start();progress();}
[['fold','fold'],['call','call'],['bet','raise']].forEach(([id,type])=>$(id).onclick=()=>{if(game.turn===0&&game.act(type,Number($('raise').value)))progress();});
 $('raise').oninput=updateRaise;document.querySelectorAll('[data-size]').forEach(b=>b.onclick=()=>{const o=game.options();if(!o)return;const target={min:o.min,half:game.current+Math.max(game.minRaise,Math.floor(game.pot/2)),pot:game.current+Math.max(game.minRaise,game.pot),all:o.max}[b.dataset.size];$('raise').value=Math.min(o.max,Math.max(Math.min(o.min,o.max),target));updateRaise();});
 $('next').onclick=next;$('reset').onclick=()=>{if(confirm('重新開始會將所有玩家籌碼重設為 2,000。確定重新開局？'))restart();};$('rules').onclick=()=>$('ruleDialog').showModal();$('closeRules').onclick=()=>$('ruleDialog').close();$('ruleDialog').onclick=e=>{if(e.target===$('ruleDialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}};
if(game.players[0].stack===0||game.players.filter(p=>p.stack>0).length<2){game.result='本場已結束。重新開局，再挑戰一次。';render();}else{game.start();progress();}
