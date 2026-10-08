#!/usr/bin/env python3
"""Akademya Tagalog : génère les voix naturelles avec Gemini TTS (Google AI Studio, offre gratuite).

Windows :
  py -m pip install lameenc                 (une seule fois)
  py tools\\generer_audio.py --test         essai sur une douzaine d'extraits
  py tools\\generer_audio.py                tout générer ; relancer le lendemain si le quota du jour est atteint

La clé API est lue dans la variable d'environnement GEMINI_API_KEY, sinon demandée au clavier (saisie masquée).
Elle n'est jamais écrite sur le disque ni affichée.

Entrée  : audio/clips.json (produit par tools/clips.mjs)
Sorties : audio/<id>.mp3, audio/index.json (liste lue par le site), audio/_ecoute.html (page de vérification, non publiée)
Plusieurs extraits sont demandés en une requête puis découpés sur les silences, avec contrôle des durées ;
si le découpage est douteux, le lot est coupé en deux et redemandé. Les fichiers existants sont conservés (reprise).
"""
import argparse
import base64
import getpass
import html
import io
import json
import math
import os
import re
import shutil
import subprocess
import sys
import time
import unicodedata
import urllib.error
import urllib.request
import wave
from array import array
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
AUDIO = ROOT / 'audio'
API = 'https://generativelanguage.googleapis.com/v1beta'
MODELES = ['gemini-3.8-flash-tts', 'gemini-3.8-flash-lite-tts', 'gemini-3.1-flash-tts-preview', 'gemini-2.5-flash-preview-tts']
ORDRE = ['test', 'word', 'sentence', 'story', 'weather', 'number', 'verb', 'frag', 'guide', 'token', 'bay', 'number2']
GROUPE = {'word': 'court', 'token': 'court', 'number': 'court', 'number2': 'court', 'verb': 'court', 'bay': 'court', 'frag': 'court',
          'sentence': 'phrase', 'guide': 'phrase', 'weather': 'phrase', 'test': 'phrase', 'story': 'histoire'}
BASE = ('Native Tagalog (Filipino) speaker from Manila, warm and clear voice, standard pronunciation. '
        'The text has one item per line. Read every line exactly once, in order, and leave a long silence '
        '(about one and a half seconds) between lines. Do not read anything else, do not add words.')
STYLE = {
    'court': BASE + ' Each line is a single Tagalog word or short expression: say it clearly, at a natural teaching pace.',
    'phrase': BASE + ' Each line is a Tagalog sentence: say it naturally and friendly, at a moderate pace for learners.',
    'histoire': BASE + ' Each line is a line of dialogue from a short story: say it expressively and naturally, at a moderate pace.',
}


class Arret(Exception):
    """Arrêt propre (quota du jour, clé refusée, limite atteinte)."""


def dire(*a):
    print(*a, flush=True)


# ---------------------------------------------------------------- appels API

