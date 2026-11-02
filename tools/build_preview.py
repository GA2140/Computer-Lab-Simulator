import re,json,base64,os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));os.chdir(ROOT)
rd=lambda p:open(p).read()
logo='data:image/svg+xml;base64,'+base64.b64encode(rd('assets/brand/logo.svg').encode()).decode()
def patch(js):
    js=js.replace('location.search','parent.QS')
    js=re.sub(r'location\.replace\(([^)]*)\)',r'parent.go(\1)',js)
    return re.sub(r'location\.href = ([^;}]+)',r'parent.go(\1)',js)
seed="<script>(function(){var S=LabFix.Storage;if(!S.available){return;}if(!S.getProfile()){S.register('Demo','demo123');}var k='labfix.progress.v1.demo';if(!localStorage.getItem(k)){var p={unlockedLevel:1,levels:{}};LabFix.Data.LEVELS.forEach(function(l){p.levels[l.id]={stars:l.id<2?3:0,bestScore:l.id<2?l.star3+40:0,completed:l.id<2};});localStorage.setItem(k,JSON.stringify(p));}})();</script>"
shim="<script>document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href]');if(a&&!/^https?:/.test(a.getAttribute('href'))){e.preventDefault();parent.go(a.getAttribute('href'));}});</script>"
pages={}
for n in ['index','game','scores','how-to-play','login','register']:
    s=rd(n+'.html')
    s=re.sub(r'<link rel="stylesheet" href="css/([\w-]+)\.css">',lambda m:'<style>'+rd('css/'+m.group(1)+'.css')+'</style>',s)
    s=re.sub(r'<link rel="icon"[^>]*>','',s).replace('assets/brand/logo.svg',logo)
    s=re.sub(r'<script src="js/([\w/-]+)\.js"></script>',lambda m:'<script>'+patch(rd('js/'+m.group(1)+'.js'))+'</script>'+(seed if m.group(1).endswith('storage') else ''),s)
    pages[n+'.html']=s.replace('<body>','<body>'+shim,1)
data=json.dumps(pages).replace('</','<\\/')
html='''<!DOCTYPE html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>LabFix — Preview</title>
<style>:root{--b:#fff;--i:#12262E;--bd:#C3D4D9;--p:#0B7285}@media(prefers-color-scheme:dark){:root{--b:#13262D;--i:#E7F2F4;--bd:#294751;--p:#3BC9DB}}
html,body{height:100%;margin:0}body{display:flex;flex-direction:column;background:var(--b);color:var(--i);font:14px system-ui,sans-serif;padding-top:env(safe-area-inset-top,0px)}
nav{display:flex;gap:6px;align-items:center;padding:8px 10px;border-bottom:1px solid var(--bd);overflow-x:auto}nav b{margin-right:8px;white-space:nowrap}
nav button{flex:none;min-height:36px;padding:0 14px;border:1px solid var(--bd);border-radius:99px;background:none;color:inherit;font:inherit;font-weight:600;cursor:pointer}nav button.on{background:var(--p);border-color:var(--p);color:var(--b)}
iframe{flex:1;width:100%;border:0}</style></head><body>
<nav><b>LabFix preview</b><button data-u="index.html">Menu</button><button data-u="game.html?level=1">Main L1</button><button data-u="scores.html">Papan skor</button><button data-u="how-to-play.html">Panduan</button><button data-u="login.html">Masuk</button><button data-u="register.html">Daftar</button></nav>
<iframe id="f" title="Preview LabFix"></iframe>
<script>var PAGES=__DATA__;window.QS='';
window.go=function(u){var a=String(u).split('?'),n=a[0];if(!PAGES[n]){n='index.html';}window.QS=a[1]?'?'+a[1]:'';
document.getElementById('f').srcdoc=PAGES[n];var key=n+window.QS;document.querySelectorAll('nav button').forEach(function(b){b.classList.toggle('on',b.dataset.u===key);});};
document.querySelectorAll('nav button').forEach(function(b){b.addEventListener('click',function(){go(b.dataset.u);});});
go('index.html');</script></body></html>'''.replace('__DATA__',data)
os.makedirs('dist',exist_ok=True);open('dist/preview.html','w').write(html)
