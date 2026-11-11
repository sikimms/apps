// 오프라인 저장 (버전 fe390fd462)
const CACHE='mon-fe390fd462',IMG='mon-img',FILES=["./","manifest.webmanifest","icons/icon-192.png","icons/icon-512.png","icons/maskable-512.png","index.html"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES.map(f=>new Request(f,{cache:'reload'})))));});
self.addEventListener('message',e=>{if(e.data==='SKIP')self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('mon-')&&k!==CACHE&&k!==IMG&&k!=='mon-font').map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);if(e.request.method!=='GET')return;
  // 글꼴(구글 폰트)은 한 번 받으면 저장해 두고 씀
  if(u.hostname.endsWith('fonts.googleapis.com')||u.hostname.endsWith('fonts.gstatic.com')){
    e.respondWith(caches.open('mon-font').then(c=>c.match(e.request).then(r=>r||fetch(e.request).then(res=>{c.put(e.request,res.clone());return res;}).catch(()=>r))));return;}
  if(u.origin!==location.origin)return;
  // 카드 그림은 한 번 본 것을 저장해 두고 씀 (그림 수가 많아서 처음에 다 받지 않음)
  if(u.pathname.includes('/images/')){
    e.respondWith(caches.open(IMG).then(c=>c.match(e.request).then(r=>r||fetch(e.request).then(res=>{if(res.ok)c.put(e.request,res.clone());return res;}))));return;}
  // 화면(html)은 인터넷이 되면 최신본을 먼저 보여주고, 안 되거나 3초 넘게 걸리면 저장해 둔 것을 씀
  if(e.request.mode==='navigate'){
    const net=fetch(e.request,{cache:'no-cache'}).then(res=>{if(res.ok){const c=res.clone();caches.open(CACHE).then(k=>k.put(e.request,c));}return res;});
    const saved=()=>caches.match(e.request,{ignoreSearch:true});
    e.respondWith(Promise.race([net.catch(()=>null),new Promise(r=>setTimeout(()=>r(null),3000))]).then(r=>r||saved().then(s=>s||net)));return;}
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request)));
});