class Client:
    def __init__(self, cle, args):
        self.cle = cle
        self.base = args.url_base.rstrip('/')
        self.pause = args.pause
        self.max = args.max_requetes
        self.n = 0
        self.dernier = 0.0
        apis = [args.api] if args.api != 'auto' else ['interactions', 'generate']
        modeles = [args.modele] if args.modele else MODELES
        self.candidats = [(api, m) for m in modeles for api in apis
                          if not (api == 'interactions' and m.startswith('gemini-2.5'))]
        self.valide = False

    @property
    def actuel(self):
        return self.candidats[0] if self.candidats else None

    def _post(self, url, corps):
        req = urllib.request.Request(url, data=json.dumps(corps).encode('utf-8'), method='POST',
                                     headers={'Content-Type': 'application/json', 'x-goog-api-key': self.cle})
        try:
            with urllib.request.urlopen(req, timeout=240) as r:
                return r.status, json.loads(r.read().decode('utf-8'))
        except urllib.error.HTTPError as e:
            brut = e.read().decode('utf-8', 'replace')
            try:
                return e.code, json.loads(brut)
            except ValueError:
                return e.code, {'error': {'message': brut[:500]}}
        except (urllib.error.URLError, TimeoutError, OSError) as e:
            return 0, {'error': {'message': str(e)}}

    def lister(self):
        req = urllib.request.Request(self.base + '/models?pageSize=1000', headers={'x-goog-api-key': self.cle})
        with urllib.request.urlopen(req, timeout=60) as r:
            j = json.loads(r.read().decode('utf-8'))
        return [m.get('name', '') for m in j.get('models', [])]

    def _corps(self, api, modele, texte, style, voix):
        if api == 'interactions':
            return self.base + '/interactions', {
                'model': modele,
                'input': [{'type': 'user_input', 'content': [{'type': 'text', 'text': texte,
                                                               'annotations': [{'type': 'speech_metadata', 'style': style}]}]}],
                'response_format': {'type': 'audio'},
                'generation_config': {'speech_config': [{'voice': voix}]},
            }
        return self.base + '/models/' + modele + ':generateContent', {
            'contents': [{'role': 'user', 'parts': [{'text': "### DIRECTOR'S NOTES\n" + style + '\n\n### TRANSCRIPT\n' + texte}]}],
            'generationConfig': {'responseModalities': ['AUDIO'],
                                 'speechConfig': {'voiceConfig': {'prebuiltVoiceConfig': {'voiceName': voix}}}},
        }

    def generer(self, texte, style, voix):
        """Renvoie (échantillons, fréquence) ou None si la réponse est inexploitable pour ce texte."""
        essais = 0
        while True:
            if not self.candidats:
                raise Arret("Aucun modèle TTS n'a accepté la requête. Lance --lister-modeles et indique un modèle avec --modele.")
            if self.max and self.n >= self.max:
                raise Arret(f'Limite de {self.max} requêtes atteinte (--max-requetes).')
            attente = self.dernier + self.pause - time.time()
            if attente > 0:
                time.sleep(attente)
            api, modele = self.actuel
            url, corps = self._corps(api, modele, texte, style, voix)
            self.dernier = time.time()
            self.n += 1
            code, j = self._post(url, corps)
            err = (j.get('error') or {}) if isinstance(j, dict) else {}
            msg = str(err.get('message', ''))[:300]
            if code == 200:
                son = extraire_audio(j)
                if son:
                    if not self.valide:
                        self.valide = True
                        dire(f'  Modèle utilisé : {modele} (API {api})')
                    return son
                debug(j)
                if not self.valide:
                    dire(f'  {modele} ({api}) : réponse sans audio, essai du modèle suivant.')
                    self.candidats.pop(0)
                    continue
                return None
            if code == 429:
                if 'perday' in json.dumps(j).lower().replace('_', '') or 'per day' in msg.lower():
                    raise Arret('Quota gratuit du jour atteint. Relance la même commande demain : la génération reprendra où elle s’est arrêtée.')
                delai = delai_reessai(j) or 30 * (essais + 1)
                self.pause = min(max(self.pause * 1.5, 6), 60)
                dire(f'  Limite par minute atteinte : attente {delai:.0f} s (pause portée à {self.pause:.0f} s).')
                time.sleep(delai)
                essais += 1
                if essais > 8:
                    raise Arret('Trop de refus 429 à la suite. Réessaie plus tard.')
                continue
            if code in (401, 403) or 'api key' in msg.lower() or 'api_key' in msg.lower():
                raise Arret(f'Clé API refusée ({code}) : {msg}')
            if code in (400, 404) and not self.valide:
                dire(f'  {modele} ({api}) indisponible ({code}) : {msg[:160]}')
                self.candidats.pop(0)
                continue
            if code == 400:
                debug(j)
                return None
            essais += 1
            if essais > 5:
                raise Arret(f'Erreur répétée ({code}) : {msg}')
            dire(f'  Erreur {code or "réseau"} : {msg[:160]} ; nouvel essai dans {10 * essais} s.')
            time.sleep(10 * essais)


