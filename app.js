var D=window.__DATA__, PDFS=window.__PDFS__||null;
if(!D)throw new Error('Daten fehlen — daten.json wurde nicht geladen.');
var P=D.parteien;
var PCL={'AfD':'#1f7f97','CDU':'#4a4741','FDP':'#8f6c00','Grüne':'#37772c','Die Linke':'#7d4bbf','SPD':'#c62f27','Volt':'#26719f'};
var PCD={'AfD':'#4fb6cf','CDU':'#c9c3b6','FDP':'#dbb43c','Grüne':'#6fbb5f','Die Linke':'#b18ee0','SPD':'#e8736a','Volt':'#7cc3f0'};
function dark(){return false}
var PC=new Proxy({},{get:function(_,k){return (dark()?PCD:PCL)[k]}});
var PSPEK=['Die Linke','Grüne','SPD','Volt','FDP','CDU','AfD'].filter(function(p){return D.parteien.indexOf(p)>=0});
var PSORT=load('wp26_psort','az'); // 'az' oder 'spektrum'
function parteienNachSort(){
  if(PSORT==='spektrum')return PSPEK.slice();
  return D.parteien.slice().sort(function(a,b){return a.localeCompare(b,'de')});}
function setPSort(m){PSORT=m;save('wp26_psort',m);render();}
function psortBtn(){
  return '<div class="sortb" style="margin-left:0"><span class="fl">Reihenfolge</span>'+
    [['az','A–Z'],['spektrum','Spektrum']].map(function(x){
      return '<button class="'+(PSORT===x[0]?'on':'')+'" onclick="setPSort(\''+x[0]+'\')"'+
        (x[0]==='spektrum'?' title="Grobe Einordnung von links nach rechts \u2014 eigene Einschätzung, kein Anspruch auf Objektivität"':'')+
        '>'+x[1]+'</button>'}).join('')+'</div>';}
var BALKEN=load('wp26_balken','farbe'); // 'farbe' oder 'kontrast'
function setBalken(m){BALKEN=m;save('wp26_balken',m);render();}
function balkenBtn(){
  return '<div class="sortb" style="margin:8px 0 2px"><span class="fl">Darstellung</span>'+
    [['farbe','Farben'],['kontrast','Hoher Kontrast']].map(function(x){
      return '<button class="'+(BALKEN===x[0]?'on':'')+'" onclick="setBalken(\''+x[0]+'\')">'+x[1]+'</button>'}).join('')+'</div>';}
var SL={K:'Klare Forderung',A:'Lehnt ab',T:'Teils dafür, teils dagegen',Z:'Absichtserklärung'};
var SLL={K:'Klare Forderung',A:'Nur Ablehnung',T:'Teils dafür, teils dagegen',Z:'Absichtserklärung'};
var LEGT={K:'Das Programm fordert etwas Bestimmtes. Manche dieser Antworten lehnen daneben ausdrücklich etwas ab — das steht dann in der Antwort.',
 A:'Das Programm weist etwas zurück, ohne zu derselben Frage einen eigenen Weg zu beschreiben.',
 T:'Das Programm ist an derselben Frage teils dafür, teils dagegen.',
 Z:'Das Programm nennt eine Absicht, ohne ein Instrument zu benennen.'};
var IN={'AfD':'AfD','CDU':'CDU','FDP':'FDP','Grüne':'Gr','Die Linke':'Li','SPD':'SPD','Volt':'Vo'};
var KERN=5; // ab so vielen Parteien gilt eine Frage als Kernfrage
var ALL=[],BYUT={},TFS=[],BYTF={},BYGRP={};
D.gruppen.forEach(function(g){BYGRP[g.c]=g;g.tf.forEach(function(t){
  t._g=g.n;t._gc=g.c;TFS.push(t);BYTF[t.c]=t;
  t.fragen.forEach(function(q){q._g=g.n;q._gc=g.c;q._t=t.n;q._tc=t.c;
    q._n=Object.keys(q.z).length;q._kern=q._n>=KERN;
    ALL.push(q);BYUT[q.c]=q;});});});
// Enthält die Antwort eine ausdrückliche Ablehnung? Das gilt auch dort, wo die Partei zugleich
// eine eigene Forderung stellt (Status „Klare Forderung" mit Ablehnungsmarke).
function lehntAb(c){return !!c&&(c.s==='A'||c.s==='T'||!!c.abl);}
function fordert(c){return !!c&&(c.s==='K'||c.s==='T'||c.s==='Z');}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){
  return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function de(n,d){return Number(n).toFixed(d==null?1:d).replace('.',',');}
/* ---------- Speicher ---------- */
function load(k,f){try{return JSON.parse(localStorage.getItem(k))||f}catch(e){return f}}
function save(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}
  if(window.SYNC&&SYNC.geaendert)SYNC.geaendert(k);}
var MK=load('wp26_mk',{}), WAHL=load('wp26_wahl',{});
function mkCount(){return Object.keys(MK).length}
function updMk(){var n=mkCount(),b=document.getElementById('mkc');
  if(!b)return;b.textContent=n?n:'';b.className=n?'mk':'mk hide';}
function updDurch(){var n=Object.keys(WAHL).length,b=document.getElementById('dfc');
  if(!b)return;b.textContent=n?n+'/'+ALL.length:'';b.className=n?'mk':'mk hide';}
function toggleMk(ut){if(MK[ut])delete MK[ut];else MK[ut]=1;save('wp26_mk',MK);updMk();
  document.querySelectorAll('[data-star="'+ut+'"]').forEach(function(s){
    s.className='star'+(MK[ut]?' on':'');s.textContent=MK[ut]?'★':'☆';});
  if(CUR==='merk')render();}
function pickPos(ut,p){if(WAHL[ut]===p)delete WAHL[ut];else WAHL[ut]=p;save('wp26_wahl',WAHL);render();}
/* ---------- Belege, ggf. als PDF-Tiefenlinks ---------- */
function belege(p,txt){
  if(!PDFS||!PDFS[p])return esc(txt);
  var f=PDFS[p];
  return esc(txt).replace(/(\d+)/g,function(m){
    return '<a class="pl" href="programme/'+f+'#page='+m+'" target="_blank" rel="noopener" '+
      'title="Seite '+m+' im Programm der '+esc(p)+' öffnen">'+m+'</a>';});}
