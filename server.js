import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
const assets={'/':['index.html','text/html; charset=utf-8'],'/style.css':['style.css','text/css'],'/app.js':['app.js','text/javascript'],'/engine.js':['engine.js','text/javascript']};
createServer(async(req,res)=>{
 if(req.url==='/health'){res.writeHead(200,{'content-type':'text/plain'});res.end('ok');return;}
 const asset=assets[new URL(req.url,'http://localhost').pathname];
 if(!asset){res.writeHead(404);res.end('Not found');return;}
 try{const data=await readFile(new URL(asset[0],import.meta.url));res.writeHead(200,{'content-type':asset[1],'x-content-type-options':'nosniff'});res.end(data);}catch{res.writeHead(500);res.end('Unable to load asset');}
}).listen(process.env.PORT??3000,'0.0.0.0',()=>console.log(`River Club · http://localhost:${process.env.PORT??3000}`));