def delai_reessai(j):
    for d in ((j.get('error') or {}).get('details') or []):
        v = d.get('retryDelay') if isinstance(d, dict) else None
        if isinstance(v, str):
            m = re.match(r'([\d.]+)s', v)
            if m:
                return float(m.group(1)) + 1
    return None


def debug(j):
    """Garde la dernière réponse inexploitable (données audio tronquées) pour diagnostic."""
    def coupe(o):
        if isinstance(o, dict):
            return {k: (v[:80] + '…' if k == 'data' and isinstance(v, str) else coupe(v)) for k, v in o.items()}
        if isinstance(o, list):
            return [coupe(x) for x in o]
        return o
    try:
        (AUDIO / '_derniere_reponse.json').write_text(json.dumps(coupe(j), ensure_ascii=False, indent=1), encoding='utf-8')
    except OSError:
        pass


def extraire_audio(j):
    """Cherche les données audio base64 dans la réponse (API Interactions ou generateContent)."""
    morceaux = []

    def visite(o):
        if isinstance(o, dict):
            inl = o.get('inlineData') or o.get('inline_data')
            if isinstance(inl, dict) and isinstance(inl.get('data'), str):
                morceaux.append((inl['data'], inl.get('mimeType') or inl.get('mime_type') or ''))
                return
            if o.get('type') == 'audio' and isinstance(o.get('data'), str):
                morceaux.append((o['data'], o.get('mime_type') or o.get('mimeType') or ''))
                return
            for v in o.values():
                visite(v)
        elif isinstance(o, list):
            for v in o:
                visite(v)
    visite(j)
    if not morceaux:
        return None
    total, taux = array('h'), None
    for data, mime in morceaux:
        ech, r = decoder(base64.b64decode(data), mime)
        if taux and r != taux:
            continue
        taux = r
        total.extend(ech)
    return (total, taux) if len(total) else None


