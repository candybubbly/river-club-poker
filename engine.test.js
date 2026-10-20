import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Poker,evaluate,compare} from './engine.js';
const cards=(r,s=0)=>r.map((v,i)=>({r:v,s:Array.isArray(s)?s[i]:s}));
test('all hand categories and ace-low straight',()=>{
 const hands=[cards([14,11,9,7,3],[0,1,2,3,0]),cards([14,14,9,7,3],[0,1,2,3,0]),cards([14,14,9,9,3],[0,1,2,3,0]),cards([14,14,14,7,3],[0,1,2,3,0]),cards([14,2,3,4,5],[0,1,2,3,0]),cards([14,11,9,7,3]),cards([14,14,14,7,7],[0,1,2,3,0]),cards([14,14,14,14,3],[0,1,2,3,0]),cards([14,13,12,11,10])];
 hands.forEach((h,i)=>assert.equal(evaluate(h)[0],i));assert.equal(evaluate(hands[4])[1],5);
 assert.ok(compare(evaluate(hands[8]),evaluate(hands[7]))>0);
});
test('seven-card best hand and kicker',()=>{assert.deepEqual(evaluate(cards([14,13,12,11,10,2,3])),[8,14]);assert.ok(compare(evaluate(cards([8,8,14,13,2],[0,1,2,3,0])),evaluate(cards([8,8,14,12,2],[0,1,2,3,0])))>0);});
test('side pots exclude folded players and return uncalled excess',()=>{
 const g=new Poker();g.board=cards([2,3,7,9,11],[0,1,2,3,0]);g.dealer=3;g.pot=700;
 [[100,[14,14],false],[200,[13,13],false],[300,[12,12],false],[100,[10,10],true]].forEach(([total,r,folded],i)=>Object.assign(g.players[i],{total,stack:0,cards:cards(r,[1,2]),folded}));
 g.settle();assert.deepEqual(g.players.map(p=>p.stack),[400,200,100,0]);
});
test('equal board splits pot with clockwise odd chips',()=>{const g=new Poker();g.board=cards([10,11,12,13,14]);g.dealer=0;g.pot=9;g.players.forEach((p,i)=>Object.assign(p,{total:3,stack:0,cards:cards([2+i,3+i],[1,2]),folded:i===3}));g.players[3].total=0;g.settle();assert.deepEqual(g.players.map(p=>p.stack),[3,3,3,0]);});
test('invalid raises do not mutate the game',()=>{const g=new Poker();g.start();assert.equal(g.act('raise',21),false);assert.equal(g.act('raise',NaN),false);assert.equal(g.pot,30);});
test('short all-in does not reopen raising for an earlier caller',()=>{const g=new Poker();g.start();g.act('call');g.act('call');g.players[1].stack=15;g.act('raise',25);g.act('call');assert.equal(g.turn,3);assert.equal(g.options().canRaise,false);});
test('heads-up blinds and full all-in runout',()=>{const g=new Poker();g.players[2].stack=0;g.players[3].stack=0;g.start();assert.equal(g.turn,g.dealer);g.act('raise',2000);g.act('call');assert.equal(g.done,true);assert.equal(g.board.length,5);assert.equal(g.players.reduce((s,p)=>s+p.stack,0),4000);});
test('cannot raise into an opponent who is already all-in',()=>{const g=new Poker();g.players[2].stack=0;g.players[3].stack=0;g.players[0].stack=100;g.start();g.act('raise',100);assert.equal(g.options().canRaise,false);});
test('odd chip goes to tied winner clockwise after the dealer',()=>{const g=new Poker();g.board=cards([2,4,6,8,10],[0,1,2,3,0]);g.dealer=0;g.pot=3;[[[14,14],1,false],[[14,14],1,false],[[13,13],1,false],[[12,12],0,true]].forEach(([r,total,folded],i)=>Object.assign(g.players[i],{cards:cards(r,i===0?[0,1]:[2,3]),total,stack:0,folded}));g.settle();assert.deepEqual(g.players.map(p=>p.stack),[1,2,0,0]);});
test('500 simulated hands finish, conserve chips, and never create negative stacks',()=>{let seed=842;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};for(let n=0;n<500;n++){const g=new Poker(random);g.players.forEach(p=>p.stack=10+Math.floor(random()*200));const total=g.players.reduce((s,p)=>s+p.stack,0);g.start();let turns=0;while(!g.done&&turns++<200){const o=g.options(),roll=random();if(o.canRaise&&roll<.22)g.act('raise',o.max);else g.act(roll<.3?'fold':'call');assert.ok(g.players.every(p=>p.stack>=0));}assert.ok(g.done);assert.equal(g.players.reduce((s,p)=>s+p.stack,0),total);}});
