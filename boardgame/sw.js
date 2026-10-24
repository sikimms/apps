// 오프라인 저장 (버전 7744cb6927)
const CACHE='bgc-7744cb6927',FILES=["./","manifest.webmanifest","icons/icon-192.png","icons/icon-512.png","icons/maskable-512.png","index.html","baduk.html","chess.html","janggi.html","omok.html","othello.html","gonu.html","yut.html","gostop.html","seotda.html","poker.html","mahjong.html","shisen.html","ladder.html","icons/baduk.png","icons/chess.png","icons/janggi.png","icons/omok.png","icons/othello.png","icons/gonu.png","icons/yut.png","icons/gostop.png","icons/seotda.png","icons/poker.png","icons/mahjong.png","icons/shisen.png","icons/ladder.png"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES.map(f=>new Request(f,{cache:'reload'})))));});
self.addEventListener('message',e=>{if(e.data==='SKIP')self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('bgc-')&&k!==CACHE&&k!=='bgc-font').map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);if(e.request.method!=='GET')return;
  // 글꼴(구글 폰트)은 한 번 받으면 저장해 두고 씀
  if(u.hostname.endsWith('fonts.googleapis.com')||u.hostname.endsWith('fonts.gstatic.com')){
    e.respondWith(caches.open('bgc-font').then(c=>c.match(e.request).then(r=>r||fetch(e.request).then(res=>{c.put(e.request,res.clone());return res;}).catch(()=>r))));return;}
  if(u.origin!==location.origin)return;
  // 화면(html)은 인터넷이 되면 최신본을 먼저 보여주고, 안 되거나 3초 넘게 걸리면 저장해 둔 것을 씀
  if(e.request.mode==='navigate'){
    const net=fetch(e.request,{cache:'no-cache'}).then(res=>{if(res.ok){const c=res.clone();caches.open(CACHE).then(k=>k.put(e.request,c));}return res;});
    const saved=()=>caches.match(e.request,{ignoreSearch:true});
    e.respondWith(Promise.race([net.catch(()=>null),new Promise(r=>setTimeout(()=>r(null),3000))]).then(r=>r||saved().then(s=>s||net)));return;}
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request)));
});