def decoder(brut, mime):
    if brut[:4] == b'RIFF':
        with wave.open(io.BytesIO(brut)) as w:
            canaux, larg, taux = w.getnchannels(), w.getsampwidth(), w.getframerate()
            trames = w.readframes(w.getnframes())
        if larg != 2:
            raise ValueError(f'WAV {8 * larg} bits non pris en charge')
    else:
        m = re.search(r'rate=(\d+)', mime or '')
        canaux, taux, trames = 1, int(m.group(1)) if m else 24000, brut
    ech = array('h')
    ech.frombytes(trames[:len(trames) // 2 * 2])
    if sys.byteorder == 'big':
        ech.byteswap()
    if canaux == 2:
        ech = array('h', ((ech[i] + ech[i + 1]) // 2 for i in range(0, len(ech) - 1, 2)))
    return ech, taux


# ---------------------------------------------------------------- découpage sur les silences

def lettres(t):
    t = unicodedata.normalize('NFD', t.lower())
    return max(1, len(re.sub(r'[^a-zñ]', '', t)))


def enveloppe(x, taux):
    f = taux // 100  # trames de 10 ms
    env = []
    for i in range(0, len(x), f):
        s = x[i:i + f]
        env.append(max(max(s), -min(s)) if len(s) else 0)
    return env


def regions(env, seuil, crete):
    regs, debut = [], None
    for i, v in enumerate(env + [0]):
        if v > seuil and debut is None:
            debut = i
        elif v <= seuil and debut is not None:
            if regs and debut - regs[-1][1] < 8:          # micro-coupure < 80 ms : même région
                regs[-1] = (regs[-1][0], i)
            else:
                regs.append((debut, i))
            debut = None
    # souffles et clics : courts et faibles
    return [r for r in regs if (r[1] - r[0]) >= 12 or max(env[r[0]:r[1]]) > crete * 0.25]


def duree_ok(d, txt):
    n = lettres(txt)
    return 0.08 + 0.03 * n <= d <= 1.2 + 0.18 * n


def decouper(env, textes):
    """Renvoie une liste de (début, fin) en trames de 10 ms, une par texte, ou None si douteux."""
    n = len(textes)
    crete = max(env) if env else 0
    if crete < 400:
        return None
    for ratio in (0.035, 0.06, 0.02, 0.1):
        regs = regions(env, crete * ratio, crete)
        if len(regs) < n:
            continue
        if n == 1:
            segs = [(regs[0][0], regs[-1][1])]
        else:
            ecarts = sorted(((regs[i + 1][0] - regs[i][1], i) for i in range(len(regs) - 1)), reverse=True)
            choisis, reste = ecarts[:n - 1], ecarts[n - 1:]
            mini = min(e for e, _ in choisis)
            if mini < 25 or (reste and mini < reste[0][0] * 1.35):
                continue
            segs, debut = [], regs[0][0]
            for i in sorted(i for _, i in choisis):
                segs.append((debut, regs[i][1]))
                debut = regs[i + 1][0]
            segs.append((debut, regs[-1][1]))
        if not all(duree_ok((b - a) / 100, t) for (a, b), t in zip(segs, textes)):
            continue
        if n >= 3:
            r = [((b - a) / 100) / (0.25 + 0.07 * lettres(t)) for (a, b), t in zip(segs, textes)]
            if max(r) / min(r) > 4.5:
                continue
        return segs
    return None


def extraits(x, taux, segs):
    f = taux // 100
    sorties = []
    for k, (a, b) in enumerate(segs):
        avant = (a - segs[k - 1][1]) // 2 if k else 10 ** 6
        apres = (segs[k + 1][0] - b) // 2 if k + 1 < len(segs) else 10 ** 6
        d = max(0, (a - min(6, avant)) * f)
        e = min(len(x), (b + min(15, apres)) * f)
        s = array('h', x[d:e])
        fondu = min(len(s) // 4, taux // 100)
        for i in range(fondu):
            s[i] = int(s[i] * i / fondu)
            s[-1 - i] = int(s[-1 - i] * i / fondu)
        sorties.append(array('h', [0]) * (taux // 25) + s + array('h', [0]) * (taux // 20))
    return sorties


# ---------------------------------------------------------------- MP3 et fichiers

def encodeur():
    try:
        import lameenc  # noqa: F401
        return 'lameenc'
    except ImportError:
        return 'ffmpeg' if shutil.which('ffmpeg') else None


def mp3(ech, taux, kbps, moteur):
    pcm = ech.tobytes() if sys.byteorder == 'little' else _swap(ech)
    if moteur == 'lameenc':
        import lameenc
        enc = lameenc.Encoder()
        enc.set_bit_rate(kbps)
        enc.set_in_sample_rate(taux)
        enc.set_channels(1)
        enc.set_quality(2)
        return enc.encode(pcm) + enc.flush()
    r = subprocess.run(['ffmpeg', '-loglevel', 'error', '-f', 's16le', '-ar', str(taux), '-ac', '1', '-i', '-',
                        '-codec:a', 'libmp3lame', '-b:a', f'{kbps}k', '-f', 'mp3', '-'], input=pcm, capture_output=True)
    if r.returncode:
        raise RuntimeError(r.stderr.decode('utf-8', 'replace')[:300])
    return r.stdout


def _swap(ech):
    c = array('h', ech)
    c.byteswap()
    return c.tobytes()


def ecrire(chemin, octets):
    tmp = chemin.with_suffix('.tmp')
    tmp.write_bytes(octets)
    os.replace(tmp, chemin)


def wav(chemin, ech, taux):
    with wave.open(str(chemin), 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(taux)
        w.writeframes(ech.tobytes() if sys.byteorder == 'little' else _swap(ech))


def ecrire_index():
    ids = sorted(p.stem for p in AUDIO.glob('*.mp3') if re.fullmatch(r'[0-9a-f]{16}', p.stem))
    ecrire(AUDIO / 'index.json', json.dumps(ids, separators=(',', ':')).encode('utf-8'))
    return ids


def ecrire_ecoute(clips):
    lignes = []
    for c in clips:
        if (AUDIO / (c['id'] + '.mp3')).exists():
            lignes.append(f'<tr><td>{html.escape(c["kind"])}</td><td>{html.escape(c["voice"])}</td><td>{html.escape(c["text"])}</td>'
                          f'<td><audio controls preload="none" src="{c["id"]}.mp3"></audio></td></tr>')
    page = ('<!doctype html><meta charset="utf-8"><title>Écoute des voix</title>'
            '<style>body{font:15px system-ui;margin:16px}td{padding:4px 8px;border-bottom:1px solid #ddd}audio{height:32px}</style>'
            f'<h1>Voix générées : {len(lignes)}</h1><table>' + ''.join(lignes) + '</table>')
    (AUDIO / '_ecoute.html').write_text(page, encoding='utf-8')


# ---------------------------------------------------------------- traitement

def a_dire(t):
    """Texte envoyé au modèle (l'identifiant du fichier reste calculé sur le texte d'origine)."""
    t = re.sub(r'\s*/\s*', ', ', t.replace('___', '…')).strip(' -–')
    return t if re.search(r'[.!?…]$', t) else t + '.'


class Generateur:
    def __init__(self, client, args, moteur):
        self.c, self.args, self.moteur = client, args, moteur
        self.faits = self.echecs = 0
        self.echecs_ids = []
        self.lot_test = 0

    def traiter(self, lot, groupe):
        textes = [x['text'] for x in lot]
        son = self.c.generer('\n'.join(a_dire(t) for t in textes) if len(lot) > 1 else a_dire(textes[0]),
                             STYLE[groupe], lot[0]['voice'])
        segs = None
        if son:
            x, taux = son
            if self.args.test:
                self.lot_test += 1
                (AUDIO / '_test').mkdir(exist_ok=True)
                wav(AUDIO / '_test' / f'lot_{self.lot_test}.wav', x, taux)
            segs = decouper(enveloppe(x, taux), textes)
        if segs:
            for clip, ech in zip(lot, extraits(x, taux, segs)):
                ecrire(AUDIO / (clip['id'] + '.mp3'), mp3(ech, taux, self.args.kbps, self.moteur))
                self.faits += 1
            ecrire_index()
            return
        if len(lot) > 1:
            h = len(lot) // 2
            dire(f'  Découpage incertain sur {len(lot)} extraits : nouvel essai en deux lots.')
            self.traiter(lot[:h], groupe)
            self.traiter(lot[h:], groupe)
            return
        self.echecs += 1
        self.echecs_ids.append(lot[0]['id'])
        dire(f'  Échec : « {lot[0]["text"]} » (sera retenté au prochain lancement)')


def main():
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except (AttributeError, ValueError):
        pass
    ap = argparse.ArgumentParser(description='Génère les voix naturelles (Gemini TTS) du site Akademya Tagalog.')
    ap.add_argument('--test', action='store_true', help='essai sur une douzaine d’extraits, avec les enregistrements bruts dans audio/_test')
    ap.add_argument('--max-requetes', type=int, default=0, help='arrêter après N requêtes (0 = sans limite)')
    ap.add_argument('--taille-lot', type=int, default=20, help='extraits courts par requête (phrases : moitié, histoires : tiers). Défaut 20')
    ap.add_argument('--pause', type=float, default=8, help='secondes minimum entre deux requêtes (défaut 8)')
    ap.add_argument('--modele', help='forcer un modèle, ex. gemini-3.1-flash-tts-preview')
    ap.add_argument('--api', choices=['auto', 'interactions', 'generate'], default='auto', help='API à utiliser (défaut : auto)')
    ap.add_argument('--kbps', type=int, default=48, help='débit MP3 (défaut 48)')
    ap.add_argument('--types', help='limiter à certains types, ex. word,sentence,story')
    ap.add_argument('--lister-modeles', action='store_true', help='afficher les modèles TTS accessibles avec la clé')
    ap.add_argument('--url-base', default=API, help=argparse.SUPPRESS)
    args = ap.parse_args()

    moteur = encodeur()
    if not moteur and not args.lister_modeles:
        sys.exit('Encodeur MP3 manquant. Installe-le avec :  py -m pip install lameenc')
    src = AUDIO / 'clips.json'
    if not src.exists():
        sys.exit('audio/clips.json introuvable. Lance d’abord :  node tools/clips.mjs')
    clips = json.loads(src.read_text(encoding='utf-8'))

    cle = os.environ.get('GEMINI_API_KEY', '').strip()
    if not cle:
        dire('Clé API Gemini (aistudio.google.com/apikey). Colle-la puis Entrée ; rien ne s’affiche, c’est normal.')
        cle = getpass.getpass('Clé : ').strip()
    if not cle:
        sys.exit('Aucune clé fournie.')
    client = Client(cle, args)

    if args.lister_modeles:
        noms = client.lister()
        dire('\n'.join(n for n in noms if 'tts' in n.lower()) or 'Aucun modèle TTS visible avec cette clé.')
        return

    rang = {k: i for i, k in enumerate(ORDRE)}
    clips.sort(key=lambda c: rang.get(c['kind'], 99))
    if args.types:
        garder = set(args.types.split(','))
        clips = [c for c in clips if c['kind'] in garder]
    if args.test:
        choix = [c for c in clips if c['kind'] == 'test']
        for kind, n in (('word', 6), ('sentence', 3)):
            choix += [c for c in clips if c['kind'] == kind][:n]
        vues = set()
        for c in clips:
            if c['kind'] == 'story' and c['voice'] not in vues and len(vues) < 2:
                vues.add(c['voice'])
                choix.append(c)
        clips = choix

    a_faire = clips if args.test else [c for c in clips if not (AUDIO / (c['id'] + '.mp3')).exists()]
    tailles = {'court': max(1, args.taille_lot), 'phrase': max(1, math.ceil(args.taille_lot / 2)),
               'histoire': max(1, math.ceil(args.taille_lot / 3))}
    lots, courant = [], {}
    for c in a_faire:
        g = GROUPE.get(c['kind'], 'phrase')
        cle_lot = (g, c['voice'])
        courant.setdefault(cle_lot, []).append(c)
        if len(courant[cle_lot]) >= tailles[g]:
            lots.append((g, courant.pop(cle_lot)))
    lots += [(k[0], v) for k, v in courant.items()]

    dire(f'{len(clips) - len(a_faire)} extraits déjà présents, {len(a_faire)} à générer en {len(lots)} requêtes environ.')
    dire(f'Encodage MP3 : {moteur}. Ctrl+C pour interrompre ; relancer reprend où ça s’est arrêté.')
    gen = Generateur(client, args, moteur)
    t0 = time.time()
    try:
        for k, (groupe, lot) in enumerate(lots, 1):
            dire(f'[{k}/{len(lots)}] {len(lot)} × {lot[0]["kind"]} · voix {lot[0]["voice"]} · « {lot[0]["text"][:40]} »…')
            gen.traiter(lot, groupe)
    except Arret as e:
        dire('\n' + str(e))
    except KeyboardInterrupt:
        dire('\nInterrompu. Relance la même commande pour reprendre.')
    finally:
        ids = ecrire_index()
        ecrire_ecoute(json.loads(src.read_text(encoding='utf-8')))
        dire(f'\n{gen.faits} extraits créés ({gen.echecs} échecs) en {client.n} requêtes, {time.time() - t0:.0f} s.')
        dire(f'audio/index.json : {len(ids)} extraits disponibles pour le site.')
        dire('Pour écouter et vérifier : ouvre audio\\_ecoute.html dans le navigateur.')
        if args.test:
            dire('Enregistrements bruts (pauses entre extraits) : audio\\_test\\lot_*.wav')


if __name__ == '__main__':
    main()
