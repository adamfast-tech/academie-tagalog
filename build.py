#!/usr/bin/env python3
"""Assemble Akademya Tagalog.

Sorties :
  index.html     page complète pour GitHub Pages (PWA : manifeste, icônes, service worker, comptes Supabase)
  tagalog.html   version « artefact » (contenu seul, sans <!doctype>, pour l'aperçu claude.ai)
  dist/test.html version de test (expose l'état interne à window.__AK) — non publiée
"""
import json, pathlib, re, sys

ROOT = pathlib.Path(__file__).parent
SRC = ROOT / 'src'

# Projet Supabase commun avec l'Académie CMD & PowerShell (mêmes comptes).
# Clé publiable : conçue pour être publique, l'accès aux données est protégé par la RLS Postgres.
SUPABASE = {
    'url': 'https://cfcygkmrpxcjideljxxo.supabase.co',
    'key': 'sb_publishable_i68zVFGjYsUyKef3b3p4Zw_x_COmUOS',
}
SUPABASE_JS = 'vendor/supabase-2.117.0.min.js'

shell = (SRC / 'shell.html').read_text(encoding='utf-8')
data = '\n'.join(p.read_text(encoding='utf-8') for p in sorted((SRC / 'data').glob('*.js')))
app = '\n'.join(p.read_text(encoding='utf-8') for p in sorted((SRC / 'js').glob('*.js')))

for name, txt in (('data', data), ('app', app)):
    if '</script' in txt.lower():
        sys.exit(f'Erreur : « </script » trouvé dans {name}')

def scripts(extra=''):
    return ("<script>\n" + data + "\n</script>\n"
            "<script>\n(function(){\n'use strict';\n" + app + extra + "\n})();\n</script>")

def body(extra=''):
    return shell.replace('<!--DATA-->\n<!--SCRIPTS-->', scripts(extra))

# 1) Artefact (aperçu)
art = body()
(ROOT / 'tagalog.html').write_text(art, encoding='utf-8')

# 2) Page web (GitHub Pages)
head_end = shell.index('</style>') + len('</style>')
head_part, body_part = shell[:head_end], shell[head_end:]
cloud = ('\n<script>window.AKADEMYA_SUPABASE=' + json.dumps(SUPABASE) + ';</script>\n'
         '<script src="' + SUPABASE_JS + '"></script>\n')
sw = """
<script>
if('serviceWorker' in navigator && location.protocol==='https:'){
  var hadCtl=!!navigator.serviceWorker.controller,reloaded=false;
  navigator.serviceWorker.addEventListener('controllerchange',function(){if(hadCtl&&!reloaded){reloaded=true;location.reload();}});
  window.addEventListener('load',function(){navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).then(function(r){r.update();}).catch(function(){});});
}
</script>"""
web = ('<!doctype html>\n<html lang="fr">\n<head>\n<meta charset="utf-8">\n'
       '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
       '<meta name="description" content="Apprends le tagalog depuis le français, du niveau débutant au niveau expert : leçons courtes, exercices, histoires, conjugaison et baybayin.">\n'
       '<link rel="manifest" href="manifest.webmanifest">\n'
       '<link rel="icon" href="icons/icon.svg" type="image/svg+xml">\n'
       '<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">\n'
       '<meta name="apple-mobile-web-app-capable" content="yes">\n'
       '<meta name="mobile-web-app-capable" content="yes">\n'
       '<meta name="apple-mobile-web-app-title" content="Akademya">\n'
       '<meta name="apple-mobile-web-app-status-bar-style" content="default">\n'
       '<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}'
       'body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>\n'
       + head_part + '\n</head>\n<body>\n'
       + body_part.replace('<!--DATA-->\n<!--SCRIPTS-->', cloud + scripts()) + sw + '\n</body>\n</html>\n')
(ROOT / 'index.html').write_text(web, encoding='utf-8')

# 3) Version de test
expose = "\nwindow.__AK={mascot,WX,WX_STATES,loadWeather,AUDIO,audioId,TTS,setUltra,ultraFX,checkStreak,showNoHearts,dayAdd,today,Cloud,AUTH,mergeRemote,stripLocal,resetLocal,defState,get S(){return S},set S(v){S=v},get P(){return P},LESSONS,FLOW,UNITS,VERBS,STORIES,startLesson,startPractice,startStory,lessonItems,render,go,save,tlNum,numKey,toBaybayin,compareAnswer,glossOf,tilesFor,ALLS,ALLW,PROPER,tokenize,examItems};"
(ROOT / 'dist').mkdir(exist_ok=True)
(ROOT / 'dist' / 'test.html').write_text(
    '<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'
    '<style>:root{color-scheme:light}body{margin:0}[hidden]{display:none!important}</style></head><body>'
    + body(expose) + '</body></html>', encoding='utf-8')

print('OK  tagalog.html', len(art.encode()) // 1024, 'Ko ;  index.html', len(web.encode()) // 1024, 'Ko')
