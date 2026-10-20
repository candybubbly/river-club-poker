import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
const [html,css,app,engine]=await Promise.all([
 readFile(new URL('./index.html',import.meta.url)),
 readFile(new URL('./style.css',import.meta.url)),
 readFile(new URL('./app.js',import.meta.url)),
 readFile(new URL('./engine.js',import.meta.url))
]);
const assets=new Map([
 ['/',[html,'text/html; charset=utf-8']],
 ['/style.css',[css,'text/css; charset=utf-8']],
 ['/app.js',[app,'text/javascript; charset=utf-8']],
 ['/engine.js',[engine,'text/javascript; charset=utf-8']]
]);
createServer((req,res)=>{
 if(req.url==='/health'){res.writeHead(200,{'content-type':'text/plain'});res.end('ok');return;}
 const asset=assets.get(new URL(req.url,'http://localhost').pathname);
 if(!asset){res.writeHead(404);res.end('Not found');return;}
 res.writeHead(200,{'content-type':asset[1],'x-content-type-options':'nosniff'});res.end(asset[0]);
}).listen(process.env.PORT??3000,'0.0.0.0',()=>console.log(`River Club · http://localhost:${process.env.PORT??3000}`));
