# Akademya Tagalog

Apprendre le tagalog depuis le français, du débutant complet au niveau expert, en mode Duolingo.
Site statique (HTML/CSS/JS), installable sur iPhone, Android, iPad et ordinateur.

**Site : https://adamfast-tech.github.io/academie-tagalog/** (sur téléphone : *Partager → Sur l’écran d’accueil*).

## Contenu

| | |
|---|---|
| Sections | 5 (A1 → C1) |
| Unités | 46, chacune avec un guide de grammaire |
| Leçons | 282 (vocabulaire, phrases, conjugaison, nombres, bilans, épreuves de section) |
| Mots | 711 |
| Phrases | 554 |
| Exercices de grammaire à trous | 189 |
| Verbes conjugués | 127 (12 affixes : -um-, mag-, ma-, -in, -an, i-, maka-, magpa-, pa-…-in, ipa-, makipag-, maki-) |
| Histoires | 13, avec questions de compréhension |
| Écriture | Unité complète sur le baybayin + convertisseur |

## Fonctionnalités

- Chemin d'apprentissage par unités, déblocage progressif, test pour sauter une section.
- 12 types d'exercices : images, choix multiples, paires, tuiles (FR→TL et TL→FR), saisie libre avec tolérance aux fautes de frappe, mot manquant, écoute, phrases à trous, conjugaison, nombres, baybayin.
- Les erreurs reviennent en fin de leçon ; correction avec explication grammaticale.
- Vies (5, une toutes les 20 min), XP, série quotidienne, gels de série, perlas (monnaie), quêtes du jour, 26 badges, niveaux.
- Mode ultra (Profil → Réglages) : vies, perlas et gels de série illimités, aucune limite d'erreurs (épreuves comprises : les erreurs reviennent en fin de série). Activation avec un éclair animé et sonore ; aussi proposé sur l'écran « Plus de vies ».
- Répétition espacée (révision intelligente), « Corriger mes erreurs », mots les plus fragiles.
- Bulles de traduction : toucher un mot tagalog affiche son sens.
- Voix naturelles Gemini (fichiers MP3 pré-générés, une voix par personnage dans les histoires) ; à défaut, voix du navigateur : tagalog (fil-PH) si l'appareil en a une, sinon voix proche (indonésien, malais, espagnol). Lecture lente.
- Lexique : guides de grammaire, dictionnaire, tableaux de conjugaison, nombres en lettres (1 à 999 999), baybayin, prononciation.
- Mascotte Araw (« soleil ») animée, habillée selon la météo en direct à Nice (Open-Meteo, sans clé) : lunettes, parapluie, bonnet, écharpe, bonnet de nuit… avec une phrase tagalog sur le temps qu'il fait.
- Thème clair / sombre, réglages (objectif, sons, voix, mode ultra, vies illimitées, tout débloquer), export / import de la progression.
- Comptes en ligne (e-mail ou nom d’utilisateur + mot de passe) : progression synchronisée entre appareils, historique des dernières leçons.

## Structure

```
index.html            page générée (à publier)
manifest.webmanifest  PWA
sw.js                 service worker (hors ligne)
icons/                icônes
build.py              assemble index.html à partir de src/
src/shell.html        styles + structure de la page
src/data/*.js         contenu du cours (unités, verbes, histoires)
src/js/*.js           moteur (exercices, lecteur, vues, navigation)
audio/clips.json      liste des extraits à enregistrer (produite par tools/clips.mjs)
audio/<id>.mp3        voix Gemini générées ; audio/index.json les liste pour le site
tools/                génération des voix (clips.mjs, generer_audio.py, generer_audio.cmd)
vendor/               supabase-js 2.117.0 (licence MIT)
supabase/             schéma des tables du tagalog (schema-tagalog.sql)
```

## Modifier le contenu

Chaque unité est un objet dans `src/data/10_s1.js` … `50_s5.js` :

