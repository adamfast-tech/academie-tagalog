/* Akademya — données du cours de tagalog (depuis le français)
   Format d'une unité :
   id, sec, t (titre FR), tl (titre tagalog), d (description), ic (icône)
   guide : [['h',titre],['p',texte],['ex',[[tl,fr],…]],['tbl',[[en-têtes],[ligne]…]],['tip',texte]]
           *mot* = tagalog (cliquable, prononcé) ; **gras**
   w : mots   [tagalog (variantes séparées par |), français, image (emoji ou #texte), note]
   s : phrases [tagalog (variantes |), français (variantes |), note]
   g : à trous [phrase avec ___, réponse, [leurres], traduction, explication]
   vb : clés de verbes de la table de conjugaison à entraîner
   num : [min,max] exercices de nombres
*/
window.TL = window.TL || {};
TL.SECTIONS = [
  {id:1, code:'A1', tl:'Unang Hakbang', fr:'Premiers pas', desc:'Saluer, se présenter, compter, parler de sa famille et commander à manger.'},
  {id:2, code:'A2', tl:'Araw-araw', fr:'Le quotidien', desc:'Les premiers verbes, l’heure, l’argent, le marché, les transports, la santé et la routine.'},
  {id:3, code:'B1', tl:'Pagpapalalim', fr:'Approfondir', desc:'Le système de focus, les particules, les comparaisons, les émotions et la cuisine.'},
  {id:4, code:'B2', tl:'Kahusayan', fr:'Aisance', desc:'Abilitatif, causatif, verbes sociaux, relatives, hypothèses, travail et voyage.'},
  {id:5, code:'C1', tl:'Dalubhasa', fr:'Expert', desc:'Taglish, idiomes, proverbes, culture, registre soutenu, morphologie fine et baybayin.'}
];
TL.UNITS = [];
TL.STORIES = [];
TL.VERBS = {};
TL.U = function(o){ TL.UNITS.push(o); };
