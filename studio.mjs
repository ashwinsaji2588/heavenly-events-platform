import http from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { randomBytes, scryptSync, timingSafeEqual, createHash } from 'node:crypto';
import { readFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const data = resolve(process.env.STUDIO_DATA || '.studio-data');
mkdirSync(data, { recursive: true });
const db = new DatabaseSync(resolve(data, 'studio.sqlite'));
db.exec(`PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS firms(id TEXT PRIMARY KEY,name TEXT NOT NULL,expires INTEGER);
CREATE TABLE IF NOT EXISTS admins(email TEXT PRIMARY KEY,firm TEXT REFERENCES firms,salt TEXT,hash TEXT);
CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,firm TEXT REFERENCES firms ON DELETE CASCADE,expires INTEGER);
CREATE TABLE IF NOT EXISTS leads(id INTEGER PRIMARY KEY,firm TEXT REFERENCES firms ON DELETE CASCADE,name TEXT,contact TEXT,occasion TEXT,venue TEXT,eventdate TEXT,booked INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS visits(id INTEGER PRIMARY KEY,lead INTEGER REFERENCES leads ON DELETE CASCADE,scheduled TEXT,place TEXT,owner TEXT,notes TEXT DEFAULT '');
`);
const run=(sql,...args)=>db.prepare(sql).run(...args);
const one=(sql,...args)=>db.prepare(sql).get(...args);
const all=(sql,...args)=>db.prepare(sql).all(...args);
const token=()=>randomBytes(24).toString('hex');
const digest=x=>createHash('sha256').update(x).digest('hex');
if(process.argv[2]==='admin'){
  const [, , , id,name,email]=process.argv;
  if(!/^[a-z0-9-]{1,60}$/.test(id||'') || !name || !email?.includes('@')) throw Error('Usage: node studio.mjs admin firm-slug "Firm name" email');
  const password=token(), salt=token();
  db.exec('BEGIN');
  run('INSERT OR IGNORE INTO firms VALUES(?,?,NULL)',id,name);
  run('INSERT INTO admins VALUES(?,?,?,?)',email.toLowerCase(),id,salt,scryptSync(password,salt,64).toString('hex'));
  db.exec('COMMIT');
  console.log('Admin created. Initial password:',password);
  process.exit();
}
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const field=(label,name,type='text',required=true)=>`<label>${label}<input name="${name}" type="${type}" maxlength="240" ${required?'required':''}></label>`;
const leadFields=field('Client name','name')+field('Phone or email','contact')+field('Occasion','occasion')+field('Event venue','venue','text',false)+field('Proposed event date','eventdate','date',false);
const form=(action,body,button)=>`<form method="post" action="${action}">${body}<button>${button}</button></form>`;
const layout=(title,body)=>`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} | Occasion Desk</title><link rel="stylesheet" href="/studio.css"></head><body><header><a href="/studio">Occasion Desk</a></header><main>${body}</main></body></html>`;
const home='<h1>The planning desk for event firms.</h1><p>Track client visits, inquiries and confirmed events alongside your existing website.</p>'+form('/demo','','Explore the sample workspace')+'<h2>Admin sign-in</h2>'+form('/login',field('Email','email','email')+field('Password','password','password'),'Sign in');
const files=new Set(['index.html','site.js','styles.css','weddings.html','receptions.html','mini-events.html','heavenly-events-september.jpg','studio.css']);
function clean(){
  run('DELETE FROM sessions WHERE expires<?',Date.now());
  run('DELETE FROM firms WHERE expires<?',Date.now());
}
clean(); setInterval(clean,3600000).unref();
const server=http.createServer(async(req,res)=>{
  const path=new URL(req.url,'http://localhost').pathname;
  const send=(status,body)=>{res.writeHead(status,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(body)};
  const go=url=>{res.writeHead(303,{Location:url});res.end()};
  const session=digest((req.headers.cookie||'').match(/(?:^|; )studio=([a-f0-9]{48})(?:;|$)/)?.[1]||'');
  const firm=one('SELECT f.* FROM sessions s JOIN firms f ON f.id=s.firm WHERE s.token=? AND s.expires>? AND (f.expires IS NULL OR f.expires>?)',session,Date.now(),Date.now());
  const start=id=>{const key=token();run('INSERT INTO sessions VALUES(?,?,?)',digest(key),id,Date.now()+28800000);res.setHeader('Set-Cookie','studio='+key+'; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800'+(process.env.COOKIE_SECURE==='1'?'; Secure':''));go('/desk')};
  try{
    let p;
    if(req.method==='POST'){
      if(req.headers.origin && new URL(req.headers.origin).host!==req.headers.host)return send(403,'Invalid origin');
      let body=''; for await(const chunk of req){body+=chunk;if(body.length>12000)return send(413,'Form too large')}
      p=new URLSearchParams(body);
    }else if(req.method!=='GET')return send(405,'Method unavailable');
    const val=(k,required=true)=>{const v=(p.get(k)||'').trim();if((required&&!v)||v.length>1500)throw Error('Invalid field');return v};
    if(!p && files.has(path.slice(1)||'index.html')){
      const file=path.slice(1)||'index.html';
      const mime={js:'application/javascript',css:'text/css',html:'text/html',jpg:'image/jpeg'};
      res.setHeader('Content-Type',mime[file.split('.').pop()]); return res.end(readFileSync(new URL(file,import.meta.url)));
    }
    if(path==='/studio'&&!p)return send(200,layout('Event management',home));
    if(path==='/demo'&&p){
      const id=token();run('INSERT INTO firms VALUES(?,?,?)',id,'Marigold Events · Demo',Date.now()+28800000);
      const lead=run('INSERT INTO leads(firm,name,contact,occasion,venue,eventdate) VALUES(?,?,?,?,?,?)',id,'Maya Thomas','maya@example.test','Reception','Garden Hall','').lastInsertRowid;
      run('INSERT INTO visits(lead,scheduled,place,owner,notes) VALUES(?,?,?,?,?)',lead,new Date(Date.now()+86400000).toISOString().slice(0,10)+'T16:00','Garden Hall','Alex','Discuss floral stage options.');
      return start(id);
    }
    if(path==='/login'&&p){const a=one('SELECT * FROM admins WHERE email=?',val('email').toLowerCase());const hash=scryptSync(val('password'),a?.salt||'unknown',64);if(!a||!timingSafeEqual(hash,Buffer.from(a.hash,'hex')))return send(401,layout('Sign in','<p>Incorrect email or password.</p>'+home));return start(a.firm)}
    const publicId=path.match(/^\/inquire\/([a-z0-9-]+)$/)?.[1];
    if(publicId&&!one('SELECT id FROM firms WHERE id=? AND expires IS NULL',publicId))return send(404,'Firm unavailable');
    if(publicId&&!p)return send(200,layout('Event inquiry','<h1>Contact '+esc(one('SELECT name FROM firms WHERE id=?',publicId).name)+'</h1>'+form(path,leadFields,'Send inquiry')));
    if((path==='/leads'&&firm||publicId)&&p){
      run('INSERT INTO leads(firm,name,contact,occasion,venue,eventdate) VALUES(?,?,?,?,?,?)',publicId||firm.id,val('name'),val('contact'),val('occasion'),val('venue',false),val('eventdate',false));
      return publicId?send(200,layout('Inquiry received','<h1>Inquiry received</h1><p>The planning team has your details.</p>')):go('/desk');
    }
    if(!firm)return go('/studio');
    if(path==='/logout'&&p){run('DELETE FROM sessions WHERE token=?',session);return go('/studio')}
    const lead=one('SELECT * FROM leads WHERE id=? AND firm=?',p?.get('lead')||0,firm.id);
    if(p&&lead){
      if(path==='/visit')run('INSERT INTO visits(lead,scheduled,place,owner) VALUES(?,?,?,?)',lead.id,val('scheduled'),val('place'),val('owner'));
      else if(path==='/notes')run('UPDATE visits SET notes=? WHERE id=? AND lead=?',val('notes'),val('visit'),lead.id);
      else if(path==='/book')run('UPDATE leads SET booked=1,eventdate=? WHERE id=?',val('eventdate'),lead.id);
      else return send(404,'Unknown action');
      return go('/desk');
    }
    if(path!=='/desk'||p)return send(404,'Page unavailable');
    const leads=all('SELECT * FROM leads WHERE firm=? ORDER BY id DESC',firm.id);
    const visits=all('SELECT v.*,l.name FROM visits v JOIN leads l ON l.id=v.lead WHERE l.firm=? ORDER BY scheduled',firm.id);
    const hidden=id=>`<input type="hidden" name="lead" value="${id}">`;
    const cards=leads.map(l=>`<article><h3>${esc(l.name)}</h3><p>${esc(l.occasion)} · ${l.booked?'Confirmed booking':'Inquiry'}</p><p>${esc(l.contact)}<br>${esc(l.venue)} · ${esc(l.eventdate)||'Date open'}</p><details><summary>Schedule a visit</summary>${form('/visit',hidden(l.id)+field('Visit time','scheduled','datetime-local')+field('Meeting location','place')+field('Assigned planner','owner'),'Save visit')}</details>${l.booked?'':`<details><summary>Confirm booking</summary>${form('/book',hidden(l.id)+field('Confirmed event date','eventdate','date'),'Confirm booking')}</details>`}</article>`).join('');
    const agenda=visits.map(v=>`<article><strong>${esc(v.scheduled.replace('T',' · '))}</strong><h3>${esc(v.name)}</h3><p>${esc(v.place)} · ${esc(v.owner)}</p><details><summary>Meeting notes</summary>${form('/notes',hidden(v.lead)+'<input type="hidden" name="visit" value="'+v.id+'"><label>Notes<textarea name="notes" maxlength="1500" required>'+esc(v.notes)+'</textarea></label>','Save notes')}</details></article>`).join('');
    return send(200,layout(firm.name,`<h1>${esc(firm.name)}</h1>${firm.expires?'<p>Private demo with fictional records. Expires in eight hours.</p>':'<p>Website contact link: <a href="/inquire/'+esc(firm.id)+'">/inquire/'+esc(firm.id)+'</a></p>'}<details><summary>New inquiry</summary>${form('/leads',leadFields,'Create inquiry')}</details><div class="columns"><section><h2>Visit schedule</h2>${agenda||'<p>No visits scheduled.</p>'}</section><section><h2>Inquiries &amp; bookings</h2>${cards||'<p>No inquiries yet.</p>'}</section></div>${form('/logout','','Sign out')}`));
  }catch(e){send(400,'Unable to save or open this request. Check your fields and try again.')}
});
export { server };
if(process.env.STUDIO_TEST !== '1') server.listen(Number(process.env.PORT||4173),'127.0.0.1',()=>console.log('Occasion Desk listening on '+server.address().port));