```js
TL.U({id:'u01', sec:1, t:'Salutations', tl:'Pagbati', d:'…',
  guide:[['h','Titre'],['p','Texte avec *tagalog* et **gras**'],['ex',[['Kumusta ka?','Comment vas-tu ?']]]],
  w:[['kumusta','comment ça va ; salut','👋']],            // mots : tagalog (variantes |), français, image
  s:[['Kumusta ka?','Comment vas-tu ?']],                   // phrases : tagalog (variantes |), français (variantes |)
  g:[['Magandang ___ po!','umaga',['gabi','hapon'],'Bonjour !','Explication']]  // trous
});
```

Puis reconstruire :

```
python3 build.py
```

## Voix naturelles (Gemini TTS, gratuit)

Le site lit `audio/<id>.mp3` quand le fichier existe, sinon la voix du navigateur. Les fichiers se génèrent une fois, sur ton PC, avec l'offre gratuite de Google AI Studio.

1. Clé API : https://aistudio.google.com/apikey (compte Google, sans carte bancaire).
2. Python, une seule fois : `winget install Python.Python.3.12`, puis fermer et rouvrir le terminal.
3. Essai (une douzaine d'extraits) : `tools\generer_audio.cmd --test`, coller la clé quand elle est demandée (rien ne s'affiche, c'est normal). Écouter `audio\_ecoute.html` et `audio\_test\lot_*.wav`.
4. Tout générer : double-clic sur `tools\generer_audio.cmd`. Environ 3 500 extraits en 230 requêtes ; si le quota gratuit du jour est atteint, le script s'arrête proprement : le relancer le lendemain, il reprend où il en était. Les plus utiles (mots, phrases, histoires) passent en premier ; les nombres de 101 à 999 en dernier.
5. Publier le dossier `audio/` avec le site (≈ 25 Mo) : l’ajouter au dépôt puis pousser (voir Publication).

Options : `--max-requetes N`, `--taille-lot N` (défaut 20 extraits courts par requête), `--pause S`, `--types word,sentence`, `--modele …`, `--lister-modeles`.
La clé est lue dans `GEMINI_API_KEY` ou saisie au clavier ; elle n'est jamais enregistrée. Ne pas la mettre dans le dépôt.
Si le contenu du cours change : `node tools/clips.mjs` puis relancer la génération (seuls les nouveaux extraits sont demandés).
Aperçu local avec les voix : `py -m http.server 8000` dans le dossier du site, puis http://localhost:8000.

## Comptes et progression (Supabase)

Le site utilise le même projet Supabase que l’Académie CMD & PowerShell : **un seul compte pour les deux sites**
(même domaine github.io, donc une connexion sur l’un vaut aussi sur l’autre).

- Comptes, profils (nom d’utilisateur), connexion par nom d’utilisateur (`resolve_login`) et suppression de compte
  (Edge Function `delete-account`) : communs, définis dans le dépôt `academie-cmd-powershell` (`supabase/schema.sql`).
- Propres au tagalog : `tagalog_progress` (un état JSON par compte, avec XP, leçons, série et mots appris calculés côté serveur)
  et `tagalog_history` (dernières leçons). Schéma : [`supabase/schema-tagalog.sql`](supabase/schema-tagalog.sql).
- RLS : chacun ne lit et n’écrit que ses propres lignes ; aucun accès sans connexion.
- Sans compte, la progression reste dans le navigateur ; elle est fusionnée dans le compte à la première connexion
  (on garde le meilleur des deux : XP, leçons, mots, badges ; vies, perlas et réglages suivent l’appareil le plus récent).
- Le thème, la voix, les sons et la météo restent propres à chaque appareil.
- Supprimer son compte efface aussi la progression de l’Académie (compte commun).

La clé Supabase présente dans `build.py` est la clé *publiable*, conçue pour être publique.

## Publication (GitHub Pages)

```
python3 build.py
git add -A && git commit -m "…"
git push origin main main:gh-pages
```

GitHub Pages sert la branche `gh-pages`.