/* ---------- Bausteine ---------- */
function chips(q,nur,klick){return (nur||P).map(function(p){var c=q.z[p];
  return '<i class="chip'+(c?'':' n')+'" style="border-bottom-color:'+(c?PC[p]:'#DFE2E8')+
    (c?';background:'+PC[p]+'1A':'')+(klick?';cursor:pointer':'')+'" title="'+esc(p)+': '+
    (c?SLL[c.s]:'Steht nicht im Programm')+(c&&c.abl?' (lehnt dabei etwas ab)':'')+'"'+
    (klick?' onclick="durchSpringZuPartei(\''+p.replace(/'/g,"\\'")+'\')"':'')+'>'+IN[p]+'</i>';}).join('');}
function flags(q){var h='';
  if(q.art==='gegenlaeufig')h+='<span class="badge um">Umstritten</span>';
  else if(q.art==='ungeteilt'&&q._n>=5)h+='<span class="badge kw">Kein Widerspruch</span>';
  if(q.v)h+='<span class="badge vg">Nur bedingt vergleichbar</span>';
  return h?'<div class="flags">'+h+'</div>':'';}
function klasse(q){return q._kern?' kern':'';}
function ktitel(q){return q._kern?' title="Kernfrage — '+q._n+' der sieben Parteien äußern sich dazu"':'';}
function kuerzungshinweis(){
  return '<div class="note"><b>Bitte im Programm gegenlesen.</b> Die Programminhalte sind für diese '+
   'Übersicht stark gekürzt. Bei der Zusammenfassung können Fehler entstanden sein oder Positionen '+
   'verkürzt wiedergegeben werden. Prüfe die genauen Positionen im Wahlprogramm der jeweiligen '+
   'Partei — die Seitenangabe an jeder Antwort führt dich direkt zur Fundstelle. '+
   '<button class="lnk" onclick="zurMethodik()">Wie diese Auswertung entstanden ist</button></div>';}
function kernlegende(){
  return '<div class="klg"><i></i><span>Fragen mit diesem Streifen sind <b>Kernfragen</b> — '+
   'mindestens fünf der sieben Parteien äußern sich dazu. Sie stehen je Themenfeld oben.</span></div>';}
function star(ut){return '<button class="star'+(MK[ut]?' on':'')+'" data-star="'+ut+'" '+
  'onclick="event.stopPropagation();event.preventDefault();toggleMk(\''+ut+'\')" '+
  'aria-label="Zur Merkliste hinzufügen oder entfernen">'+(MK[ut]?'★':'☆')+'</button>';}
function card(p,c,opt){
  opt=opt||{};
  if(!c)return '<div class="pc nt" data-partei="'+esc(p)+'"><div class="ph"><span class="pn" style="color:var(--soft)">'+esc(p)+
    '</span></div><div class="nx">Steht nicht im Programm</div></div>';
  var sel=opt.ut&&WAHL[opt.ut]===p;
  var h='<div class="pc'+(sel?' sel':'')+'" data-partei="'+esc(p)+'">'+
    (sel?'<div class="zub">✓ <b>Deine Zustimmung</b></div>':'')+'<div class="ph" style="border-bottom-color:'+PC[p]+'"><span class="pn">'+esc(p)+
    '</span><span class="st" style="color:'+PC[p]+'">'+SLL[c.s]+'</span></div><p>'+esc(c.p)+'</p>';
  if(c.z)h+='<div class="q2">'+esc(c.z)+'</div>';
  if(c.abl)h+='<div class="hint"><b>Lehnt dabei ausdrücklich etwas ab.</b> Die eigene Forderung steht '+
    'oben; die Ablehnung ist Teil derselben Aussage.</div>';
  h+='<div class="meta"><div><span class="lbl">Art:</span> '+esc(c.k)+'</div>';
  if(c.q)h+='<div><span class="lbl">Zahlen:</span> '+esc(c.q)+'</div>';
  if(c.e)h+='<div><span class="lbl">Nennt es:</span> '+esc(c.e)+'</div>';
  if(c.a)h+='<div><span class="lbl">Anmerkung:</span> '+esc(c.a)+'</div>';
  h+='<div><span class="lbl">Im Programm auf</span> <span class="beleg">'+belege(p,c.b)+'</span></div></div>';
  if(opt.pick)h+='<div style="margin-top:10px"><button class="'+(sel?'zst on':'zst')+'" onclick="pickPos(\''+opt.ut+
    '\',\''+p.replace(/'/g,"\\'")+'\')">'+(sel?'Zustimmung aufheben':'Stimme zu')+'</button></div>';
  return h+'</div>';}
function lagerzeile(q){
  var sicht=sichtbareParteien();
  var d=sicht.filter(function(x){return fordert(q.z[x])});
  var g=sicht.filter(function(x){return lehntAb(q.z[x])});
  return '<div class="lager"><span style="color:var(--kt)"><b>Dafür oder mit eigenem Vorschlag:</b></span> '+
    (d.length?esc(d.join(', ')):'niemand')+' &nbsp;·&nbsp; '+
    '<span style="color:var(--at)"><b>Lehnt etwas davon ab:</b></span> '+
    (g.length?esc(g.join(', ')):'niemand')+'</div>';}
function qInhalt(q,pick){
  pick=(pick===undefined)?true:pick;
  var h='';
  var w=pick?WAHL[q.c]:null;
  if(w)h+='<div class="pickbar">Du stimmst zu: <b>'+esc(w)+'</b> '+
    '<button class="clr" onclick="pickPos(\''+q.c+'\',\''+w.replace(/'/g,"\\'")+'\')">Zustimmung aufheben</button></div>';
  if(q.art==='ungeteilt'&&q._n>=5)
    h+='<div class="hint"><b>Kein Widerspruch</b> heißt: Keine Partei lehnt hier ausdrücklich ab. '+
       'Die konkreten Vorschläge können trotzdem weit auseinandergehen — vergleiche die Antworten.</div>';
  if(q.v)h+='<div class="hint vgl"><b>Nur bedingt vergleichbar.</b> '+esc(q.v)+'</div>';
  h+='<div class="pos">'+sichtbareParteien().map(function(p){
      return card(p,q.z[p],{ut:q.c,pick:pick&&q.z[p]})}).join('')+'</div>';
  return h;}
function qBlock(q,open,pick,zusatz){
  pick=(pick===undefined)?true:pick;
  var h='<details class="q'+klasse(q)+'"'+(open?' open':'')+' id="f-'+q.c+'"'+ktitel(q)+
    '><summary><div class="qt"><div class="qf">'+esc(q.f)+'</div><div class="qs">'+esc(q.s)+'</div>'+
    flags(q)+(zusatz||'')+'</div><div class="chips">'+chips(q,sichtbareParteien())+star(q.c)+
    '</div></summary><div class="qbody">'+qInhalt(q,pick)+'</div></details>';
  return h;}
function begriffeBox(){
  return '<details class="info begriffe"><summary><h3>Was bedeuten die Begriffe?</h3>'+
   '<span class="mhint">— kurz erklärt: die Antwort-Arten und die Hinweise unter manchen Fragen</span>'+
   '</summary><div class="begr">'+
   '<p><b>Die Antwort-Arten:</b></p>'+
   ['K','A','T','Z'].map(function(k){
     return '<p><b>'+esc(SLL[k])+'.</b> '+esc(LEGT[k])+'</p>'}).join('')+
   '<p><b>Steht nicht im Programm.</b> Das Thema kommt im Programm nicht vor. Das ist keine '+
   'Ablehnung.</p>'+
   '<p style="margin-top:14px"><b>Die Hinweise unter manchen Fragen:</b></p>'+
   '<p><span class="badge um">Umstritten</span> Mindestens eine Partei lehnt ausdrücklich ab, was '+
   'mindestens eine andere fordert.</p>'+
   '<p><span class="badge kw">Kein Widerspruch</span> Keine Partei lehnt hier ausdrücklich ab. Die '+
   'konkreten Vorschläge können trotzdem weit auseinandergehen — vergleiche die Antworten.</p>'+
   '<p><span class="badge vg">Nur bedingt vergleichbar</span> Die Programme beantworten die Frage '+
   'nicht in vergleichbarer Weise, zum Beispiel weil sie unterschiedliche Ebenen oder Zeiträume '+
   'meinen.</p></div></details>';}
/* ---------- Balkendiagramm ---------- */
// opt: {two:bool, names:[..], col:[farbe1,farbe2], sort:'html der Sortierleiste', einheit:'%'}
function chart(title,sub,rows,opt){
  opt=opt||{};
  var two=opt.two, names=opt.names||[], col=opt.col||['var(--c1)','var(--c2)'];
  var kontrast=BALKEN==='kontrast';
  if(kontrast)col=two?['#0072B2','#E69F00']:['#0072B2'];
  var eh=opt.einheit===undefined?' %':opt.einheit;
  var mx=Math.max.apply(null,rows.map(function(r){return two?Math.max(r.a,r.b):r.a}))||1;
  var nk=opt.nk===undefined?1:opt.nk;
  var h='<div class="chart"><div class="chart-h"><div><div class="chart-t">'+esc(title)+'</div>'+
    '<div class="chart-s">'+esc(sub)+'</div></div>'+(opt.sort||'')+'</div>'+balkenBtn();
  // Legende oben: sie erklärt die Farben, bevor man die Balken liest.
  if(two)h+='<div class="clg oben"><span><i class="csw" style="background:'+col[0]+'"></i>'+esc(names[0])+
    '</span><span><i class="csw" style="background:'+col[1]+'"></i>'+esc(names[1])+'</span></div>';
  h+='<div class="bars">';
  rows.forEach(function(r){
    if(two){
      h+='<div class="bar two" title="'+esc(r.n)+' — '+esc(names[0])+' '+de(r.a,nk)+eh+', '+esc(names[1])+' '+de(r.b,nk)+eh+'">'+
       '<div class="lbl">'+esc(r.n)+'</div><div class="track">'+
       '<div class="fill" style="width:'+(r.a/mx*100)+'%;background:'+col[0]+'"></div>'+
       '<div class="fill b" style="width:'+(r.b/mx*100)+'%;background:'+col[1]+'"></div></div>'+
       '<div class="val"><i style="color:'+col[0]+'">'+de(r.a,nk)+eh+'</i>'+
       '<i style="color:'+col[1]+'">'+de(r.b,nk)+eh+'</i></div></div>';
    }else{
      h+='<div class="bar" title="'+esc(r.n)+' — '+de(r.a,nk)+eh+
       (r.s!=null?' (rund '+de(r.s,0)+' Seiten)':'')+'">'+
       '<div class="lbl">'+esc(r.n)+'</div><div class="track">'+
       '<div class="fill" style="width:'+(r.a/mx*100)+'%;background:'+(kontrast?col[0]:(r.c||col[0]))+'"></div></div>'+
       '<div class="val">'+de(r.a,nk)+eh+'</div></div>';
    }});
  return h+'</div></div>';}
/* ---------- Säulendiagramm (senkrecht) ----------
   Für wenige Kategorien mit kurzen Namen. Jede Säule trägt Wert und Name direkt,
   die Farbe unterscheidet nichts und bleibt deshalb einheitlich. */
function saeulen(title,sub,rows,opt){
  opt=opt||{};
  var eh=opt.einheit===undefined?' %':opt.einheit;
  var nk=opt.nk===undefined?1:opt.nk;
  var mx=Math.max.apply(null,rows.map(function(r){return r.a}))||1;
  var h='<div class="chart"><div class="chart-h"><div><div class="chart-t">'+esc(title)+'</div>'+
    '<div class="chart-s">'+esc(sub)+'</div></div></div><div class="cols">';
  rows.forEach(function(r){
    var hh=Math.max(3,Math.round(r.a/mx*150));
    h+='<div class="col" title="'+esc(r.n)+': '+de(r.a,nk)+eh+'">'+
      '<div class="cv">'+de(r.a,nk)+eh+'</div>'+
      '<div class="cb" style="height:'+hh+'px'+(r.c?';background:'+r.c:'')+'"></div>'+
      '<div class="cn">'+esc(r.n)+'</div></div>';});
  return h+'</div></div>';}
/* ---------- Zustand ---------- */
var CUR='start',GRP=null,TFC=null,PA=null,PB=null,SB=load('wp26_sb',window.matchMedia('(max-width:900px)').matches?false:true),SORT='a';
var INTRO_OPEN=load('wp26_introopen',window.matchMedia('(max-width:720px)').matches?false:true);
var FILT_OPEN=load('wp26_filtopen',window.matchMedia('(max-width:720px)').matches?false:true);
var FKERN=false, FPAR=[], PSUB='profil', KSORT='seiten', GRPOPEN={}, GRPCLOSED={};
var DURCH_UT=load('wp26_durch',null), FOFFEN=false;
function fOffen(){FOFFEN=!FOFFEN;render();}
function passtDurch(q){return passt(q)&&(!FOFFEN||!WAHL[q.c]);}
function fKern(){FKERN=!FKERN;render();}
function fPartei(p){var i=FPAR.indexOf(p);if(i<0)FPAR.push(p);else FPAR.splice(i,1);render();}
function fAlle(){FPAR=[];FKERN=false;render();}
// Der Kernfragen-Filter blendet FRAGEN aus, der Parteien-Filter blendet SPALTEN aus.
function passt(q){return !(FKERN&&!q._kern);}
// In Ansichten ohne Parteien-Filter (Streitfragen, Zweiervergleich) wirkt eine anderswo
// getroffene Auswahl nicht — ein unsichtbarer Filter wäre irreführend.
var NOPARF=false;
function sichtbareParteien(){
  if(NOPARF)return P;
  return FPAR.length?P.filter(function(p){return FPAR.indexOf(p)>=0}):P;}
function filterleiste(n,ges,ohneParteien,mitOffen){
  var h='<div class="fgrp"><span class="fl">Filter</span>'+
   '<button class="'+(FKERN?'on':'')+'" onclick="fKern()" '+
   'title="Nur Fragen zeigen, zu denen sich mindestens fünf Parteien äußern">Nur Kernfragen</button>';
  if(mitOffen)h+='<button class="'+(FOFFEN?'on':'')+'" onclick="fOffen()" '+
   'title="Nur Fragen zeigen, zu denen du noch keine Position gewählt hast">Nur unbeantwortete</button>';
  h+='</div>';
  if(!ohneParteien){
    h+='<span class="sep"></span><div class="fgrp"><span class="fl">Partei</span>';
    P.forEach(function(p){
      h+='<button class="'+(FPAR.indexOf(p)>=0?'on':'')+'" onclick="fPartei(\''+p.replace(/'/g,"\\'")+'\')" '+
        'title="Antworten von '+esc(p)+' ein- oder ausblenden">'+esc(p)+'</button>';});
    h+='<button onclick="fAlle()" title="Alle Filter zurücksetzen">Alle anzeigen</button></div>';}
  if(!ohneParteien)h+='<span class="sep"></span><div class="fgrp">'+psortBtn()+'</div>';
  var sp=sichtbareParteien().length;
  h+='<span class="fcount">'+(n===ges?ges+' Fragen':n+' von '+ges+' Fragen')+
    (!ohneParteien&&sp<P.length?' · '+sp+' von '+P.length+' Parteien':'')+'</span>';
  return '<details class="filt"'+(FILT_OPEN?' open':'')+'><summary>'+
   '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '+
   'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h16M7 12h10M10 18h4"/></svg>'+
   '<span>Filter</span></summary><div class="fbody">'+h+'</div></details>';}
/* ---------- Symbole, eingebettet und ohne fremde Bibliothek ---------- */
function ico(n){var d={
 themen:'<path d="M4 5h16M4 11h16M4 17h10"/>',
 durch:'<path d="M6 5l7 7-7 7M13 5l7 7-7 7"/>',
 partei:'<circle cx="9" cy="8" r="3"/><path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/><path d="M16 7h5M16 11h5M16 15h3"/>',
 streit:'<path d="M13 3 5 13h6l-1 8 8-10h-6z"/>',
 ausw:'<path d="M5 20V10M12 20V4M19 20v-7"/>'};
 return '<span class="ico" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" '+
  'stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'+d[n]+'</svg></span>';}
function go(v,arg){CUR=v;NEU=true;
  if(v==='themen'&&arg){TFC=arg;GRP=BYTF[arg]?BYTF[arg]._gc:GRP}
  if(v==='partei'&&arg){PA=arg;PB=null;PSUB='profil'}
  window.scrollTo(0,0);render();
  document.querySelectorAll('nav button[data-v]').forEach(function(b){b.className=b.dataset.v===v?'on':''});}
function jumpTf(tf){TFC=tf;GRP=BYTF[tf]._gc;CUR='themen';NEU=true;render();
  document.querySelectorAll('nav button[data-v]').forEach(function(b){b.className=b.dataset.v==='themen'?'on':''});
  setTimeout(function(){var el=document.getElementById('tf-'+tf);
    if(el)el.scrollIntoView({block:'start',behavior:'smooth'})},60);}
function toggleSb(){SB=!SB;save('wp26_sb',SB);render();}
function jump(ut){var q=BYUT[ut];jumpTf(q._tc);
  setTimeout(function(){var el=document.getElementById('f-'+ut);
    if(el){el.open=true;el.scrollIntoView({block:'center'})}},260);}
/* ---------- Seitenleiste ---------- */
function sbThemen(){
  var h='<h4>Themenfelder</h4>';
  D.gruppen.forEach(function(g){
    h+='<h4>'+esc(g.n)+'</h4>';
    g.tf.forEach(function(t){
      var m=t.fragen.filter(passt).length;
      if(!m)return;
      h+='<a href="#" class="sp-'+t.c+'" onclick="jumpTf(\''+t.c+'\');return false">'+
        esc(t.n)+'<small>'+m+' Fragen</small></a>';});});
  return h;}
function sbAusw(){
  var gew=Object.keys(WAHL).length;
  if(!gew)return '<h4>Auswertung</h4><a href="#" onclick="return false" style="color:var(--soft)">Noch keine Auswahl</a>';
  var a=[['a-ges','Insgesamt'],['a-grp','Je Themengruppe'],['a-tf','Je Themenfeld'],['a-list','Deine Antworten']];
  return '<h4>Auswertung</h4>'+a.map(function(x){
    return '<a href="#'+x[0]+'" class="sp-'+x[0]+'" onclick="scrollTo2(\''+x[0]+
      '\');return false">'+x[1]+'</a>'}).join('');}
function sbStreit(){
  var um=streitFragen().filter(passt);
  var h='<h4>Streitfragen</h4>';
  D.gruppen.forEach(function(g){
    var teil=um.filter(function(q){return q._gc===g.c});
    if(!teil.length)return;
    h+='<h4>'+esc(g.n)+'</h4>';
    var tfs=[];teil.forEach(function(q){if(tfs.indexOf(q._tc)<0)tfs.push(q._tc)});
    tfs.forEach(function(tc){
      var n=teil.filter(function(q){return q._tc===tc}).length;
      h+='<a href="#" class="sp-'+tc+'" onclick="scrollTo2(\'st-'+tc+'\');return false">'+
        esc(BYTF[tc].n)+'<small>'+n+' '+(n===1?'Frage':'Fragen')+'</small></a>';});});
  return h;}
function sbVergleich(){
  // Beim Zweiervergleich navigiert die Leiste innerhalb des Parteien-Reiters, nicht in den Themen-Reiter.
  var h='<h4>'+esc(PA)+' gegen '+esc(PB)+'</h4>'+
   '<a href="#" class="sp-pkpi" onclick="scrollTo2(\'p-kpi\');return false">Kennzahlen</a>'+
   '<a href="#" class="sp-pschwer" onclick="scrollTo2(\'p-schwer\');return false">Schwerpunkte</a>';
  D.gruppen.forEach(function(g){
    var n=0;g.tf.forEach(function(t){n+=t.fragen.filter(function(q){
      return (q.z[PA]||q.z[PB])&&passt(q)}).length});
    if(!n)return;
    h+='<h4>'+esc(g.n)+'</h4>';
    g.tf.forEach(function(t){
      var m=t.fragen.filter(function(q){return (q.z[PA]||q.z[PB])&&passt(q)}).length;
      if(!m)return;
      h+='<a href="#" class="sp-'+t.c+'" onclick="scrollTo2(\'cv-'+t.c+'\');return false">'+
        esc(t.n)+'<small>'+m+' Fragen</small></a>';});});
  return h;}
function sbPartei(){
  if(PSUB==='kennz')return '<h4>Kennzahlen</h4><a href="#" onclick="return false" '+
    'style="color:var(--soft)">Tabelle über alle sieben Programme</a>';
  if(PA&&PB)return sbVergleich();
  if(!PA)return '<h4>Parteien</h4><a href="#" onclick="return false" style="color:var(--soft)">Wähle oben eine Partei</a>';
  var s=[['kpi','Kennzahlen'],['top','Stärkste und schwächste Themen'],['schwer','Schwerpunkte'],
         ['allein','Nur diese Partei'],['ablehn','Was sie ablehnt'],['zahlen','Zusagen mit Zahlen'],
         ['stumm','Fragen ohne Positionierung']];
  return '<h4>'+esc(PA)+'</h4>'+s.map(function(x){
    return '<a href="#p-'+x[0]+'" class="sp-p'+x[0]+'" onclick="scrollTo2(\'p-'+x[0]+
      '\');return false">'+x[1]+'</a>'}).join('');}
function scrollTo2(id){var el=document.getElementById(id);
  if(el){if(el.tagName==='DETAILS')el.open=true;el.scrollIntoView({block:'start',behavior:'smooth'})}}
/* ---------- Ansichten ---------- */
/* ---------- Startseite: Beispiel-Teaser ----------
   Einmal pro Seitenaufruf zufaellig gewaehlt und dann fuer die restliche Sitzung
   festgehalten, damit sich der Teaser nicht bei jedem Rendern (z.B. Merkzettel-Stern)
   unter der Hand aendert. */
var BEISPIEL=null, BEISPIEL_STREIT=null, KARUSSELL=null;
function beispiel(){
  if(!BEISPIEL){
    var kern=ALL.filter(function(q){return q._kern});
    var q=kern[Math.floor(Math.random()*kern.length)];
    BEISPIEL={q:q};}
  return BEISPIEL;}
function beispielTeaser(){
  var b=beispiel();
  return '<div class="beispiel"><div class="bstitel">Beispiel aus den Programmen</div>'+
   '<h3 style="margin:6px 0 12px">'+esc(b.q.f)+'</h3>'+
   '<div class="pos">'+sichtbareParteien().map(function(p){return card(p,b.q.z[p])}).join('')+
   '</div>'+
   '<p class="lead" style="margin-top:12px">Zu jeder der '+D.meta.ut+' Fragen stehen alle sieben '+
   'Positionen — so wie hier. <button class="lnk" onclick="jump(\''+b.q.c+
   '\')">Alle 7 Positionen zu dieser Frage ansehen</button></p></div>';}
function beispielStreit(){
  if(!BEISPIEL_STREIT){
    var s=streitFragen();
    BEISPIEL_STREIT=s[Math.floor(Math.random()*s.length)];}
  return BEISPIEL_STREIT;}
function streitTeaser(){
  var q=beispielStreit();
  return '<div class="beispiel"><div class="bstitel">Eine von '+streitFragen().length+
   ' Streitfragen</div><h3 style="margin:6px 0 12px">'+esc(q.f)+'</h3>'+lagerzeile(q)+
   '<p class="lead" style="margin-top:12px"><button class="lnk" '+
   'onclick="go(\'streit\')">Alle Streitfragen ansehen</button></p></div>';}
function karussellWahl(){
  var pool=ALL.filter(function(q){return q._kern});
  var pick=[],used={},n=Math.min(10,pool.length);
  while(pick.length<n){
    var q=pool[Math.floor(Math.random()*pool.length)];
    if(used[q.c])continue;used[q.c]=true;pick.push(q);}
  return pick;}
function karussellKarte(q,hidden){
  return '<button class="fragchip"'+(hidden?' tabindex="-1" aria-hidden="true"':'')+
    ' onclick="jump(\''+q.c+'\')"><span class="qf">'+esc(q.f)+'</span>'+
    '<div class="chips">'+chips(q,sichtbareParteien())+'</div></button>';}
function karussellTeaser(){
  if(!KARUSSELL)KARUSSELL=karussellWahl();
  var chipsHtml=KARUSSELL.map(function(q){return karussellKarte(q,false)}).join('');
  var dup=KARUSSELL.map(function(q){return karussellKarte(q,true)}).join('');
  return '<div id="s-karussell" class="sp" data-sp="s-karussell">'+
   '<div class="bstitel">Ein paar Fragen zum Reinklicken</div>'+
   '<div class="karussell"><div class="karussell-track" id="ktrack">'+chipsHtml+dup+
   '</div></div></div>';}
function karussellSpeed(){
  var tr=document.getElementById('ktrack');
  if(!tr)return;
  var w=tr.scrollWidth/2, pxs=32;
  tr.style.animationDuration=Math.max(20,Math.round(w/pxs))+'s';}
function methodikBox(){
  return '<details class="info sp" id="s-methodik" data-sp="s-methodik"><summary><h3>'+
   'Wie diese Übersicht entstanden ist</h3><span class="mhint">— kurz: alle sieben Programme '+
   'vollständig gelesen, mit einem KI-System in '+D.meta.ut+' Fragen gegliedert, jede Aussage '+
   'mit Seite und Zitat belegt. Mehr erfahren</span></summary>'+vMethodik()+'</details>';}
function parteienListe(){
  var a=P.slice();
  if(a.length<2)return a.join('');
  return a.slice(0,-1).join(', ')+' und '+a[a.length-1];}
function slug(s){return s.toLowerCase()
  .replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss')
  .replace(/[^a-z0-9]+/g,'');}
function logoFehler(img){
  var span=document.createElement('span');
  span.className='pl-ini';
  span.textContent=IN[img.alt]||img.alt;
  img.replaceWith(span);}
function parteiLogos(){
  return '<div class="pl-cap">Die Wahlprogramme folgender Parteien wurden ausgewertet</div>'+
   '<div class="pl-row">'+P.map(function(p){
     return '<button class="pl-item" onclick="go(\'partei\',\''+p.replace(/'/g,"\\'")+'\')"><span class="pl-badge" style="border-bottom-color:'+PC[p]+
       ';background:'+PC[p]+'1A"><img src="logos/'+slug(p)+'.webp" alt="'+esc(p)+'" '+
       'onerror="logoFehler(this)"></span><span class="pl-name">'+esc(p)+'</span></button>';
   }).join('')+'</div>';}
function vStart(){
  var M=D.meta;
  var tfz=0;D.gruppen.forEach(function(g){tfz+=g.tf.length});
  var h='<div id="s-intro" class="sp" data-sp="s-intro"></div>';
  h+='<p class="hero">Sieben Programme, '+M.seiten.toLocaleString('de-DE')+' Seiten; '+
   M.ut+' Fragen.</p>';
  h+='<p class="lead gross">Am 20. September 2026 wird das Berliner Abgeordnetenhaus gewählt. '+
   'Hier kannst du die Positionen und Inhalte der Wahlprogramme der beliebtesten Parteien anhand '+
   'von '+M.ut+' Fragen entlang von '+tfz+' Themenfeldern auswerten und vergleichen. Jede '+
   'Position ist wörtlich zitiert und mit Seitenangabe zum originalen Wahlprogramm versehen.</p>';
  h+=parteiLogos();
  h+=karussellTeaser();
  h+='<p class="lead gross">Hier wird keine Empfehlung ausgesprochen. Diese Auswertung bewertet '+
   'nicht, stuft nicht ein und sagt nichts darüber, ob ein Vorhaben bezahlbar, rechtlich möglich '+
   'oder überhaupt Sache des Landes Berlin ist. Sie zeigt, was in den Programmen steht.</p>';
  h+='<h3 id="s-einstieg" class="sp" data-sp="s-einstieg">Wo möchtest du anfangen?</h3>';
  var qv=document.getElementById('q')?document.getElementById('q').value:'';
  h+='<input id="q2" class="qbig" type="search" '+
   'placeholder="Direkt eine Frage suchen … z. B. Mietendeckel, Tempelhofer Feld, Kita-Plätze" '+
   'value="'+esc(qv)+'" oninput="suchEingabe(this.value)" '+
   'onkeydown="if(event.key===\'Enter\')suchAusloesen(this.value)" '+
   'aria-label="In allen Fragen und Antworten suchen">';
  h+='<div class="ways">'+
   '<button class="way" onclick="go(\'themen\')">'+ico('themen')+'<b>Nach Thema stöbern</b>'+
   '<span>'+M.ut+' Fragen in neun Themengruppen, mit den Antworten aller sieben Programme '+
   'nebeneinander.</span></button>'+
   '<button class="way" onclick="go(\'durch\')">'+ico('durch')+'<b>Frage für Frage</b>'+
   '<span>Jede Frage einzeln durchgehen, mit allen sieben Positionen nebeneinander — für die '+
   'konzentrierte Runde statt des Überblicks.</span></button>'+
   '<button class="way" onclick="go(\'streit\')">'+ico('streit')+'<b>Wo wird gestritten?</b>'+
   '<span>Die '+streitFragen().length+' Fragen, bei denen mindestens eine Partei ablehnt, was '+
   'eine andere fordert.</span></button>'+
   '<button class="way" onclick="go(\'partei\')">'+ico('partei')+'<b>Eine Partei ansehen</b>'+
   '<span>Profil eines Programms: Schwerpunkte, Alleinstellungen, was es ablehnt, was es in '+
   'Zahlen zusagt.</span></button>'+
   '<button class="way" onclick="go(\'ausw\')">'+ico('ausw')+'<b>Eigene Auswahl auswerten</b>'+
   '<span>Positionen zustimmen und sehen, wie sich die Zustimmung über die Themen '+
   'verteilt.</span></button>'+
   '</div>';
  h+='<h3 id="s-gruppen" class="sp" data-sp="s-gruppen">Direkt zu einem Thema springen</h3><div class="grid">';
  D.gruppen.forEach(function(g){
    var n=0,k=0;g.tf.forEach(function(t){n+=t.fragen.length;
      t.fragen.forEach(function(q){if(q._kern)k++})});
    h+='<button class="gcard" onclick="jumpTf(\''+g.tf[0].c+'\')"><b>'+esc(g.n)+'</b>'+
       '<span>'+n+' Fragen · '+k+' Kernfragen</span></button>';});
  h+='</div>';
  h+='<div id="s-beispiel" class="sp" data-sp="s-beispiel">'+beispielTeaser()+'</div>';
  h+='<div id="s-streit" class="sp" data-sp="s-streit">'+streitTeaser()+'</div>';
  h+='<details class="info sp" id="s-wege" data-sp="s-wege"><summary><h3>So kommst du durch die '+
   'Seite</h3><span class="mhint">— kurz: oben die Reiter wählen, hier stehen sie einzeln '+
   'erklärt</span></summary>';
  var wege=[
   ['themen','Themen','hier kannst du die Positionen jeder Partei zu jeder Frage einsehen und '+
    'vergleichen. Fragen kannst du mit dem Stern auf die Merkliste setzen. Positionen kannst '+
    'du zustimmen.'],
   ['durch','Frage für Frage','hier gehst du jede Frage einzeln durch, mit allen sieben '+
    'Positionen nebeneinander, und kannst gezielt zu einem Themenfeld springen.'],
   ['partei','Parteien','hier kannst du ein einzelnes Programm im Profil ansehen — Schwerpunkte, '+
    'Alleinstellungen, Ablehnungen, Zusagen mit Zahlen. Wählst du eine zweite Partei dazu, stehen '+
    'beide nebeneinander. Ein Unterreiter stellt die Kennzahlen aller sieben Programme in einer '+
    'Tabelle gegenüber.'],
   ['streit','Streitfragen','hier kannst du die Fragen nachlesen, bei denen mindestens eine Partei '+
    'ablehnt, was eine andere fordert.'],
   ['ausw','Auswertung','hier kannst du einsehen, wie sich deine Zustimmung über die Parteien, die '+
    'Themengruppen und die einzelnen Themenfelder verteilt. Sie bleibt in deinem Browser und wird '+
    'nirgends gespeichert.'],
   ['merk','Merkliste','hier findest du die Fragen wieder, die du dir gemerkt hast.'],
   ['prog','Programme','hier findest du die Eckdaten zu jedem Wahlprogramm'+
    (PDFS?' sowie die Originaldokumente zum Herunterladen. Jede Seitenangabe in den Antworten '+
     'führt direkt auf die betreffende Seite im PDF.':'.')]];
  h+='<div class="wege">'+wege.map(function(w){
    return '<p><button class="lnk" onclick="go(\''+w[0]+'\')">'+esc(w[1])+
      '</button> — '+w[2]+'</p>'}).join('')+'</div></details>';
  h+=methodikBox();
  return h;}
/* ---------- Methodik: steht am Fuß der Startseite ----------
   Alle Zahlen werden aus den Daten gezogen, damit sie nach Korrekturen richtig bleiben. */
// Kleine Zahlen im Fließtext werden ausgeschrieben.
var WORT={1:'ein',2:'zwei',3:'drei',4:'vier',5:'fünf',6:'sechs',7:'sieben',8:'acht',9:'neun',
 10:'zehn',11:'elf',12:'zwölf'};
function wort(n){return WORT[n]||String(n);}
function zahlen(){
  var z={ut:0,zell:0,zit:0,kern:0,anm:0,vgl:0,quant:0,abl:0,mitabl:0};
  ALL.forEach(function(q){
    z.ut++; if(q._kern)z.kern++; if(q.v)z.vgl++;
    P.forEach(function(p){var c=q.z[p];if(!c)return;
      z.zell++; if(c.z)z.zit++; if(c.a)z.anm++; if(c.q)z.quant++;
      if(c.s==='A'){z.abl++} if(c.abl){z.mitabl++}});});
  var b=[],g=[];
  P.forEach(function(p){b.push(D.schwer[p].belegte/D.stats[p].seiten*100)});
  return z;}
function vMethodik(){
  var z=zahlen(), M=D.meta, n=function(x){return x.toLocaleString('de-DE')};
  var anteile=P.map(function(p){return D.schwer[p].belegte/D.stats[p].seiten*100});
  var amin=Math.round(Math.min.apply(null,anteile)), amax=Math.round(Math.max.apply(null,anteile));
  var tfz=0;D.gruppen.forEach(function(g){tfz+=g.tf.length});
  var h='';
  function ab(t,k){return '<h4 class="mh">'+t+'</h4>'+k;}
  h+=ab('Was ausgewertet wurde',
   '<p class="lead">Grundlage sind ausschließlich die sieben Wahlprogramme zur Wahl des Berliner '+
   'Abgeordnetenhauses am 20. September 2026: '+esc(P.join(', '))+', zusammen '+n(M.seiten)+
   ' Seiten. Es wurde nichts hinzugezogen — kein früheres Programm, kein Koalitionsvertrag, keine '+
   'Berichterstattung, kein Vorwissen über die Parteien. Was nicht im Dokument steht, gilt als '+
   'nicht thematisiert. Die Programme wurden zu unterschiedlichen Zeitpunkten beschlossen, '+
   'zwischen Februar und Juni 2026; wo ein Dokument den Beschlussstand nennt, steht er im Reiter '+
   '<button class="lnk" onclick="go(\'prog\')">Programme</button>.</p>');
  h+=ab('Womit ausgewertet wurde',
   '<p class="lead">Auswertung und Codierung wurden mit einem KI-System erstellt. Dabei können '+
   'Fehler unterlaufen sein und Positionen verkürzt oder unzutreffend wiedergegeben werden. Jede '+
   'Aussage sollte deshalb im Original des Wahlprogramms gegengeprüft werden. An jeder Antwort '+
   'steht dafür die Seite des Wahlprogramms, auf der die zugrunde liegende Aussage zu finden ist. '+
   'Gezählt wird die Seite der PDF-Datei — bei Programmen mit Titel- und Trennseiten weicht sie '+
   'von der aufgedruckten Seitenzahl ab.</p>');
  h+=ab('Wie gelesen wurde',
   '<p class="lead">Jedes Programm wurde vollständig und Seite für Seite durchgearbeitet, nicht '+
   'überflogen und nicht über das Inhaltsverzeichnis erschlossen. Dabei wurden '+n(M.themen)+
   ' einzelne Aussagen erfasst, jede mit Kapitel und Seitenzahl.</p>');
  h+=ab('Wie daraus Fragen wurden',
   '<p class="lead">Die '+n(M.themen)+' Aussagen wurden nach Sachfragen gebündelt — rein aus dem '+
   'Material heraus, ohne vorgegebenes Raster. So entstanden '+z.ut+' Unterthemen in '+tfz+
   ' Themenfeldern und '+wort(D.gruppen.length)+' Themengruppen. Jedes Unterthema ist als offene '+
   'Frage '+
   'formuliert, die keine Antwort nahelegt und kein Programm-Vokabular übernimmt: nicht '+
   '„Wie stoppen wir den Mietenwahnsinn?", sondern „Sollen die Mieten im Bestand gesetzlich '+
   'begrenzt werden?" So kann jedes Programm unter derselben Frage antworten.</p>');
  h+=ab('Wie codiert wurde',
   '<p class="lead">Zu jeder Kombination aus Frage und Programm entstand eine Antwort, sofern das '+
   'Programm etwas dazu sagt — '+n(z.zell)+' Antworten insgesamt. Jede besteht aus einer '+
   'Zusammenfassung in sachlicher Sprache, der Seitenangabe, einem wörtlichen Kurzzitat von '+
   'höchstens 15 Wörtern und einer von vier Kennzeichnungen.</p>'+
   '<table><tbody>'+
   '<tr><td style="width:210px"><span class="st K">Klare Forderung</span></td>'+
   '<td>Das Programm will etwas Bestimmtes.</td></tr>'+
   '<tr><td><span class="st Z">Absichtserklärung</span></td>'+
   '<td>Eine Richtung ohne konkretes Mittel.</td></tr>'+
   '<tr><td><span class="st A">Nur Ablehnung</span></td>'+
   '<td>Etwas wird zurückgewiesen, ohne dass zur selben Frage ein eigener Weg beschrieben wird.</td></tr>'+
   '<tr><td><span class="st T">Teils dafür, teils dagegen</span></td>'+
   '<td>Beides steht in derselben Aussage.</td></tr>'+
   '<tr><td><b>Steht nicht im Programm</b></td>'+
   '<td>Das Wahlprogramm enthält keine Positionierung zu dieser Frage. Das ist keine Ablehnung.</td></tr>'+
   '</tbody></table>'+
   '<p class="lead">'+n(z.zit)+' der '+n(z.zell)+' Antworten tragen ein wörtliches Zitat. Wo '+
   'Beträge, Quoten, Fristen oder Zieljahre genannt sind, stehen sie wörtlich dabei — '+
   z.quant+'-mal.</p>');
  h+=ab('Forderungen, die zugleich etwas ablehnen',
   '<p class="lead">Viele Programme fordern etwas und weisen im selben Zug ein bestimmtes Mittel '+
   'zurück. Solche Antworten stehen als <b>Klare Forderung</b> mit dem Vermerk, dass daneben '+
   'ausdrücklich etwas abgelehnt wird. Von '+(z.abl+z.mitabl)+' Antworten mit einer ausdrücklichen '+
   'Ablehnung enthalten '+z.mitabl+' zugleich eine eigene Forderung, belegt durch ein wörtliches '+
   'Zitat; '+z.abl+' sind reine Zurückweisungen.</p>');
  h+=ab('Kernfragen',
   '<p class="lead">Zu '+z.kern+' der '+z.ut+' Fragen äußern sich mindestens '+wort(KERN)+' der sieben '+
   'Parteien. Bei ihnen trägt ein Vergleich am weitesten; sie sind mit einem Streifen markiert '+
   'und stehen je Themenfeld oben. Bei den übrigen äußern sich zu wenige Programme, als dass ein '+
   'Nebeneinander viel aussagen würde.</p>');
  h+=ab('Wie die Schwerpunkte berechnet werden',
   '<p class="lead">Für jede Seite eines Programms ist festgehalten, welche Themenfelder sie '+
   'berührt. Jede Seite zählt genau einmal und wird zu gleichen Teilen auf diese Felder '+
   'aufgeteilt — eine Seite über Mieten und Klima zählt je 0,5. Ausgewiesen wird der Anteil eines '+
   'Themenfelds an allen Seiten, auf denen das Programm überhaupt Position bezieht; die Anteile '+
   'ergeben zusammen 100 %. Je nach Programm sind das '+amin+' bis '+amax+' % der Seiten, der '+
   'Rest sind Titel-, Trenn- und Leerseiten. Weil es ein Anteil ist, lassen sich damit auch '+
   'unterschiedlich lange Programme vergleichen.</p>');
  h+=ab('Was ausdrücklich markiert ist',
   '<p class="lead">Widersprüche innerhalb eines Programms wurden nicht geglättet, sondern stehen '+
   'als Anmerkung an der Antwort — '+z.anm+'-mal. Wo zwei Programme formal zur selben Frage '+
   'sprechen, faktisch aber über verschiedene Dinge, ist die Frage als „nur bedingt vergleichbar" '+
   'gekennzeichnet; das betrifft '+z.vgl+' Fragen.</p>');
  h+=ab('Was diese Übersicht nicht leistet',
   '<p class="lead">Sie bewertet nicht und empfiehlt keine Partei. Sie sagt nichts darüber, ob ein '+
   'Vorhaben umsetzbar, bezahlbar oder rechtlich zulässig ist, und prüft nicht, ob eine Forderung '+
   'in der Zuständigkeit des Landes liegt — vieles davon wäre Sache des Bundes. Die '+
   'Zusammenfassungen sind stark gekürzt; dabei können Fehler entstanden sein oder Positionen '+
   'verkürzt wirken. Deshalb steht an jeder Antwort die Seitenzahl: im Zweifel gilt das '+
   'Programm, nicht diese Seite.</p>');
  return h;}
function zurMethodik(){
  if(CUR!=='start'){go('start');setTimeout(function(){scrollTo2('s-methodik')},80);}
  else scrollTo2('s-methodik');}
function sbStart(){
  var a=[['s-intro','Worum es geht'],['s-einstieg','Wo möchtest du anfangen?'],
         ['s-gruppen','Direkt zu einem Thema springen'],
         ['s-karussell','Ein paar Fragen zum Reinklicken'],
         ['s-beispiel','Beispiel aus den Programmen'],['s-streit','Wo wird gestritten'],
         ['s-wege','So kommst du durch die Seite'],
         ['s-methodik','Wie das entstanden ist']];
  return '<h4>Startseite</h4>'+a.map(function(x){
    return '<a href="#'+x[0]+'" class="sp-'+x[0]+'" onclick="scrollTo2(\''+x[0]+
      '\');return false">'+x[1]+'</a>'}).join('');}
function sortiert(fragen){
  return fragen.slice().sort(function(a,b){
    return ((b._kern?1:0)-(a._kern?1:0))||(b._n-a._n);});}
function durchListe(){
  var out=[];
  D.gruppen.forEach(function(g){g.tf.forEach(function(t){
    sortiert(t.fragen).filter(passtDurch).forEach(function(q){out.push(q)});});});
  return out;}
function durchSpringZuTf(tf){
  var t=BYTF[tf];if(!t)return;
  var q=sortiert(t.fragen).filter(passtDurch)[0];
  if(q)durchGehe(q.c);}
function durchSpringZuPartei(p){
  var box=document.querySelector('.durch-card .pos');
  if(!box)return;
  var el=box.querySelector('[data-partei="'+p.replace(/"/g,'')+'"]');
  if(el)el.scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'});}
function durchGehe(ut){DURCH_UT=ut;save('wp26_durch',ut);window.scrollTo(0,0);render();}
function durchSchritt(delta){
  var liste=durchListe();
  var i=liste.findIndex(function(q){return q.c===DURCH_UT});
  if(i<0)i=0;
  var ni=Math.max(0,Math.min(liste.length-1,i+delta));
  if(liste[ni])durchGehe(liste[ni].c);}
function vDurch(){
  var liste=durchListe();
  var h='<h2>Frage für Frage</h2><p class="lead durch-intro">Eine Frage nach der anderen, mit allen sieben '+
   'Positionen nebeneinander — für die konzentrierte Runde statt des Überblicks. Für den '+
   'schnellen Überblick eher der Reiter <b>Themen</b>.</p>'+filterleiste(liste.length,ALL.length,false,true);
  if(!liste.length)return h+'<div class="empty">Keine Frage passt zu diesen Filtern.</div>';
  var i=liste.findIndex(function(q){return q.c===DURCH_UT});
  if(i<0){i=0;DURCH_UT=liste[0].c;save('wp26_durch',DURCH_UT);}
  var q=liste[i];
  var tfFragen=sortiert(BYTF[q._tc].fragen).filter(passtDurch);
  var tfi=tfFragen.findIndex(function(x){return x.c===q.c});
  if(tfi<0)tfi=0;
  var opts='';
  D.gruppen.forEach(function(g){
    var innen='';
    g.tf.forEach(function(t){
      if(!sortiert(t.fragen).filter(passtDurch).length)return;
      innen+='<option value="'+t.c+'"'+(t.c===q._tc?' selected':'')+'>'+esc(t.n)+'</option>';});
    if(innen)opts+='<optgroup label="'+esc(g.n)+'">'+innen+'</optgroup>';});
  h+='<div class="durch"><div class="durch-top"><span class="durch-bc">'+esc(q._g)+' › </span>'+
   '<span class="durch-jumpwrap"><select class="durch-jump" onchange="durchSpringZuTf(this.value)" '+
   'aria-label="Zu einem anderen Themenfeld springen">'+opts+'</select></span></div>';
  h+='<div class="durch-bar"><div class="durch-bar-fill" style="width:'+((tfi+1)/tfFragen.length*100)+
   '%"></div></div><div class="durch-barlabel">'+(tfi+1)+' von '+tfFragen.length+
   ' in diesem Themenfeld</div>';
  h+='<div class="durch-card"><div class="qt"><div class="qf">'+esc(q.f)+'</div><div class="qs">'+
   esc(q.s)+'</div>'+flags(q)+'</div><div class="chips">'+chips(q,sichtbareParteien(),true)+star(q.c)+
   '</div>'+qInhalt(q)+'</div>';
  h+='<div class="durch-nav">'+
   '<button class="durch-btn"'+(i<=0?' disabled':'')+' onclick="durchSchritt(-1)">\u2190 Zurück</button>'+
   '<button class="durch-btn primary"'+(i>=liste.length-1?' disabled':'')+' onclick="durchSchritt(1)">Weiter \u2192</button>'+
   '</div>';
  if(i>=liste.length-1)h+='<p class="lead" style="margin-top:10px">Das waren alle '+liste.length+
   ' Fragen zu diesen Filtern.</p>';
  h+='</div>';
  return h;}
function vThemen(){
  var sicht=ALL.filter(passt).length;
  var h='<h2>Themen</h2>';
  h+='<details class="info themeninfo"'+(INTRO_OPEN?' open':'')+'><summary><h3>Wie diese Übersicht '+
   'funktioniert</h3><span class="mhint">— kurz: Themenfeld wählen, Positionen vergleichen, zustimmen '+
   'was passt</span></summary><div class="ti-body"><p class="lead">Links kannst du das Themenfeld '+
   'wählen, alternativ durch die Seite scrollen. Die Positionen der Parteien zu einer Frage siehst du, '+
   'wenn du die Frage anklickst. Du kannst den Positionen zustimmen, die dir am meisten zusagen — die '+
   'Auswertung deiner Zustimmung findest du im Reiter <b>Auswertung</b>.</p>'+kuerzungshinweis()+
   kernlegende()+begriffeBox()+'</div></details>';
  h+=filterleiste(sicht,ALL.length);
  if(!sicht)return h+'<div class="empty">Keine Frage passt zu diesen Filtern.</div>';
  D.gruppen.forEach(function(g){
    var n=0;g.tf.forEach(function(t){n+=t.fragen.filter(passt).length});
    if(!n)return;
    var offen=g.tf.some(function(t){return t.c===TFC});
    var voll=offen||GRP===g.c||(GRPOPEN[g.c]&&!GRPCLOSED[g.c]);
    h+='<details class="grp"'+(voll?' open':'')+' data-g="'+g.c+'"><summary>'+esc(g.n)+
      '<span class="cnt">'+n+' '+(n===1?'Frage':'Fragen')+'</span></summary>'+
      (voll?'<div class="tf">'+gruppeTf(g)+'</div>':'<div class="tf" data-lazy-g="'+g.c+'"></div>')+
      '</details>';});
  return h;}
function gruppeTf(g){
  var h='';
  g.tf.forEach(function(t){
    var fr=sortiert(t.fragen).filter(passt);
    if(!fr.length)return;
    var k=fr.filter(function(q){return q._kern}).length;
    h+='<h3 class="tfhd sp" id="tf-'+t.c+'" data-sp="'+t.c+'"><span class="tftxt">'+esc(t.n)+'</span>'+
      '<span class="cnt">'+fr.length+' Fragen'+(k?' · '+k+' Kernfragen':'')+'</span></h3>';
    fr.forEach(function(q){h+=qBlock(q)});});
  return h;}
function bindKlappen(){
  var f=document.querySelector('#view details.filt');
  if(f&&!f.dataset.bound){f.dataset.bound='1';
    f.addEventListener('toggle',function(){FILT_OPEN=f.open;save('wp26_filtopen',f.open)});}
  var t=document.querySelector('#view details.themeninfo');
  if(t&&!t.dataset.bound){t.dataset.bound='1';
    t.addEventListener('toggle',function(){INTRO_OPEN=t.open;save('wp26_introopen',t.open)});}}
function lazyGruppenBinden(){
  document.querySelectorAll('#shell details.grp[data-g]').forEach(function(d){
    var gc=d.dataset.g;
    if(d.dataset.lazyBound)return;
    d.dataset.lazyBound='1';
    d.addEventListener('toggle',function(){
      if(!d.open){GRPCLOSED[gc]=true;return;}
      GRPOPEN[gc]=true;delete GRPCLOSED[gc];
      var tf=d.querySelector('.tf[data-lazy-g]');
      if(tf){var g=BYGRP[gc];if(g){tf.innerHTML=gruppeTf(g);}tf.removeAttribute('data-lazy-g');}
      window.requestAnimationFrame(spyRun);});});}
function streitFragen(){return ALL.filter(function(q){return q.art==='gegenlaeufig'});}
function vStreit(){
  NOPARF=true;
  var um=streitFragen().filter(passt), ges=streitFragen().length;
  var h='<h2>Wo wird gestritten?</h2><p class="lead">Bei diesen '+ges+' Fragen lehnt mindestens '+
   'eine Partei ausdrücklich ab, was mindestens eine andere fordert.</p>'+
   '<div class="note">Eine Partei kann in <b>beiden</b> Zeilen stehen. Das heißt, dass sie etwas '+
   'ablehnt und zugleich einen eigenen Vorschlag macht. In den Antworten steht bei ihr dann '+
   '„Teils dafür, teils dagegen" oder eine Forderung mit dem Zusatz, dass sie dabei ausdrücklich '+
   'etwas ablehnt. „Nur Ablehnung" steht nur dort, wo das Programm keinen eigenen Weg beschreibt.</div>'+
   filterleiste(um.length,ges,true)+kernlegende()+begriffeBox();
  if(!um.length){NOPARF=false;return h+'<div class="empty">Keine Frage passt zu diesem Filter.</div>';}
  D.gruppen.forEach(function(g){
    var teil=um.filter(function(q){return q._gc===g.c});
    if(!teil.length)return;
    h+='<details class="grp" open data-g="s-'+g.c+'"><summary>'+esc(g.n)+
      '<span class="cnt">'+teil.length+' '+(teil.length===1?'Streitfrage':'Streitfragen')+
      '</span></summary><div class="tf">';
    var tfs=[];teil.forEach(function(q){if(tfs.indexOf(q._tc)<0)tfs.push(q._tc)});
    tfs.forEach(function(tc){
      var fr=teil.filter(function(q){return q._tc===tc})
        .sort(function(a,b){return ((b._kern?1:0)-(a._kern?1:0))||(b.sp-a.sp)||(b._n-a._n)});
      h+='<h3 class="tfhd sp" id="st-'+tc+'" data-sp="'+tc+'"><span class="tftxt">'+esc(BYTF[tc].n)+'</span>'+
        '<span class="cnt">'+fr.length+'</span></h3>';
      fr.forEach(function(q){h+=qBlock(q,false,true,lagerzeile(q))});});
    h+='</div></details>';});
  NOPARF=false;
  return h;}
function vAusw(){
  var gew=Object.keys(WAHL).length;
  var h='<h2>Auswertung deiner Zustimmung</h2>';
  if(!gew)return h+'<p class="lead">Du hast noch keiner Position zugestimmt. Öffne im Reiter '+
   '<b>Themen</b> eine Frage und wähle unter einer Antwort „Stimme zu". '+
   'Die Auswertung bleibt in deinem Browser.</p>';
  // Kacheln
  var ges={};Object.keys(WAHL).forEach(function(u){ges[WAHL[u]]=(ges[WAHL[u]]||0)+1});
  var rang=P.slice().sort(function(a,b){return (ges[b]||0)-(ges[a]||0)});
  var grp={};Object.keys(WAHL).forEach(function(u){var q=BYUT[u];
    if(q)grp[q._g]=(grp[q._g]||0)+1});
  var gtop=Object.keys(grp).sort(function(a,b){return grp[b]-grp[a]})[0];
  var verteilt=P.filter(function(p){return ges[p]}).length;
  var kacheln=[['Fragen beantwortet',gew,de(gew/ALL.length*100,1)+' % von '+ALL.length],
    ['Meiste Zustimmung',rang[0],ges[rang[0]]+'× gewählt']];
  if(gew>=10){var letzt=rang[rang.length-1];
    kacheln.push(['Wenigste Zustimmung',letzt,(ges[letzt]||0)+'× gewählt']);}
  kacheln.push(['Dein Schwerpunkt',gtop||'—',grp[gtop]+' von '+gew+' Antworten']);
  kacheln.push(['Verteilt auf',verteilt+' von '+P.length,'Parteien']);
  h+='<div class="pgrid">'+kacheln.map(function(k){
    return '<div><b style="font-size:'+(String(k[1]).length>6?'19px':'26px')+'">'+esc(String(k[1]))+
      '</b><span>'+esc(k[0])+'</span><span style="color:var(--soft);font-size:12px">'+esc(k[2])+
      '</span></div>'}).join('')+'</div>';
  if(gew<10)h+='<p class="lead" style="font-size:13.5px">Die Kachel zur geringsten Zustimmung '+
    'erscheint ab zehn beantworteten Fragen — darunter wäre sie Zufall.</p>';
  h+='<p class="lead"><button class="clr" onclick="if(confirm(\'Alle Zustimmungen löschen?\')){WAHL={};save(\'wp26_wahl\',WAHL);render()}">Alle Zustimmungen löschen</button></p>';
  function saeule(titel,unter,zaehl,id){
    var rows=P.filter(function(p){return zaehl[p]}).map(function(p){
      return {n:p,a:zaehl[p],c:PC[p]}}).sort(function(a,b){return b.a-a.a});
    if(!rows.length)return '';
    return '<div'+(id?' id="'+id+'" class="sp" data-sp="'+id+'"':'')+'>'+
      saeulen(titel,unter,rows,{einheit:'',nk:0})+'</div>';}
  h+=saeule('Gewählte Positionen insgesamt','über alle '+gew+' beantworteten Fragen',ges,'a-ges');
  h+='<h3 id="a-grp" class="sp" data-sp="a-grp">Je Themengruppe</h3>';
  D.gruppen.forEach(function(g){
    var z={},n=0;Object.keys(WAHL).forEach(function(u){var q=BYUT[u];
      if(q&&q._gc===g.c){z[WAHL[u]]=(z[WAHL[u]]||0)+1;n++}});
    if(n)h+=saeule(g.n,n+' beantwortete '+(n===1?'Frage':'Fragen'),z);});
  var tfz={};
  Object.keys(WAHL).forEach(function(u){var q=BYUT[u];if(!q)return;
    (tfz[q._tc]=tfz[q._tc]||{})[WAHL[u]]=((tfz[q._tc]||{})[WAHL[u]]||0)+1;});
  var tfk=Object.keys(tfz);
  if(tfk.length){
    h+='<h3 id="a-tf" class="sp" data-sp="a-tf">Je Themenfeld</h3><p class="lead">Nur Themenfelder, '+
      'in denen du mindestens eine Frage beantwortet hast.</p>';
    tfk.sort(function(a,b){
      var sa=0,sb=0;Object.keys(tfz[a]).forEach(function(k){sa+=tfz[a][k]});
      Object.keys(tfz[b]).forEach(function(k){sb+=tfz[b][k]});return sb-sa;});
    tfk.forEach(function(tf){var n=0;Object.keys(tfz[tf]).forEach(function(k){n+=tfz[tf][k]});
      h+=saeule(D.tfname[tf],n+' beantwortete '+(n===1?'Frage':'Fragen'),tfz[tf]);});}
  h+='<h3 id="a-list" class="sp" data-sp="a-list">Deine Antworten</h3><div class="awlist">';
  var us=Object.keys(WAHL).sort(function(a,b){var qa=BYUT[a],qb=BYUT[b];
    if(!qa||!qb)return 0;return qa._tc<qb._tc?-1:qa._tc>qb._tc?1:0});
  us.forEach(function(u){var q=BYUT[u];if(!q)return;var p=WAHL[u];
    h+='<div class="awrow"><div class="qf2">'+esc(q.f)+
      '<div class="qs">'+esc(q._g)+' › '+esc(q._t)+'</div></div>'+
      '<div class="pw" style="color:'+PC[p]+'">'+esc(p)+'</div>'+
      '<button onclick="jump(\''+u+'\')">zur Frage</button>'+
      '<button onclick="pickPos(\''+u+'\',\''+p.replace(/'/g,"\\'")+'\')">aufheben</button></div>';});
  return h+'</div>';}
function vPartei(){
  var h='<h2>Parteien</h2>'+
   '<div class="subt">'+
   '<button class="'+(PSUB==='profil'?'on':'')+'" onclick="PSUB=\'profil\';render()">Profil und Vergleich</button>'+
   '<button class="'+(PSUB==='kennz'?'on':'')+'" onclick="PSUB=\'kennz\';render()">Kennzahlen aller Programme</button>'+
   '</div>';
  if(PSUB==='kennz')return h+vKennz();
  h+='<p class="lead">Wähle eine Partei für ihr Profil. Wähle eine zweite dazu, '+
   'um Kennzahlen, Schwerpunkte und Positionen zu vergleichen.</p>'+psortBtn()+'<div class="psel">';
  P.forEach(function(p){
    var on=(PA===p||PB===p);
    h+='<button class="pbtn'+(on?' on':'')+'" style="'+(on?'border-bottom-color:'+PC[p]:'')+
      '" onclick="pick(\''+p.replace(/'/g,"\\'")+'\')">'+esc(p)+'</button>';});
  h+='</div>';
  if(PA&&PB)return h+cmpView();
  if(PA)return h+profil(PA);
  return h+'<div class="empty">Wähle oben eine Partei.</div>';}
function vKennz(){
  var rows=P.map(function(p){var st=D.stats[p],sc=D.schwer[p];
    return {p:p,seiten:st.seiten,belegte:sc.belegte,uts:st.uts,anteil:st.uts/484*100,
            abl:st.ablehnend.length,zahlen:st.zahlen.length,allein:st.allein.length};});
  // Text aufsteigend, Zahlen absteigend — die größte Zahl gehört nach oben
  rows.sort(function(a,b){var x=a[KSORT],y=b[KSORT];
    return typeof x==='string'?(x<y?-1:x>y?1:0):(y-x)});
  function th(k,t,ti){return '<th class="'+(k==='p'?'':'num')+'">'+
    '<button class="ksort'+(KSORT===k?' on':'')+'" onclick="KSORT=\''+k+'\';render()"'+
    (ti?' title="'+esc(ti)+'"':'')+'>'+t+'</button></th>';}
  var h='<p class="lead">Alle sieben Programme nebeneinander. Ein Klick auf eine Spaltenüberschrift '+
   'sortiert danach.</p><table><thead><tr>'+
   th('p','Partei')+th('seiten','Seiten','Seiten des PDF insgesamt')+
   th('belegte','davon mit Position','Seiten, auf denen das Programm zu mindestens einer Frage Position bezieht')+
   th('uts','beantwortete Fragen','Zahl der 484 Fragen, zu denen das Programm etwas sagt')+
   th('anteil','Abdeckung')+th('abl','nur Ablehnung')+th('zahlen','Zusagen mit Zahlen')+
   th('allein','nur dieses Programm')+'</tr></thead><tbody>';
  rows.forEach(function(r){
    h+='<tr><td><b style="color:'+PC[r.p]+'">'+esc(r.p)+'</b></td>'+
      '<td class="num">'+r.seiten+'</td><td class="num">'+r.belegte+'</td>'+
      '<td class="num">'+r.uts+' von 484</td><td class="num">'+de(r.anteil)+' %</td>'+
      '<td class="num">'+r.abl+'</td><td class="num">'+r.zahlen+'</td>'+
      '<td class="num">'+r.allein+'</td></tr>';});
  h+='</tbody></table>';
  h+=chart('Seiten je Programm','Umfang des Dokuments — kein Maß für inhaltliche Breite',
    P.map(function(p){return {n:p,a:D.stats[p].seiten,c:PC[p]}}).sort(function(a,b){return b.a-a.a}),
    {einheit:'',nk:0});
  h+=chart('Abdeckung der 484 Fragen','Anteil der Fragen, zu denen das Programm überhaupt etwas sagt',
    P.map(function(p){return {n:p,a:D.stats[p].uts/484*100,c:PC[p]}}).sort(function(a,b){return b.a-a.a}));
  h+='<div class="note"><b>Wie das zu lesen ist.</b> Ein längeres Programm beantwortet in der Regel '+
   'mehr Fragen. Beides sagt nichts darüber, wie konkret oder wie tragfähig die Antworten sind — und '+
   'ein kürzeres Programm ist kein schlechteres, sondern eines mit engerer Themenwahl.</div>';
  return h;}
function pick(p){
  if(PA===p){PA=PB;PB=null}
  else if(PB===p){PB=null}
  else if(!PA){PA=p}
  else if(!PB){PB=p}
  else {PA=p;PB=null}
  render();}
function tfRows(p){
  var s=D.schwer[p];
  return Object.keys(s.anteile).map(function(tf){
    return {tf:tf,n:D.tfname[tf],a:s.anteile[tf],s:s.seiten[tf]||0}})
    .sort(function(a,b){return b.a-a.a});}
function kpi(p){var s=D.stats[p];
  return [['Seiten Programm',s.seiten],['von 484 Fragen',s.uts],['klare Ablehnungen',s.ablehnend.length],
          ['Zusagen mit Zahlen',s.zahlen.length],['Themen nur hier',s.allein.length]];}
function profil(p){
  var s2=D.stats[p],sc=D.schwer[p];
  var h='<div id="p-kpi" class="pgrid sp" data-sp="pkpi">'+kpi(p).map(function(x){
    return '<div><b>'+x[1]+'</b><span>'+x[0]+'</span></div>'}).join('')+'</div>';
  var rr=tfRows(p);
  function tfTab(titel,liste,erl){
    var o='<div><h4>'+titel+'</h4><table><tbody>';
    liste.forEach(function(r){
      o+='<tr><td><a href="#" onclick="jumpTf(\''+r.tf+'\');return false">'+esc(r.n)+'</a></td>'+
        '<td class="num">'+de(r.a)+' %</td></tr>';});
    return o+'</tbody></table><p class="lead" style="font-size:12.5px;margin:6px 0 0">'+erl+'</p></div>';}
  h+='<h3 id="p-top" class="sp" data-sp="ptop">Stärkste und schwächste Themen</h3>'+
   '<p class="lead">Nach dem Anteil an den belegten Programmseiten — dieselbe Rechnung wie im '+
   'Diagramm darunter.</p><div class="tops">'+
   tfTab('Die drei stärksten Themenfelder',rr.slice(0,3),
     'Hier steht im Programm am meisten.')+
   tfTab('Die drei schwächsten Themenfelder',rr.slice(-3).reverse(),
     'Wenig Text heißt nicht Ablehnung — nur, dass dieses Feld im Programm wenig Raum bekommt.')+
   '</div>';
  h+='<h3 id="p-schwer" class="sp" data-sp="pschwer">Schwerpunkte im Programm</h3>'+
   '<p class="lead">Wie sich die '+sc.belegte+' Seiten verteilen, auf denen dieses Programm Position '+
   'bezieht (von '+s2.seiten+' Seiten insgesamt). Jede Seite zählt einmal und wird auf die Themen '+
   'aufgeteilt, die sie berührt — die Anteile ergeben zusammen 100 %.</p>';
  h+=chart('Anteil an den belegten Programmseiten',esc(p)+' · alle 28 Themenfelder, absteigend',tfRows(p),{col:[PC[p]]});
  // Listen nach Themengruppen gliedern, damit sie nicht als eine lange Kette erscheinen
  function block(id,title,lead,list,f){
    if(!list.length)return '<h3 id="'+id+'" class="sp" data-sp="'+id.replace('-','')+
      '">'+title+'</h3><p class="lead">Keine.</p>';
    var o='<h3 id="'+id+'" class="sp" data-sp="'+id.replace('-','')+'">'+title+'</h3>'+
      '<p class="lead">'+lead+'</p><div class="tf" style="padding:0">';
    D.gruppen.forEach(function(g){
      var teil=list.filter(function(ut){var q=BYUT[ut];return q&&q._gc===g.c});
      if(!teil.length)return;
      o+='<h3 class="tfhd"><span class="tftxt">'+esc(g.n)+'</span>'+
        '<span class="cnt">'+teil.length+'</span></h3>';
      teil.forEach(function(ut){o+=qBlock(BYUT[ut])});});
    return o+'</div>';}
  h+=block('p-allein','Themen, die nur diese Partei anspricht',
    'Zu diesen Fragen sagt keine andere Partei etwas.',s2.allein,function(c){return c.p});
  h+=block('p-ablehn','Was diese Partei ausdrücklich ablehnt',
    'Hier weist das Programm etwas zurück, ohne einen eigenen Weg zu derselben Frage zu beschreiben. '+
    'Wo eine Ablehnung neben einer eigenen Forderung steht, ist sie in der Antwort selbst vermerkt.',
    s2.ablehnend,function(c){return c.p});
  h+=block('p-zahlen','Zusagen mit konkreten Zahlen',
    'Beträge, Quoten, Stückzahlen und Zieljahre, wörtlich aus dem Programm.',s2.zahlen,function(c){return c.q});
  var stumm=484-s2.uts;
  h+='<h3 id="p-stumm" class="sp" data-sp="pstumm">Fragen ohne Positionierung</h3><p class="lead">Zu '+stumm+' der 484 Fragen '+
   'enthält das Wahlprogramm keine Positionierung. Das ist <b>keine Ablehnung</b> — es heißt nur, '+
   'dass die Frage im Dokument nicht behandelt wird.</p>';
  return h;}
function cmpView(){
  // Je Kennzahl eine Karte: beide Parteien als Balken, skaliert gegen den Höchstwert
  // aller sieben Programme, mit feiner Marke für den Mittelwert der sieben.
  var felder=kpi(PA).map(function(x,i){return {name:x[0],i:i}});
  var h='<div id="p-kpi" class="kcards sp" data-sp="pkpi">';
  felder.forEach(function(f){
    var alle=P.map(function(p){return kpi(p)[f.i][1]});
    var mx=Math.max.apply(null,alle)||1;
    var mit=alle.reduce(function(a,b){return a+b},0)/alle.length;
    h+='<div class="kc"><h5>'+esc(f.name)+'</h5>';
    [[PA,PC[PA]],[PB,PC[PB]]].forEach(function(pp){
      var v=kpi(pp[0])[f.i][1];
      h+='<div class="kcr"><span class="kn">'+esc(pp[0])+'</span>'+
        '<span class="kcv">'+v+'</span>'+
        '<span class="kt"><span class="kf" style="width:'+(v/mx*100)+'%;background:'+pp[1]+'"></span>'+
        '<span class="kcm" style="left:'+(mit/mx*100)+'%" title="Mittelwert aller sieben Programme: '+
        de(mit,0)+'"></span></span></div>';});
    h+='<div class="kcleg">Balken im Verhältnis zum höchsten Wert aller sieben Programme ('+mx+
      '). Der senkrechte Strich markiert den Mittelwert der sieben ('+de(mit,0)+').</div></div>';});
  h+='</div>';
  var ra=tfRows(PA),rb={};tfRows(PB).forEach(function(r){rb[r.tf]=r.a});
  var rows=ra.map(function(r){return {n:r.n,a:r.a,b:rb[r.tf]||0}});
  if(SORT==='b')rows.sort(function(x,y){return y.b-x.b});
  else if(SORT==='d')rows.sort(function(x,y){return Math.abs(y.a-y.b)-Math.abs(x.a-x.b)});
  else if(SORT==='n')rows.sort(function(x,y){return x.n<y.n?-1:1});
  else rows.sort(function(x,y){return y.a-x.a});
  var SB2=[['a',esc(PA)],['b',esc(PB)],['d','größter Unterschied'],['n','Name']];
  var sortbar='<div class="sortb">Sortieren: '+SB2.map(function(x){
    return '<button class="'+(SORT===x[0]?'on':'')+'" onclick="SORT=\''+x[0]+'\';render()">'+x[1]+'</button>'}).join('')+'</div>';
  h+='<h3 id="p-schwer" class="sp" data-sp="pschwer">Schwerpunkte im Vergleich</h3><p class="lead">Anteil an den belegten '+
   'Programmseiten. Jede Seite zählt einmal und wird auf ihre Themen aufgeteilt.</p>';
  h+=chart('Anteil an den belegten Programmseiten','alle 28 Themenfelder',rows,
    {two:true,names:[PA,PB],col:[PC[PA],PC[PB]],sort:sortbar});
  var only=document.getElementById('cmponly')&&document.getElementById('cmponly').checked;
  var rel=ALL.filter(function(q){return (q.z[PA]||q.z[PB])&&passt(q)});
  h+='<h3>Positionen im Vergleich</h3><label class="cbx"><input type="checkbox" id="cmponly" '+
    (only?'checked':'')+' onchange="render()"> nur Fragen zeigen, bei denen sie sich unterscheiden</label>'+
    filterleiste(rel.length,ALL.length,true)+kernlegende();
  var shown=0;
  D.gruppen.forEach(function(g){
    var gh='';
    g.tf.forEach(function(t){
      var fr=sortiert(t.fragen).filter(function(q){
        var a=q.z[PA],b=q.z[PB];
        if(!a&&!b)return false;
        if(only&&a&&b&&a.s===b.s)return false;
        return passt(q);});
      if(!fr.length)return;
      gh+='<h3 class="tfhd sp" id="cv-'+t.c+'" data-sp="'+t.c+'"><span class="tftxt">'+esc(t.n)+'</span>'+
        '<span class="cnt">'+fr.length+' Fragen</span></h3>';
      fr.forEach(function(q){shown++;
        gh+='<details class="q'+klasse(q)+'" id="cf-'+q.c+'"'+ktitel(q)+'><summary>'+
          '<div class="qt"><div class="qf">'+esc(q.f)+'</div><div class="qs">'+esc(q.s)+'</div>'+
          flags(q)+'</div><div class="chips">'+chips(q,[PA,PB])+star(q.c)+'</div></summary>'+
          '<div class="qbody"><div class="cmp">'+card(PA,q.z[PA])+card(PB,q.z[PB])+'</div></div></details>';});});
    if(gh)h+='<details class="grp" open data-g="c-'+g.c+'"><summary>'+esc(g.n)+
      '<span class="cnt">'+esc(PA)+' gegen '+esc(PB)+'</span></summary><div class="tf">'+gh+'</div></details>';});
  if(!shown)h+='<div class="empty">Keine Frage passt zu dieser Auswahl.</div>';
  return h;}
function vProg(){
  var h='<h2>Die Programme</h2><p class="lead">Die sieben Originaldokumente, auf denen diese Übersicht '+
   'beruht. '+(PDFS?'Die Seitenangaben in den Antworten sind mit den PDFs verknüpft — ein Klick öffnet '+
   'die Seite direkt.':'In dieser Fassung sind die PDFs nicht beigelegt; die Seitenangaben in den '+
   'Antworten beziehen sich auf die PDF-Seite des jeweiligen Programms.')+'</p>';
  if(PDFS){
    h+='<div class="prog">';
    P.forEach(function(p){var s=D.stats[p];
      h+='<a href="programme/'+PDFS[p]+'" download><b style="color:'+PC[p]+
        '">'+esc(p)+'</b><span>'+s.seiten+' Seiten · PDF herunterladen</span></a>';});
    h+='</div>';
    h+='<div class="note"><b>Hinweis zu den Seitenlinks.</b> Sie funktionieren im Browser am Rechner. '+
     'Auf dem Telefon ignorieren die meisten PDF-Betrachter die Seitenangabe und öffnen das Dokument '+
     'am Anfang. Die PDFs müssen im Unterordner „programme" neben dieser Datei liegen.</div>';
  }else{
    h+='<table><thead><tr><th>Partei</th><th class="num">Seiten</th><th>Beschlussstand laut Dokument</th></tr></thead><tbody>';
    var BS={'AfD':'nicht angegeben','CDU':'Landesparteitag 9. Juni 2026','FDP':'Parteitag, Datum nicht angegeben',
      'Grüne':'Landesdelegiertenkonferenz 14./15. Februar 2026','Die Linke':'nicht angegeben',
      'SPD':'nicht angegeben','Volt':'nicht angegeben'};
    P.forEach(function(p){h+='<tr><td><b style="color:'+PC[p]+'">'+esc(p)+'</b></td><td class="num">'+
      D.stats[p].seiten+'</td><td>'+esc(BS[p])+'</td></tr>';});
    h+='</tbody></table>';}
  return h;}
function vMerk(){
  var uts=Object.keys(MK);
  var h='<h2>Meine Merkliste</h2>';
  if(!uts.length)return h+'<div class="empty">Noch nichts gemerkt. Klicke bei einer Frage auf den '+
    'Stern, um sie hier zu sammeln.</div>';
  h+='<p class="lead">'+uts.length+' gemerkte '+(uts.length===1?'Frage':'Fragen')+'. Die Liste bleibt '+
   'in diesem Browser gespeichert und wird nirgends übertragen.</p>'+begriffeBox();
  var byg={};
  uts.forEach(function(u){var q=BYUT[u];if(!q)return;(byg[q._g]=byg[q._g]||[]).push(q)});
  Object.keys(byg).forEach(function(g){h+='<h3>'+esc(g)+'</h3>';
    byg[g].forEach(function(q){h+=qBlock(q,true)});});
  return h;}
function vSuche(t){
  var s=t.toLowerCase();
  var hits=ALL.filter(function(q){
    if((q.f+' '+q.k+' '+q.s+' '+q._g+' '+q._t).toLowerCase().indexOf(s)>-1)return true;
    for(var p in q.z){var c=q.z[p];
      if((c.p+' '+c.z+' '+c.q+' '+c.e).toLowerCase().indexOf(s)>-1)return true;}
    return false;});
  var h='<h2>Suche</h2><p class="lead">'+hits.length+' Treffer für „'+esc(t)+
    '" — gesucht wird in den Fragen und im Text aller Antworten.</p>';
  if(!hits.length)return h+'<div class="empty">Nichts gefunden. Versuch ein anderes Wort.</div>';
  h+=begriffeBox();
  hits.slice(0,80).forEach(function(q){
    h+='<div style="font-size:12.5px;color:var(--soft);margin-top:14px">'+esc(q._g)+' › '+esc(q._t)+
      '</div>'+qBlock(q);});
  if(hits.length>80)h+='<p class="lead">Nur die ersten 80 Treffer werden gezeigt.</p>';
  return h;}
/* ---------- Rendern ---------- */
var SBVIEWS={themen:sbThemen,partei:sbPartei};
// Offene Abschnitte und Scrollposition über ein Neuzeichnen hinweg festhalten,
// damit eine Auswahl die aufgeklappte Frage nicht zuklappt.
var NEU=false;
function offeneMerken(){
  if(NEU){NEU=false;return null}
  var o={},y=window.scrollY;
  document.querySelectorAll('#shell details[open]').forEach(function(d){
    var k=d.id||(d.dataset?d.dataset.g:'');if(k)o[k]=1});
  return {o:o,y:y};}
function offeneSetzen(s){
  if(!s)return;
  document.querySelectorAll('#shell details').forEach(function(d){
    var k=d.id||(d.dataset?d.dataset.g:'');if(k&&s.o[k])d.open=true});
  window.scrollTo(0,s.y);}
function render(){
  P=parteienNachSort();
  var vor=offeneMerken();
  var q=document.getElementById('q').value.trim();
  var main,sb=null;
  if(CUR==='suche'&&q)main=vSuche(q);
  else if(CUR==='start'){main=vStart();sb=sbStart()}
  else if(CUR==='themen'){main=vThemen();sb=sbThemen()}
  else if(CUR==='durch'){main=vDurch()}
  else if(CUR==='partei'){main=vPartei();sb=sbPartei()}
  else if(CUR==='streit'){main=vStreit();sb=sbStreit()}
  else if(CUR==='ausw'){main=vAusw();sb=sbAusw()}
  else if(CUR==='merk')main=vMerk();
  else if(CUR==='prog')main=vProg();
  var el=document.getElementById('shell');
  if(sb){
    el.className='shell'+(SB?'':' zu');
    var brg='<button class="sbtog" onclick="toggleSb()" aria-expanded="'+(SB?'true':'false')+'" '+
      'title="'+(SB?'Navigation ausblenden':'Navigation einblenden')+'">'+
      '<span class="brg"><i></i><i></i><i></i></span><span class="sbtxt">Navigation</span></button>';
    el.innerHTML='<aside'+(SB?'':' class="zu"')+'>'+brg+'<div class="sbnav">'+sb+'</div></aside>'+
      '<main id="view">'+main+'</main>';
    var nv=el.querySelector('.sbnav'); if(nv)nv.scrollTop=0;
    if(FT)el.querySelector('#view').appendChild(FT);
  }else{
    el.className='shell nosb';
    el.innerHTML='<main id="view">'+main+'</main>';
    if(FT)el.querySelector('#view').appendChild(FT);}
  offeneSetzen(vor);
  lazyGruppenBinden();
  bindKlappen();
  spyRun();
  karussellSpeed();
  updMk();
  updDurch();}
/* ---------- Mitlaufende Markierung in der Seitenleiste ----------
   Gedrosselte Auswertung beim Scrollen statt eines IntersectionObservers: der Observer meldet
   nur Zustandswechsel, sodass die Markierung stehen bleibt, wenn zwischen zwei Positionen keine
   Überschrift den Beobachtungsstreifen kreuzt. Die Auswertung läuft über höchstens 28
   Überschriften und ist damit auch auf langen Seiten billig. */
var FT=document.getElementById('ft');
var SPYT=false;
function spyRun(){
  SPYT=false;
  var grenze=(parseInt(getComputedStyle(document.documentElement)
    .getPropertyValue('--navh'))||58)+16;
  var scope=document;
  var grps=document.querySelectorAll('#view details.grp[data-g]');
  if(grps.length){
    var gakt=null,gbest=null,gi,gel,gt;
    for(gi=0;gi<grps.length;gi++){
      gel=grps[gi];
      if(!gel.offsetParent)continue;
      gt=gel.getBoundingClientRect().top;
      if(gt<=grenze&&(gbest===null||gt>gbest)){gbest=gt;gakt=gel}
    }
    if(!gakt){
      for(gi=0;gi<grps.length;gi++){
        gel=grps[gi];
        if(gel.offsetParent&&gel.getBoundingClientRect().bottom>grenze){gakt=gel;break}
      }
    }
    if(gakt)scope=gakt;
  }
  var ziele=scope.querySelectorAll('.sp[data-sp]');
  if(!ziele.length)return;
  var akt=null,best=null,i,el,t;
  for(i=0;i<ziele.length;i++){
    el=ziele[i];
    if(!el.offsetParent)continue;
    t=el.getBoundingClientRect().top;
    if(t<=grenze&&(best===null||t>best)){best=t;akt=el.dataset.sp}
  }
  if(akt===null){
    for(i=0;i<ziele.length;i++){
      el=ziele[i];
      if(el.offsetParent&&el.getBoundingClientRect().bottom>grenze){akt=el.dataset.sp;break}
    }
  }
  document.querySelectorAll('aside a.hier').forEach(function(a){a.classList.remove('hier')});
  if(!akt)return;
  var a=document.querySelector('aside a.sp-'+akt);
  if(!a)return;
  a.classList.add('hier');
  var box=a.closest('aside');
  if(box){
    var r=a.getBoundingClientRect(),rb=box.getBoundingClientRect();
    if(r.top<rb.top+8||r.bottom>rb.bottom-8)a.scrollIntoView({block:'nearest'});
  }
}
window.addEventListener('scroll',function(){
  if(!SPYT){SPYT=true;window.requestAnimationFrame(spyRun)}},{passive:true});
function suchEingabe(v){
  var q=document.getElementById('q'); if(q&&q.value!==v)q.value=v;
  var q2=document.getElementById('q2'); if(q2&&q2.value!==v)q2.value=v;
  if(!v.trim()&&CUR==='suche')go('start');}
function suchAusloesen(v){
  v=(v||'').trim();
  if(!v){if(CUR==='suche')go('start');return;}
  CUR='suche';
  document.querySelectorAll('nav button[data-v]').forEach(function(b){b.className=''});
  render();}
function start(){
  document.querySelectorAll('nav button[data-v]').forEach(function(b){
    b.onclick=function(){document.getElementById('q').value='';go(b.dataset.v)}});
  document.getElementById('q').addEventListener('input',function(e){suchEingabe(e.target.value)});
  document.getElementById('q').addEventListener('keydown',function(e){
    if(e.key==='Enter')suchAusloesen(e.target.value)});
  var btnSuch=document.getElementById('btn-such');
  if(btnSuch)btnSuch.addEventListener('click',function(){
    var top=document.querySelector('.top');
    var offen=top.classList.toggle('o-such');
    btnSuch.classList.toggle('on',offen);
    btnSuch.setAttribute('aria-expanded',offen?'true':'false');
    if(offen)setTimeout(function(){var q=document.getElementById('q');if(q)q.focus()},10);});
  var btnSync=document.getElementById('btn-sync-ic');
  if(btnSync)btnSync.addEventListener('click',function(){
    var b=document.getElementById('sync-knopf');
    if(b)b.click();});
  function navh(){var el=document.querySelector('header');
    if(el)document.documentElement.style.setProperty('--navh',el.offsetHeight+'px');}
  window.addEventListener('resize',navh);
  navh();render();
  setTimeout(navh,400);
  if(window.SYNC&&SYNC.start)SYNC.start();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);
else start();
// Wird vom Abgleich aufgerufen, wenn Serverdaten eingespielt wurden.
window.neuLaden=function(){MK=load('wp26_mk',{});WAHL=load('wp26_wahl',{});render();};
