'use strict';
const MALLS = {
 'Palladium Mall': {floors:['B1','B2','B3'], zones:[['A','A',1,60],['B','B',61,120],['C','C',121,180],['D','D',181,240],['E','E',241,315]]},
 'Alpha Mall': {floors:['B1','B2'], zones:['A','B','C','D','E','F','G'].map(z=>[z,z,1,15])},
 'TRP Mall': {floors:['Ground','B1','B2','B3','B4'], zones:[['A','East Court (A)',1,90],['B','Center Court (B)',1,90],['C','South Court (C)',1,90]]}
};
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const norm=v=>String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const fmt=v=>{const s=norm(v);return [s.slice(0,2),s.slice(2,4),s.slice(4,6),s.slice(6,10)].filter(Boolean).join(' ')};
const okPlate=v=>/^[A-Z]{2}\d{1,2}[A-Z]{0,3}\d{1,4}$/.test(norm(v));
const zoneName=z=>z[1].length===1?'Zone '+z[1]:z[1];
const K={v:'parkfinder2:vehicles',a:'parkfinder2:active',s:'parkfinder2:seeded'};
const Store={
 all(){try{return JSON.parse(localStorage.getItem(K.v))||{}}catch(e){return {}}},
 list(){return Object.values(this.all()).sort((a,b)=>new Date(b.savedAt)-new Date(a.savedAt))},
 get(p){return this.all()[norm(p)]||null},
 save(r){const a=this.all();r.plate=fmt(r.plate);r.savedAt=r.savedAt||new Date().toISOString();a[norm(r.plate)]=r;try{localStorage.setItem(K.v,JSON.stringify(a));return r}catch(e){return null}},
 remove(p){const a=this.all();delete a[norm(p)];try{localStorage.setItem(K.v,JSON.stringify(a));if(localStorage.getItem(K.a)===norm(p))localStorage.removeItem(K.a)}catch(e){}},
 setActive(p){try{localStorage.setItem(K.a,norm(p))}catch(e){}},
 active(){try{return localStorage.getItem(K.a)||''}catch(e){return ''}},
 seed(){try{if(localStorage.getItem(K.s))return;localStorage.setItem(K.s,'1')}catch(e){}
  if(this.get('GJ05AB1234'))return;
  this.save({plate:'GJ 05 AB 1234',mall:'Palladium Mall',floor:'B2',zone:'B',zoneLabel:'Zone B',bay:84,wash:false,ev:true,note:'Near the lift',savedAt:new Date(Date.now()-42*6e4).toISOString()});
  this.setActive('GJ05AB1234')}
};
const since=i=>{const m=Math.max(0,Math.round((Date.now()-new Date(i))/6e4));return m<1?'just now':m<60?m+' min ago':Math.floor(m/60)+' hr '+m%60+' min ago'};
const clock=i=>new Date(i).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
function toast(m){const o=$('.toast');if(o)o.remove();const b=document.createElement('div');b.className='toast';b.setAttribute('role','status');b.textContent=m;document.body.appendChild(b);setTimeout(()=>b.remove(),3200)}
function fill(sel,items){sel.textContent='';items.forEach(([v,t])=>{const o=document.createElement('option');o.value=v;o.textContent=t;sel.appendChild(o)})}
const cfg=()=>MALLS[$('#mall').value];
const curZone=()=>cfg().zones.find(z=>z[0]===$('#zone').value);
const FLOOR_ZONES={'Palladium Mall':{B1:['A','B'],B2:['C','D'],B3:['E']},'Alpha Mall':{B1:['A','B','C','D'],B2:['E','F','G']}};
const zonesFor=(mall,floor)=>{const m=MALLS[mall],fz=(FLOOR_ZONES[mall]||{})[floor];return fz?m.zones.filter(z=>fz.includes(z[0])):m.zones};
const isTaken=(f,z,n)=>((f.charCodeAt(f.length-1)*31+z.charCodeAt(0)*17+n*7)%100)%10<6;
const svgEl=(n,a)=>{const e=document.createElementNS('http://www.w3.org/2000/svg',n);for(const k in a)e.setAttribute(k,a[k]);return e};
/* Simplified floor plans, laid out like each mall's real parking map.
   A segment is a block of bays filled row by row: seg(zone, firstBay, count, x, width, rowYs, laneYs, bayHeight, columns) */
