/* Table de conjugaison : clé « racine/affixe »
   f = [infinitif, accompli, inaccompli, contemplé] — variantes acceptées séparées par | */
(function(){
const V = TL.VERBS;
function add(aff, rows){ rows.forEach(r => { V[r[0]+'/'+aff] = {r:r[0], a:aff, fr:r[1], f:r.slice(2)}; }); }

add('um',[
 ['kain','manger','kumain','kumain','kumakain','kakain'],
 ['inom','boire','uminom','uminom','umiinom','iinom'],
 ['bili','acheter','bumili','bumili','bumibili','bibili'],
 ['punta','aller','pumunta','pumunta','pumupunta','pupunta'],
 ['alis','partir','umalis','umalis','umaalis','aalis'],
 ['dating','arriver','dumating','dumating','dumarating','darating'],
 ['takbo','courir','tumakbo','tumakbo','tumatakbo','tatakbo'],
 ['langoy','nager','lumangoy','lumangoy','lumalangoy','lalangoy'],
 ['uwi','rentrer à la maison','umuwi','umuwi','umuuwi','uuwi'],
 ['sakay','monter (véhicule)','sumakay','sumakay','sumasakay','sasakay'],
 ['baba','descendre','bumaba','bumaba','bumababa','bababa'],
 ['pasok','entrer','pumasok','pumasok','pumapasok','papasok'],
 ['labas','sortir','lumabas','lumabas','lumalabas','lalabas'],
 ['kanta','chanter','kumanta','kumanta','kumakanta','kakanta'],
 ['sayaw','danser','sumayaw','sumayaw','sumasayaw','sasayaw'],
 ['upo','s’asseoir','umupo','umupo','umuupo','uupo'],
 ['gising','se réveiller','gumising','gumising','gumigising','gigising'],
 ['akyat','monter ; grimper','umakyat','umakyat','umaakyat','aakyat'],
 ['tawa','rire','tumawa','tumawa','tumatawa','tatawa'],
 ['iyak','pleurer','umiyak','umiyak','umiiyak','iiyak'],
 ['tulong','aider','tumulong','tumulong','tumutulong','tutulong'],
 ['sulat','écrire','sumulat','sumulat','sumusulat','susulat'],
 ['hingi','demander (qqch)','humingi','humingi','humihingi','hihingi'],
 ['tawag','appeler','tumawag','tumawag','tumatawag','tatawag'],
 ['sagot','répondre','sumagot','sumagot','sumasagot','sasagot'],
 ['balik','revenir','bumalik','bumalik','bumabalik','babalik'],
 ['hiram','emprunter','humiram','humiram','humihiram','hihiram'],
 ['ulan','pleuvoir','umulan','umulan','umuulan','uulan'],
 ['galing','guérir','gumaling','gumaling','gumagaling','gagaling']
]);
add('mag',[
 ['luto','cuisiner','magluto','nagluto','nagluluto','magluluto'],
 ['laro','jouer','maglaro','naglaro','naglalaro','maglalaro'],
 ['linis','nettoyer','maglinis','naglinis','naglilinis','maglilinis'],
 ['trabaho','travailler','magtrabaho','nagtrabaho','nagtatrabaho','magtatrabaho'],
 ['aral','étudier','mag-aral','nag-aral','nag-aaral','mag-aaral'],
 ['basa','lire','magbasa','nagbasa','nagbabasa','magbabasa'],
 ['lakad','marcher','maglakad','naglakad','naglalakad','maglalakad'],
 ['salita','parler','magsalita','nagsalita','nagsasalita','magsasalita'],
 ['hintay','attendre','maghintay','naghintay','naghihintay','maghihintay'],
 ['bayad','payer','magbayad','nagbayad','nagbabayad','magbabayad'],
 ['turo','enseigner','magturo','nagturo','nagtuturo','magtuturo'],
 ['benta','vendre','magbenta','nagbenta','nagbebenta','magbebenta'],
 ['usap','discuter','mag-usap','nag-usap','nag-uusap','mag-uusap'],
 ['dala','apporter','magdala','nagdala','nagdadala','magdadala'],
 ['bihis','s’habiller','magbihis','nagbihis','nagbibihis','magbibihis'],
 ['sipilyo','se brosser les dents','magsipilyo','nagsipilyo','nagsisipilyo','magsisipilyo'],
 ['laba','faire la lessive','maglaba','naglaba','naglalaba','maglalaba'],
 ['hugas','laver','maghugas','naghugas','naghuhugas','maghuhugas'],
 ['isip','penser','mag-isip','nag-isip','nag-iisip','mag-iisip'],
 ['simula','commencer','magsimula','nagsimula','nagsisimula','magsisimula'],
 ['handa','préparer','maghanda','naghanda','naghahanda','maghahanda'],
 ['dasal','prier','magdasal','nagdasal','nagdarasal','magdarasal'],
 ['suot','porter (un vêtement)','magsuot','nagsuot','nagsusuot','magsusuot'],
 ['simba','aller à la messe','magsimba','nagsimba','nagsisimba','magsisimba'],
 ['maneho','conduire','magmaneho','nagmaneho','nagmamaneho','magmamaneho'],
 ['pahinga','se reposer','magpahinga','nagpahinga','nagpapahinga','magpapahinga'],
 ['bakasyon','partir en vacances','magbakasyon','nagbakasyon','nagbabakasyon','magbabakasyon']
]);
add('ma',[
 ['ligo','se doucher','maligo','naligo','naliligo','maliligo'],
 ['tulog','dormir','matulog','natulog','natutulog','matutulog'],
 ['takot','avoir peur','matakot','natakot','natatakot','matatakot'],
 ['galit','se fâcher','magalit','nagalit','nagagalit','magagalit'],
 ['hulog','tomber','mahulog','nahulog','nahuhulog','mahuhulog'],
 ['wala','se perdre ; disparaître','mawala','nawala','nawawala','mawawala'],
 ['sira','se casser','masira','nasira','nasisira','masisira'],
 ['sanay','s’habituer','masanay','nasanay','nasasanay','masasanay'],
 ['gutom','avoir faim','magutom','nagutom','nagugutom','magugutom'],
 ['pagod','se fatiguer','mapagod','napagod','napapagod','mapapagod'],
 ['kita','voir','makita','nakita','nakikita','makikita'],
 ['rinig','entendre','marinig','narinig','naririnig','maririnig'],
 ['intindi','comprendre','maintindihan','naintindihan','naiintindihan','maiintindihan'],
 ['limot','oublier','makalimutan','nakalimutan','nakakalimutan','makakalimutan']
]);
add('in',[
 ['kain','manger (qqch)','kainin','kinain','kinakain','kakainin'],
 ['inom','boire (qqch)','inumin','ininom','iniinom','iinumin'],
 ['basa','lire (qqch)','basahin','binasa','binabasa','babasahin'],
 ['luto','cuisiner (qqch)','lutuin','niluto|linuto','niluluto|linuluto','lulutuin'],
 ['bili','acheter (qqch)','bilhin','binili','binibili','bibilhin'],
 ['gawa','faire (qqch)','gawin','ginawa','ginagawa','gagawin'],
 ['hanap','chercher','hanapin','hinanap','hinahanap','hahanapin'],
 ['tapos','finir','tapusin','tinapos','tinatapos','tatapusin'],
 ['linis','nettoyer (qqch)','linisin','nilinis','nililinis','lilinisin'],
 ['dala','emporter (qqch)','dalhin','dinala','dinadala','dadalhin'],
 ['kuha','prendre','kunin','kinuha','kinukuha','kukunin'],
 ['sabi','dire','sabihin','sinabi','sinasabi','sasabihin'],
 ['tawag','appeler (qqn)','tawagin','tinawag','tinatawag','tatawagin'],
 ['intindi','comprendre (qqch)','intindihin','inintindi','iniintindi','iintindihin'],
 ['mahal','aimer (qqn)','mahalin','minahal','minamahal','mamahalin'],
 ['tanong','interroger','tanungin','tinanong','tinatanong','tatanungin'],
 ['yakap','serrer dans ses bras','yakapin','niyakap','niyayakap','yayakapin']
]);
add('an',[
 ['bukas','ouvrir','buksan','binuksan','binubuksan','bubuksan'],
 ['tulong','aider (qqn)','tulungan','tinulungan','tinutulungan','tutulungan'],
 ['hugas','laver (qqch)','hugasan','hinugasan','hinuhugasan','huhugasan'],
 ['bayad','payer (qqch)','bayaran','binayaran','binabayaran','babayaran'],
 ['tawag','téléphoner à','tawagan','tinawagan','tinatawagan','tatawagan'],
 ['punta','aller à ; visiter','puntahan','pinuntahan','pinupuntahan','pupuntahan'],
 ['sulat','écrire à','sulatan','sinulatan','sinusulatan','susulatan'],
 ['turo','enseigner à','turuan','tinuruan','tinuturuan','tuturuan'],
 ['bigay','donner à','bigyan','binigyan','binibigyan','bibigyan'],
 ['tingin','regarder','tingnan','tiningnan','tinitingnan','titingnan'],
 ['halik','embrasser','halikan','hinalikan','hinahalikan','hahalikan']
]);
add('i',[
 ['bigay','donner (qqch)','ibigay','ibinigay|binigay','ibinibigay|binibigay','ibibigay'],
 ['lagay','mettre','ilagay','inilagay|nilagay','inilalagay|nilalagay','ilalagay'],
 ['tapon','jeter','itapon','itinapon|tinapon','itinatapon|tinatapon','itatapon'],
 ['sulat','écrire (qqch)','isulat','isinulat|sinulat','isinusulat|sinusulat','isusulat'],
 ['sara','fermer','isara','isinara|sinara','isinasara|sinasara','isasara'],
 ['balik','rendre','ibalik','ibinalik|binalik','ibinabalik|binabalik','ibabalik'],
 ['kuwento','raconter','ikuwento','ikinuwento|kinuwento','ikinukuwento|kinukuwento','ikukuwento'],
 ['turo','montrer ; enseigner (qqch)','ituro','itinuro|tinuro','itinuturo|tinuturo','ituturo'],
 ['bili','acheter pour qqn','ibili','ibinili','ibinibili','ibibili'],
 ['handa','préparer (qqch)','ihanda','inihanda|hinanda','inihahanda|hinahanda','ihahanda'],
 ['abot','tendre ; passer','iabot','iniabot|inabot','iniaabot','iaabot']
]);
add('maka',[
 ['kain','pouvoir manger','makakain','nakakain','nakakakain','makakakain'],
 ['punta','pouvoir aller','makapunta','nakapunta','nakakapunta|nakapupunta','makakapunta|makapupunta'],
 ['tulog','arriver à dormir','makatulog','nakatulog','nakakatulog','makakatulog'],
 ['rating','pouvoir arriver','makarating','nakarating','nakakarating|nakararating','makakarating|makararating']
]);
add('magpa',[
 ['gupit','se faire couper les cheveux','magpagupit','nagpagupit','nagpapagupit','magpapagupit'],
 ['ayos','faire réparer','magpaayos','nagpaayos','nagpapaayos','magpapaayos'],
 ['tulong','demander de l’aide','magpatulong','nagpatulong','nagpapatulong','magpapatulong']
]);
add('pa',[
 ['kain','faire manger ; nourrir','pakainin','pinakain','pinakakain|pinapakain','papakainin|pakakainin'],
 ['inom','faire boire','painumin','pinainom','pinaiinom|pinapainom','papainumin|paiinumin'],
 ['tulog','endormir','patulugin','pinatulog','pinatutulog|pinapatulog','papatulugin|patutulugin']
]);
add('ipa',[
 ['ayos','faire réparer (qqch)','ipaayos','ipinaayos|pinaayos','ipinapaayos|ipinaaayos','ipapaayos|ipaaayos'],
 ['linis','faire nettoyer (qqch)','ipalinis','ipinalinis|pinalinis','ipinapalinis|ipinalilinis','ipapalinis|ipalilinis']
]);
add('makipag',[
 ['usap','s’entretenir avec','makipag-usap','nakipag-usap','nakikipag-usap','makikipag-usap'],
 ['kita','retrouver qqn','makipagkita','nakipagkita','nakikipagkita','makikipagkita'],
 ['laro','jouer avec','makipaglaro','nakipaglaro','nakikipaglaro','makikipaglaro']
]);
add('maki',[
 ['raan','demander le passage','makiraan','nakiraan','nakikiraan','makikiraan'],
 ['sabay','faire route avec','makisabay','nakisabay','nakikisabay','makikisabay'],
 ['kain','se joindre au repas','makikain','nakikain','nakikikain','makikikain']
]);

TL.AFFIX = {
 um:{n:'-um-', f:'acteur', d:'L’acteur est le focus. Infixe -um- après la 1re consonne.'},
 mag:{n:'mag-', f:'acteur', d:'L’acteur est le focus. mag- → nag- à l’accompli.'},
 ma:{n:'ma-', f:'état / perception', d:'États, événements involontaires, perceptions.'},
 'in':{n:'-in', f:'objet', d:'L’objet précis est le focus.'},
 an:{n:'-an', f:'lieu / destinataire', d:'Le lieu, la personne visée ou la surface touchée.'},
 i:{n:'i-', f:'objet transmis', d:'La chose déplacée, donnée, ou le bénéficiaire.'},
 maka:{n:'maka-', f:'capacité', d:'Pouvoir, réussir à, avoir déjà fait.'},
 magpa:{n:'magpa-', f:'causatif (acteur)', d:'Faire faire par quelqu’un d’autre.'},
 pa:{n:'pa-…-in', f:'causatif (exécutant)', d:'Faire faire à quelqu’un.'},
 ipa:{n:'ipa-', f:'causatif (objet)', d:'La chose qu’on fait faire.'},
 makipag:{n:'makipag-', f:'social', d:'Faire avec quelqu’un.'},
 maki:{n:'maki-', f:'participation', d:'Se joindre, demander poliment.'}
};
TL.ASPECTS = ['Infinitif','Accompli','Inaccompli','Contemplé'];
TL.ASPECT_HINT = ['ordre, après gusto/kailangan…','passé, action terminée','présent, en cours ou habituel','futur, pas encore commencé'];
})();
