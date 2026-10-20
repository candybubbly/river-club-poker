export const labels=['高牌','一對','兩對','三條','順子','同花','葫蘆','四條','同花順'];
export function compare(a,b){for(let i=0;i<Math.max(a.length,b.length);i++){const d=(a[i]??0)-(b[i]??0);if(d)return d;}return 0;}
function five(cards){
 const ranks=cards.map(c=>c.r).sort((a,b)=>b-a), counts=new Map();
 ranks.forEach(r=>counts.set(r,(counts.get(r)||0)+1));
 const groups=[...counts].sort((a,b)=>b[1]-a[1]||b[0]-a[0]);
 const flush=cards.every(c=>c.s===cards[0].s), unique=[...new Set(ranks)];
 const straight=unique.length===5?(unique[0]-unique[4]===4?unique[0]:unique.join(',')==='14,5,4,3,2'?5:0):0;
 if(flush&&straight)return [8,straight];
 if(groups[0][1]===4)return [7,groups[0][0],groups[1][0]];
 if(groups[0][1]===3&&groups[1][1]===2)return [6,groups[0][0],groups[1][0]];
 if(flush)return [5,...ranks];if(straight)return [4,straight];
 if(groups[0][1]===3)return [3,...groups.map(g=>g[0])];
 if(groups[0][1]===2&&groups[1][1]===2)return [2,...groups.map(g=>g[0])];
 if(groups[0][1]===2)return [1,...groups.map(g=>g[0])];
 return [0,...ranks];
}
export function evaluate(cards){let best=[-1];for(let a=0;a<cards.length-4;a++)for(let b=a+1;b<cards.length-3;b++)for(let c=b+1;c<cards.length-2;c++)for(let d=c+1;d<cards.length-1;d++)for(let e=d+1;e<cards.length;e++){const score=five([cards[a],cards[b],cards[c],cards[d],cards[e]]);if(compare(score,best)>0)best=score;}return best;}
export class Poker {
 constructor(random=Math.random){this.random=random;this.players=['你','Alex','Mia','Leo'].map((name,i)=>({name,stack:2000,cards:[],folded:false,bet:0,total:0,action:'',i}));this.dealer=-1;this.hand=0;this.done=true;this.log=[];this.board=[];this.pot=0;}
 next(i,predicate){for(let n=1;n<=4;n++){const j=(i+n)%4;if(predicate(this.players[j]))return j;}return -1;}
 note(s){this.log.unshift(s);this.log=this.log.slice(0,60);}
 pay(i,n){const p=this.players[i],amount=Math.min(n,p.stack);p.stack-=amount;p.bet+=amount;p.total+=amount;this.pot+=amount;return amount;}
 start(){if(!this.done)return; if(this.players.filter(p=>p.stack>0).length<2)return;
 this.hand++;this.done=false;this.board=[];this.pot=0;this.street=0;this.current=20;this.minRaise=20;this.result='';this.awards=[];
 this.deck=Array.from({length:52},(_,i)=>({r:i%13+2,s:Math.floor(i/13)}));for(let i=51;i>0;i--){const j=Math.floor(this.random()*(i+1));[this.deck[i],this.deck[j]]=[this.deck[j],this.deck[i]];}
 this.players.forEach(p=>{p.cards=[];p.folded=p.stack===0;p.bet=0;p.total=0;p.action=p.folded?'已出局':'';p.acted=null;});
 this.dealer=this.next(this.dealer,p=>!p.folded);const sb=this.players.filter(p=>!p.folded).length===2?this.dealer:this.next(this.dealer,p=>!p.folded),bb=this.next(sb,p=>!p.folded);
 for(let n=0;n<2;n++)this.players.forEach(p=>{if(!p.folded)p.cards.push(this.deck.pop());});
 this.pay(sb,10);this.players[sb].action='小盲 10';this.pay(bb,20);this.players[bb].action='大盲 20';this.pending=new Set(this.players.filter(p=>!p.folded&&p.stack>0).map(p=>p.i));this.turn=bb;this.note(`第 ${this.hand} 手開始 · 盲注 10 / 20`);this.advance();
 }
 options(){const p=this.players[this.turn];if(this.done||!p)return null;const call=Math.max(0,this.current-p.bet),max=p.bet+p.stack;return {call,min:this.current+this.minRaise,max,canRaise:this.players.some(q=>q.i!==p.i&&!q.folded&&q.stack>0)&&max>this.current&&(p.acted===null||this.current-p.acted>=this.minRaise)};}
 act(type,target=0){if(this.done)return false;const p=this.players[this.turn],o=this.options();if(!this.pending.has(p.i))return false;
 if(type==='fold'){p.folded=true;p.action='棄牌';}
 else if(type==='call'){const n=this.pay(p.i,o.call);p.action=p.stack===0?'全下':n?`跟注 ${n}`:'過牌';p.acted=this.current;}
 else if(type==='raise'){target=Math.floor(Number(target));if(!o.canRaise||!Number.isFinite(target)||target>o.max||target<=this.current||(target<o.min&&target!==o.max))return false;
 const increase=target-this.current;this.pay(p.i,target-p.bet);if(increase>=this.minRaise){this.minRaise=increase;this.players.forEach(q=>{if(q.i!==p.i)q.acted=null;});}this.current=target;p.acted=target;p.action=p.stack===0?`全下 ${target}`:`加注至 ${target}`;
 this.players.forEach(q=>{if(q.i!==p.i&&!q.folded&&q.stack>0&&q.bet<this.current)this.pending.add(q.i);});
 }else return false;
 this.note(`${p.name}：${p.action}`);this.pending.delete(p.i);this.advance();return true;
 }
 advance(){
 const alive=this.players.filter(p=>!p.folded);if(alive.length===1){const p=alive[0];p.stack+=this.pot;this.awards=[{i:p.i,amount:this.pot}];this.result=`${p.name}贏得 ${this.pot.toLocaleString()} 籌碼`;this.done=true;this.note(this.result);return;}
 for(const i of this.pending)if(this.players[i].folded||!this.players[i].stack)this.pending.delete(i);
 // A lone player with chips need only respond to an outstanding bet.
 const able=alive.filter(p=>p.stack>0);if(able.length===1&&able[0].bet>=this.current)this.pending.clear();
 if(this.pending.size){this.turn=this.next(this.turn,p=>this.pending.has(p.i));return;}
 if(this.street===3){this.settle();return;}
 this.street++;this.deck.pop();for(let n=0;n<(this.street===1?3:1);n++)this.board.push(this.deck.pop());
 this.current=0;this.minRaise=20;this.players.forEach(p=>{p.bet=0;p.acted=null;if(!p.folded)p.action=p.stack?'':'全下';});
 this.note(['','翻牌','轉牌','河牌'][this.street]);this.pending=new Set(able.map(p=>p.i));if(able.length<2)this.pending.clear();this.turn=this.dealer;this.advance();
 }
 settle(){
 const levels=[...new Set(this.players.map(p=>p.total).filter(Boolean))].sort((a,b)=>a-b);let previous=0;this.awards=[];
 const scores=this.players.map(p=>evaluate([...p.cards,...this.board]));
 for(const level of levels){const contributors=this.players.filter(p=>p.total>=level),amount=(level-previous)*contributors.length;previous=level;const eligible=contributors.filter(p=>!p.folded);if(!eligible.length){contributors.forEach(p=>p.stack+=amount/contributors.length);continue;}
 let best=eligible[0];eligible.forEach(p=>{if(compare(scores[p.i],scores[best.i])>0)best=p;});const winners=eligible.filter(p=>compare(scores[p.i],scores[best.i])===0).sort((a,b)=>(a.i-this.dealer+3)%4-(b.i-this.dealer+3)%4);
 winners.forEach((p,i)=>{const n=Math.floor(amount/winners.length)+(i<amount%winners.length?1:0);p.stack+=n;const found=this.awards.find(a=>a.i===p.i);if(found)found.amount+=n;else this.awards.push({i:p.i,amount:n});});
 }
 this.done=true;this.result=this.awards.map(a=>`${this.players[a.i].name} +${a.amount.toLocaleString()}（${labels[scores[a.i][0]]}）`).join(' · ');this.note(this.result);
 }
 ai(){if(this.done||this.turn===0)return;const p=this.players[this.turn],o=this.options(),hand=p.cards;const score=this.board.length?evaluate([...hand,...this.board])[0]:hand[0].r===hand[1].r?2:0;const strength=score/8+(hand[0].r+hand[1].r)/80;const roll=this.random();
 if(o.call>0&&roll>0.6+strength&&o.call>p.stack*0.08){this.act('fold');return;}
 if(o.canRaise&&o.max>=o.min&&roll<0.1+strength*0.18){this.act('raise',Math.min(o.max,o.min+Math.floor(this.pot/40)*10));return;}this.act('call');
 }
}