function layoutOf(mall,floor,zsel){
 const segs=[],tags=[],notes=[],bands=[];
 const seg=(zone,from,count,x,w,ys,lanes,h,cols)=>segs.push({zone,from,count,x,w,ys,lanes,h,cols});
 let H,cy;
 if(mall==='Palladium Mall'){H=236;cy=120;bands.push([94,52]);
  const zs=zonesFor(mall,floor),ys=[20,52,152,184],ln=[120,120,120,120];
  if(zs.length===1){const z=zs[0];seg(z[0],z[2],40,40,320,ys,ln,30,10);seg(z[0],z[2]+40,35,440,320,ys,ln,30,9);
   tags.push([200,cy+6,'Zone '+z[0]+' · '+z[2]+'–'+(z[2]+39)],[600,cy+6,'Zone '+z[0]+' · '+(z[2]+40)+'–'+z[3]])}
  else zs.forEach((z,i)=>{seg(z[0],z[2],60,i?440:40,320,ys,ln,30,15);tags.push([i?600:200,cy+6,'Zone '+z[0]+' · '+z[2]+'–'+z[3]])});
  notes.push([36,H-6,'Entry'],[764,H-6,'Exit'])}
 else if(mall==='Alpha Mall'){H=230;cy=115;bands.push([89,52]);
  zonesFor(mall,floor).forEach((z,i)=>{const top=i<2,wide=floor==='B2'&&i===2,x=i%2?440:40;
   seg(z[0],1,15,wide?90:x,wide?620:320,[top?40:150],[115],40,15);
   tags.push([wide?200:x+160,top?106:138,'Zone '+z[0]])});
  notes.push([36,H-6,'Entry'],[764,H-6,'Exit'])}
 else{H=230;cy=109;bands.push([66,24],[128,24]);
  const zl=MALLS[mall].zones.find(z=>z[0]===zsel)||MALLS[mall].zones[0];
  [30,92,154].forEach((y,r)=>{const ln=[78,78,140][r];seg(zl[0],1+30*r,15,40,320,[y],[ln],34,15);seg(zl[0],16+30*r,15,440,320,[y],[ln],34,15)});
  tags.push([400,H-8,zl[1]+' · 90 bays']);notes.push([400,14,'Entrance'],[764,H-34,'Exit'])}
 return {W:800,H,cy,segs,tags,notes,bands}}
function carGlyph(g,cls){const w=g.w*.62,h=g.h*.74,x=g.cx-w/2,y=g.cy-h/2,o=svgEl('g',{});
 o.appendChild(svgEl('rect',{x,y,width:w,height:h,rx:w*.3,class:cls||'bay-car'}));
 o.appendChild(svgEl('rect',{x:x+w*.16,y:y+h*.2,width:w*.68,height:h*.2,rx:2,class:'bay-car-glass'}));
 o.appendChild(svgEl('rect',{x:x+w*.16,y:y+h*.6,width:w*.68,height:h*.2,rx:2,class:'bay-car-glass'}));return o}
/* o: {mall, floor, zone, mode:'pick'|'route', picked, slot:'C-150', onPick(zone,bay)} */
function drawMap(host,o){
 host.textContent='';const L=layoutOf(o.mall,o.floor,o.zone);
 const svg=svgEl('svg',{viewBox:'0 0 '+L.W+' '+L.H,role:'img','aria-label':o.mall+', floor '+o.floor+', simplified parking plan'});
 const add=(n,a,p)=>(p||svg).appendChild(svgEl(n,a));
 add('rect',{x:0,y:0,width:L.W,height:L.H,rx:8,fill:'var(--map-aisle)'});
 L.bands.forEach(b=>add('rect',{x:8,y:b[0],width:L.W-16,height:b[1],fill:'var(--map-lane)'}));
 let tgt=null;
 L.segs.forEach(s=>{const bw=s.w/s.cols;
  s.ys.forEach(y=>add('rect',{x:s.x-3,y:y-3,width:s.w+6,height:s.h+6,rx:4,fill:'var(--map-slab)'}));
  for(let i=0;i<s.count;i++){
   const r=Math.floor(i/s.cols),c=i%s.cols,n=s.from+i,id=s.zone+'-'+n,g={x:s.x+c*bw,y:s.ys[r],w:bw,h:s.h};g.cx=g.x+bw/2;g.cy=g.y+s.h/2;
   const route=o.mode==='route',target=route&&o.slot===id,picked=o.picked===id,taken=route&&!target&&isTaken(o.floor,s.zone,n);
   if(target)tgt={g,lane:s.lanes[r]};
   const grp=svgEl('g',{class:'bay'+(taken?' is-taken':'')+(target?' is-target':'')+(picked?' is-picked':'')});
   add('rect',{x:g.x+1,y:g.y,width:bw-2,height:s.h,rx:2,class:'bay-fill'},grp);
   if(target)grp.appendChild(carGlyph(g,'bay-car-target'));else if(taken)grp.appendChild(carGlyph(g));
   else{const t=svgEl('text',{x:g.cx,y:g.cy+4,class:'bay-label',style:'font-size:'+Math.min(13,bw/(String(n).length*.62+.3)).toFixed(1)+'px'});t.textContent=n;grp.appendChild(t)}
   if(o.mode==='pick')grp.addEventListener('click',()=>o.onPick(s.zone,n));else grp.style.cursor='default';
   svg.appendChild(grp)}});
 L.tags.forEach(t=>{const e=svgEl('text',{x:t[0],y:t[1],class:'zone-tag',style:'font-size:19px'});e.textContent=t[2];svg.appendChild(e)});
 add('rect',{x:372,y:L.cy-32,width:56,height:64,rx:6,fill:'var(--nav)'});
 [['Lifts',-4],['Stairs',14]].forEach(([t,dy])=>{const e=svgEl('text',{x:400,y:L.cy+dy,class:'map-note',style:'fill:#fff;font-size:12px'});e.textContent=t;svg.appendChild(e)});
 L.notes.forEach(n=>{const e=svgEl('text',{x:n[0],y:n[1],class:'map-note',style:'font-size:13px'});e.textContent=n[2];svg.appendChild(e)});
 if(tgt){const sx=tgt.g.cx<400?372:428,p=[[sx,L.cy],[sx,tgt.lane],[tgt.g.cx,tgt.lane],[tgt.g.cx,tgt.g.cy]].filter((q,i,a)=>!i||Math.hypot(q[0]-a[i-1][0],q[1]-a[i-1][1])>.5);
  const d=p.map((q,i)=>(i?'L':'M')+q[0]+' '+q[1]).join(' ');
  add('path',{d,fill:'none',stroke:'var(--route-halo)','stroke-width':6,'stroke-linecap':'round','stroke-linejoin':'round'});
  add('path',{d,class:'route-line',style:'stroke-width:3;stroke-dasharray:7 6'});
  add('circle',{cx:sx,cy:L.cy,r:6,fill:'var(--route)',stroke:'var(--map-slab)','stroke-width':2})}
 host.appendChild(svg)}
function drawPicker(){drawMap($('#pick-map'),{mall:$('#mall').value,floor:$('#floor').value,zone:$('#zone').value,mode:'pick',picked:$('#zone').value+'-'+$('#bay').value,
 onPick:(z,n)=>{$('#zone').value=z;onZone();$('#bay').value=n;drawPicker()}});
 $('#pick-readout').textContent=$('#floor').value+' · '+zoneName(curZone())+' · bay '+$('#bay').value}
function onMall(){const c=cfg();fill($('#floor'),c.floors.map(f=>[f,f]));onFloor()}
function onFloor(){fill($('#zone'),zonesFor($('#mall').value,$('#floor').value).map(z=>[z[0],z[1]]));onZone()}

function onZone(){const z=curZone();fill($('#bay'),Array.from({length:z[3]-z[2]+1},(_,i)=>[z[2]+i,z[2]+i]));$('#bay-range').textContent='Bays '+z[2]+' to '+z[3]+' in this zone';drawPicker()}
let CUR=null,shown='';
const go=p=>{CUR=p;try{location.hash=p}catch(e){}router()};
function showHome(){const a=Store.get(Store.active());$('#recall').hidden=!a;
 if(a){$('#recall-plate').textContent=a.bay;$('#recall-where').textContent=a.plate+' · '+a.mall+' · '+a.floor+', '+a.zoneLabel+' · parked '+since(a.savedAt);$('#recall-link').href='#/details?v='+norm(a.plate)}
 const l=$('#saved-list');l.textContent='';const s=Store.list();$('#saved-empty').hidden=s.length>0;
 s.forEach(v=>{const li=document.createElement('li');li.innerHTML='<span class="code"></span><span class="where"></span><span class="go"><a class="btn btn-signal" href="#/details?v='+norm(v.plate)+'">View spot</a></span>';li.children[0].textContent=v.plate;li.children[1].textContent=v.mall+' · '+v.floor+' · '+v.zoneLabel+' · bay '+v.bay;l.appendChild(li)})}
function showSave(q){const v=q.get('v');if(v)$('#plate').value=fmt(v);$('#save-error').hidden=true}
function showFind(){$('#not-found').hidden=true;const l=Store.get(Store.active());if(l&&!$('#find-plate').value)$('#find-plate').value=l.plate;
 const s=Store.list(),row=$('#find-recent-row');row.textContent='';$('#find-recent').hidden=!s.length;
 s.slice(0,4).forEach(v=>{const b=document.createElement('button');b.type='button';b.className='btn btn-quiet';const sp=document.createElement('span');sp.className='code';sp.textContent=v.plate;b.appendChild(sp);b.onclick=()=>{$('#find-plate').value=v.plate;submitFind()};row.appendChild(b)})}
function submitFind(){const i=$('#find-plate'),r=Store.get(i.value);
 if(!r){$('#not-found').hidden=false;$('#not-found-plate').textContent=fmt(i.value)||'—';$('#not-found-save').href='#/save?v='+norm(i.value);return}
 Store.setActive(r.plate);go('/details?v='+norm(r.plate))}
function showDetails(q){const r=Store.get(q.get('v')||Store.active());$('#d-missing').hidden=!!r;$$('[data-d]').forEach(n=>n.hidden=!r);if(!r)return;
 $('#d-plate').textContent=r.plate;$('#d-mall').textContent=r.mall;$('#d-floor').textContent=r.floor;$('#d-zone').textContent=r.zoneLabel;$('#d-bay').textContent=r.bay;$('#d-bay2').textContent=r.bay;
 $('#d-saved').textContent=clock(r.savedAt)+' · '+since(r.savedAt);$('#d-note').textContent=r.note||'No note added';
 $('#d-dir').textContent='Take the lift or ramp to '+r.floor+' at '+r.mall+'. Head to '+r.zoneLabel+' and look for bay '+r.bay+'.'+(r.note?' Landmark: '+r.note+'.':'');
 const sv=$('#d-services');sv.textContent='';const items=[r.wash&&'Car washing',r.ev&&'EV charging'].filter(Boolean);
 (items.length?items:['None requested']).forEach(t=>{const c=document.createElement('span');c.className='chip';c.textContent=t;sv.appendChild(c)});
 drawMap($('#detail-map'),{mall:r.mall,floor:r.floor,zone:r.zone,mode:'route',slot:r.zone+'-'+r.bay});$('#detail-cap').textContent=r.mall+' · '+r.floor+' · '+r.zoneLabel+' · bay '+r.bay+'. Simplified plan, not to scale.';$('#d-confirm').hidden=!q.get('saved');$('#d-clear').dataset.plate=r.plate}
const VIEWS={'/home':showHome,'/save':showSave,'/find':showFind,'/details':showDetails,'/how':()=>{}};
function router(){const raw=(CUR!==null?CUR:location.hash.replace(/^#/,''))||'/home',[path,qs]=raw.split('?'),q=new URLSearchParams(qs||'');shown=raw;
 if(!VIEWS[path]){go('/home');return}
 $$('[data-view]').forEach(s=>s.hidden=s.dataset.view!==path);
 $$('#nav a').forEach(a=>a.dataset.nav===path?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current'));
 try{VIEWS[path](q)}catch(e){console.error(e)}
 scrollTo(0,0);const h=$('[data-view="'+path+'"] h1');if(h)h.focus({preventScroll:true})}
fill($('#mall'),Object.keys(MALLS).map(m=>[m,m]));onMall();
$('#mall').onchange=onMall;$('#floor').onchange=onFloor;$('#zone').onchange=onZone;$('#bay').onchange=drawPicker;
[$('#plate'),$('#find-plate')].forEach(i=>i.addEventListener('input',()=>{const end=i.selectionStart===i.value.length;i.value=fmt(i.value);if(end)i.setSelectionRange(i.value.length,i.value.length)}));
$('#scan').onclick=()=>{const p=$('#plate');p.classList.add('scanning');p.value='';const t='GJ05AB1234';let i=0;const k=setInterval(()=>{p.value=fmt(t.slice(0,++i));if(i>=t.length){clearInterval(k);p.classList.remove('scanning');toast('Plate read from camera (demo)')}},90)};
$('#save-form').addEventListener('submit',e=>{e.preventDefault();const p=$('#plate');
 if(!okPlate(p.value)){$('#save-error').hidden=false;p.focus();return}
 $('#save-error').hidden=true;const z=curZone();
 const r=Store.save({plate:p.value,mall:$('#mall').value,floor:$('#floor').value,zone:z[0],zoneLabel:zoneName(z),bay:Number($('#bay').value),wash:$('#wash').checked,ev:$('#ev').checked,note:$('#note').value.trim()});
 if(!r){toast('Could not save. Storage is blocked in this browser.');return}
 Store.setActive(r.plate);p.value='';$('#note').value='';$('#wash').checked=$('#ev').checked=false;go('/details?v='+norm(r.plate)+'&saved=1')});
$('#find-form').addEventListener('submit',e=>{e.preventDefault();submitFind()});
$('#d-clear').onclick=function(){const p=this.dataset.plate;if(!p||!confirm('Remove the saved spot for '+p+'?'))return;Store.remove(p);toast('Spot cleared for '+p);go('/home')};
addEventListener('hashchange',()=>{const h=location.hash.replace(/^#/,'')||'/home';if(h!==shown){CUR=null;router()}});
/* Handle in-page links ourselves so navigation also works in phone and file viewers that block #links. */
document.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('a[href^="#/"]');if(!a)return;e.preventDefault();go(a.getAttribute('href').slice(1))});
Store.seed();router();
