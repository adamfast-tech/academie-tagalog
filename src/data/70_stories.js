/* Histoires (Kuwento) — lignes : [locuteur, tagalog, français] ; locuteur '' = narration
   questions : {q, o:[options], a:index} */
/* Voix Gemini par personnage (voix par défaut : Kore) */
TL.VOICES = {def:'Kore', narr:'Kore', cast:{
  'Julien':'Puck', 'Marco':'Orus', 'Liza':'Leda', 'Aling Nena':'Sulafat', 'Le chauffeur':'Charon', 'Aling Rosa':'Aoede',
  'Paolo':'Achird', 'Le médecin':'Charon', 'Ana':'Aoede', 'Ben':'Fenrir', 'Lola Celia':'Sulafat', 'M. Reyes':'Charon',
  'Tita Mila':'Despina', 'Juan':'Achird', 'Une vieille femme':'Sulafat', 'Mang Tonyo':'Charon', 'Un voisin':'Fenrir'}};
(function(){
const S = TL.STORIES;

S.push({id:'k01', lvl:'A1', after:'u02', t:'Bagong Kaibigan', fr:'Un nouvel ami',
cast:{J:'Julien', M:'Marco'},
lines:[
 ['M','Kumusta! Ako si Marco. Ano ang pangalan mo?','Salut ! Je suis Marco. Comment t’appelles-tu ?'],
 ['J','Ako si Julien.','Je suis Julien.'],
 ['M','Taga-saan ka, Julien?','D’où viens-tu, Julien ?'],
 ['J','Taga-Pransiya ako. Taga-Lyon.','Je viens de France. De Lyon.'],
 {q:'D’où vient Julien ?', o:['De Lyon','De Manille','De Cebu'], a:0},
 ['M','Wow! Nagsasalita ka ng Tagalog!','Waouh ! Tu parles tagalog !'],
 ['J','Kaunti lang. Nag-aaral ako.','Un peu seulement. J’apprends.'],
 ['M','Ang galing mo! Taga-Maynila ako.','Tu es doué ! Moi, je suis de Manille.'],
 {q:'Que fait Julien ?', o:['Il apprend le tagalog','Il enseigne le tagalog','Il habite à Manille'], a:0},
 ['J','Ikinagagalak kitang makilala, Marco.','Enchanté de te connaître, Marco.'],
 ['M','Ako rin!','Moi aussi !'],
 {q:'Comment dit-on « moi aussi » ?', o:['Ako rin','Ako si','Ako ba'], a:0, tl:true}
]});

S.push({id:'k02', lvl:'A1', after:'u04', t:'Ang Pamilya ni Liza', fr:'La famille de Liza',
cast:{L:'Liza', J:'Julien'},
lines:[
 ['J','Liza, sino ito sa litrato?','Liza, qui est-ce sur la photo ?'],
 ['L','Si Nanay at si Tatay.','Ma mère et mon père.'],
 ['J','Ang ganda ng nanay mo!','Ta mère est très belle !'],
 ['L','Salamat! Guro si Nanay. Doktor naman si Tatay.','Merci ! Maman est enseignante. Et papa est médecin.'],
 {q:'Que fait le père de Liza ?', o:['Il est médecin','Il est enseignant','Il est policier'], a:0},
 ['J','May kapatid ka ba?','As-tu des frères et sœurs ?'],
 ['L','Oo, dalawa. Si Kuya Ben at si Ate Joy. Bunso ako.','Oui, deux. Mon grand frère Ben et ma grande sœur Joy. Je suis la benjamine.'],
 {q:'Combien de frères et sœurs Liza a-t-elle ?', o:['Deux','Trois','Aucun'], a:0},
 ['J','At ito?','Et elle ?'],
 ['L','Si Lola. Taga-Batangas siya. Mabait na mabait siya.','C’est ma grand-mère. Elle est de Batangas. Elle est très gentille.'],
 {q:'Que signifie « bunso » ?', o:['le benjamin','l’aîné','le cousin'], a:0}
]});

S.push({id:'k03', lvl:'A1', after:'u06', t:'Sa Palengke', fr:'Au marché',
cast:{L:'Liza', N:'Aling Nena'},
lines:[
 ['N','Magandang umaga, Liza!','Bonjour, Liza !'],
 ['L','Magandang umaga po, Aling Nena. Kumusta po kayo?','Bonjour, madame Nena. Comment allez-vous ?'],
 ['N','Mabuti naman. Ano ang gusto mo?','Bien. Qu’est-ce que tu veux ?'],
 ['L','Gusto ko po ng mangga.','Je voudrais des mangues.'],
 {q:'Que veut Liza ?', o:['Des mangues','Du poisson','Du riz'], a:0},
 ['N','Masarap ang mangga ngayon. Matamis!','Les mangues sont délicieuses aujourd’hui. Sucrées !'],
 ['L','Magkano po ang isa?','Combien coûte une mangue ?'],
 ['N','Bente pesos ang isa.','Vingt pesos la pièce.'],
 {q:'Combien coûte une mangue ?', o:['20 pesos','10 pesos','50 pesos'], a:0},
 ['L','Tatlo po.','Trois, s’il vous plaît.'],
 ['N','Heto. Animnapung piso lahat.','Voilà. Soixante pesos en tout.'],
 ['L','Salamat po!','Merci !'],
 ['N','Walang anuman. Ingat ka!','De rien. Prends soin de toi !'],
 {q:'Comment Aling Nena dit-elle « de rien » ?', o:['Walang anuman','Salamat','Ingat ka'], a:0, tl:true}
]});

S.push({id:'k04', lvl:'A2', after:'u17', t:'Sa Dyip', fr:'Dans le jeepney',
cast:{J:'Julien', T:'Le chauffeur', R:'Aling Rosa'},
lines:[
 ['J','Kuya, papuntang Quiapo po ba ito?','Monsieur, ce jeepney va bien à Quiapo ?'],
 ['T','Oo, sakay na!','Oui, monte !'],
 ['J','Magkano po ang pamasahe?','Combien coûte le trajet ?'],
 ['T','Trese pesos.','Treize pesos.'],
 {q:'Où va Julien ?', o:['À Quiapo','À Cebu','À l’aéroport'], a:0},
 ['J','Bayad po. Isa lang, Quiapo.','Voici le paiement. Une personne, pour Quiapo.'],
 ['R','Heto, Kuya, bayad daw.','Tenez, monsieur, son paiement.'],
 ['T','Salamat.','Merci.'],
 ['','Makalipas ang dalawampung minuto…','Vingt minutes plus tard…'],
 ['J','Ate, malapit na po ba ang Quiapo?','Madame, Quiapo, c’est bientôt ?'],
 ['R','Oo, sa susunod na kanto.','Oui, au prochain coin.'],
 {q:'Comment Julien appelle-t-il la passagère ?', o:['Ate','Lola','Kuya'], a:0, tl:true},
 ['J','Para po!','Arrêtez, s’il vous plaît !'],
 ['T','Ingat!','Fais attention à toi !'],
 {q:'Que dit-on pour descendre ?', o:['Para po!','Bayad po!','Sakay na!'], a:0, tl:true}
]});

S.push({id:'k05', lvl:'A2', after:'u19', t:'Umuulan!', fr:'Il pleut !',
cast:{L:'Liza', M:'Marco'},
lines:[
 ['M','Liza, pupunta tayo sa dagat bukas, hindi ba?','Liza, on va à la mer demain, n’est-ce pas ?'],
 ['L','Oo, pero tingnan mo ang langit. Maulap.','Oui, mais regarde le ciel. C’est nuageux.'],
 ['M','Ay, umuulan na!','Oh, il pleut déjà !'],
 ['L','May bagyo raw bukas.','Il paraît qu’un typhon arrive demain.'],
 {q:'Quel temps annonce-t-on pour demain ?', o:['Un typhon','Du soleil','Un vent léger'], a:0},
 ['M','Sayang! Gusto ko pa namang lumangoy.','Dommage ! Moi qui voulais nager.'],
 ['L','Sa bahay na lang tayo. Magluluto ako ng sopas.','Restons plutôt à la maison. Je ferai une soupe.'],
 ['M','Sige! Mainit na sopas, malamig na panahon. Perpekto!','D’accord ! Soupe chaude, temps frais. Parfait !'],
 {q:'Que propose Liza ?', o:['Faire une soupe à la maison','Aller nager quand même','Prendre le train'], a:0},
 ['L','Magdala ka ng payong pag-uwi mo.','Prends un parapluie pour rentrer.'],
 {q:'D’après le contexte, que signifie « sayang » ?', o:['Dommage','Tant mieux','Bonne chance'], a:0}
]});

S.push({id:'k06', lvl:'A2', after:'u20', t:'Ang Araw ni Paolo', fr:'La journée de Paolo',
cast:{P:'Paolo'},
lines:[
 ['','Alas-sais gumigising si Paolo.','Paolo se réveille à six heures.'],
 ['','Naliligo muna siya, saka nagbibihis.','Il se douche d’abord, puis s’habille.'],
 ['','Sinangag at itlog ang almusal niya.','Son petit-déjeuner, c’est du riz sauté et des œufs.'],
 {q:'Que mange Paolo au petit-déjeuner ?', o:['Du riz sauté et des œufs','Du pain et du café','Rien du tout'], a:0},
 ['','Alas-siyete, sumasakay siya ng dyip papunta sa opisina.','À sept heures, il prend le jeepney pour aller au bureau.'],
 ['P','Ang traffic na naman!','Encore des bouchons !'],
 ['','Nagtatrabaho siya hanggang alas-singko.','Il travaille jusqu’à cinq heures.'],
 {q:'Jusqu’à quelle heure travaille-t-il ?', o:['17 h','19 h','12 h'], a:0},
 ['','Pag-uwi niya, nagluluto siya ng hapunan para sa nanay niya.','En rentrant, il prépare le dîner pour sa mère.'],
 ['P','Nay, kain na po tayo!','Maman, à table !'],
 ['','Alas-diyes, pagod na si Paolo. Natutulog na siya.','À dix heures, Paolo est fatigué. Il dort.'],
 {q:'Pour qui Paolo cuisine-t-il ?', o:['Pour sa mère','Pour son patron','Pour ses amis'], a:0}
]});

S.push({id:'k07', lvl:'B1', after:'u18', t:'Sa Doktor', fr:'Chez le médecin',
cast:{D:'Le médecin', M:'Marco'},
lines:[
 ['D','Magandang hapon. Ano ang nararamdaman mo?','Bon après-midi. Qu’est-ce que tu ressens ?'],
 ['M','Masakit po ang ulo ko at may lagnat ako.','J’ai mal à la tête et j’ai de la fièvre.'],
 ['D','Kailan pa?','Depuis quand ?'],
 ['M','Kahapon pa po. Inuubo rin ako.','Depuis hier. Je tousse aussi.'],
 {q:'Depuis quand Marco est-il malade ?', o:['Depuis hier','Depuis une semaine','Depuis ce matin'], a:0},
 ['D','Titingnan ko ang lalamunan mo. Sabihin mo, « Ah ».','Je vais regarder ta gorge. Dis « Ah ».'],
 ['M','Ahhh…','Ahhh…'],
 ['D','Medyo namamaga. Trangkaso lang ito.','C’est un peu enflé. Ce n’est qu’une grippe.'],
 {q:'Qu’a Marco ?', o:['Une grippe','Une fracture','Rien du tout'], a:0},
 ['D','Uminom ka ng gamot tatlong beses isang araw at magpahinga ka.','Prends le médicament trois fois par jour et repose-toi.'],
 ['M','Puwede po ba akong pumasok sa trabaho?','Puis-je aller travailler ?'],
 ['D','Huwag muna. Magpahinga ka nang tatlong araw.','Pas tout de suite. Repose-toi trois jours.'],
 {q:'Combien de fois par jour doit-il prendre le médicament ?', o:['Trois','Une','Deux'], a:0},
 ['M','Salamat po, Dok.','Merci, docteur.']
]});

S.push({id:'k08', lvl:'B1', after:'u31', t:'Ang Nawawalang Susi', fr:'La clé perdue',
cast:{A:'Ana', B:'Ben'},
lines:[
 ['A','Ben, nakita mo ba ang susi ko?','Ben, as-tu vu ma clé ?'],
 ['B','Hindi. Saan mo ba inilagay?','Non. Où l’as-tu mise ?'],
 ['A','Hindi ko maalala. Nawala yata.','Je ne m’en souviens pas. Je crois qu’elle est perdue.'],
 {q:'Quel est le problème d’Ana ?', o:['Elle a perdu sa clé','Elle a perdu son téléphone','Elle est en retard'], a:0},
 ['B','Hinanap mo na ba sa bag mo?','Tu as cherché dans ton sac ?'],
 ['A','Oo, pero wala roon.','Oui, mais elle n’y est pas.'],
 ['B','Baka naiwan mo sa kotse.','Tu l’as peut-être oubliée dans la voiture.'],
 ['A','Hindi. Hindi ako sumakay ng kotse kanina.','Non. Je n’ai pas pris la voiture tout à l’heure.'],
 {q:'Où Ben pense-t-il que la clé se trouve ?', o:['Dans la voiture','Dans la cuisine','Au bureau'], a:0},
 ['B','Teka… ano ’yang nakasabit sa leeg mo?','Attends… qu’est-ce qui pend à ton cou ?'],
 ['A','Ay! Ang susi pala! Nakakahiya!','Oh ! C’était la clé ! Que c’est gênant !'],
 ['B','Hahaha! Nasa iyo lang pala!','Ha ha ha ! Elle était sur toi depuis le début !'],
 {q:'Que marque « pala » dans « Ang susi pala! » ?', o:['La surprise d’une découverte','Une certitude','La politesse'], a:0}
]});

S.push({id:'k09', lvl:'B1', after:'u30', t:'Pista sa Probinsiya', fr:'La fête au village',
cast:{A:'Ana', C:'Lola Celia', J:'Julien'},
lines:[
 ['A','Lola, mano po. Ito po si Julien, kaibigan ko.','Grand-mère, votre bénédiction. Voici Julien, mon ami.'],
 ['C','Kaawaan ka ng Diyos, iha. Tuloy kayo!','Que Dieu te garde, ma fille. Entrez !'],
 ['J','Mano po, Lola.','Votre bénédiction, grand-mère.'],
 ['C','Aba, marunong kang magmano! Taga-saan ka, iho?','Oh, tu sais faire la mano ! D’où viens-tu, mon garçon ?'],
 ['J','Taga-Pransiya po ako.','Je viens de France.'],
 {q:'Comment Julien salue-t-il Lola Celia ?', o:['Par la mano','Par une bise','Par une poignée de main'], a:0},
 ['C','Pista namin ngayon. Kain kayo! May lechon, pansit, at kare-kare.','C’est notre fête aujourd’hui. Mangez ! Il y a du lechon, du pancit et du kare-kare.'],
 ['J','Ang dami! Busog na busog na ako, Lola.','Tant de choses ! Je suis déjà repu, grand-mère.'],
 ['C','Kumain ka pa! Ang payat mo.','Mange encore ! Tu es si maigre.'],
 {q:'Que fait Lola Celia ?', o:['Elle insiste pour qu’il mange','Elle refuse de le servir','Elle prépare du poisson'], a:0},
 ['A','Ganyan talaga si Lola. Ayaw niyang may nagugutom sa bahay niya.','Grand-mère est comme ça. Elle ne veut personne qui ait faim chez elle.'],
 ['J','Salamat po sa lahat. Ang saya ng pista!','Merci pour tout. Quelle belle fête !'],
 {q:'Que veut dire « Tuloy kayo » ?', o:['Entrez','Asseyez-vous','Au revoir'], a:0}
]});

S.push({id:'k10', lvl:'B2', after:'u38', t:'Ang Job Interview', fr:'L’entretien d’embauche',
cast:{S:'M. Reyes', L:'Liza'},
lines:[
 ['S','Magandang umaga, Miss Santos. Maupo ka.','Bonjour, mademoiselle Santos. Asseyez-vous.'],
 ['L','Magandang umaga po, Sir. Salamat po.','Bonjour, Monsieur. Merci.'],
 ['S','Ikuwento mo naman ang sarili mo.','Parlez-moi un peu de vous.'],
 ['L','Nagtapos po ako ng Hotel Management. Tatlong taon na po akong nagtatrabaho bilang receptionist.','Je suis diplômée en gestion hôtelière. Je travaille comme réceptionniste depuis trois ans.'],
 {q:'Depuis combien de temps Liza est-elle réceptionniste ?', o:['Trois ans','Un an','Dix ans'], a:0},
 ['S','Bakit mo gustong lumipat sa kumpanya namin?','Pourquoi voulez-vous rejoindre notre entreprise ?'],
 ['L','Gusto ko pong matuto pa at makatulong sa paglago ng kumpanya.','Je veux continuer à apprendre et contribuer à la croissance de l’entreprise.'],
 ['S','Marunong ka bang magsalita ng ibang wika?','Parlez-vous d’autres langues ?'],
 ['L','Opo. Ingles, at medyo marunong din po ako ng Pranses.','Oui. L’anglais, et je me débrouille aussi un peu en français.'],
 {q:'Quelles langues Liza parle-t-elle ?', o:['Anglais et un peu de français','Seulement anglais','Espagnol'], a:0},
 ['S','Magaling. Tatawagan ka namin sa susunod na linggo.','Très bien. Nous vous appellerons la semaine prochaine.'],
 ['L','Maraming salamat po sa pagkakataon, Sir.','Merci beaucoup pour cette opportunité, Monsieur.'],
 {q:'Quand l’entreprise rappellera-t-elle ?', o:['La semaine prochaine','Demain','Jamais'], a:0}
]});

S.push({id:'k11', lvl:'B2', after:'u39', t:'Balikbayan Box', fr:'Le carton du retour',
cast:{A:'Ana', T:'Tita Mila'},
lines:[
 ['A','Tita Mila! Welcome home po! Mano po.','Tante Mila ! Bon retour ! Votre bénédiction.'],
 ['T','Kaawaan ka ng Diyos, Ana. Ang laki mo na!','Que Dieu te garde, Ana. Comme tu as grandi !'],
 ['A','Kumusta po ang biyahe?','Comment s’est passé le voyage ?'],
 ['T','Nakakapagod! Labinlimang oras sa eroplano. Pero masaya akong nandito na ako.','Épuisant ! Quinze heures d’avion. Mais je suis heureuse d’être enfin ici.'],
 {q:'Combien d’heures a duré le vol ?', o:['Quinze','Cinq','Cinquante'], a:0},
 ['A','Ano po ang laman ng malaking kahon?','Qu’y a-t-il dans la grande boîte ?'],
 ['T','Balikbayan box! May tsokolate, sabon, damit, at sapatos para sa inyong lahat.','Une balikbayan box ! Il y a du chocolat, du savon, des vêtements et des chaussures pour vous tous.'],
 {q:'Que contient la boîte ?', o:['Des cadeaux pour la famille','Des papiers officiels','Des outils'], a:0},
 ['A','Naku, Tita, nag-abala pa kayo!','Oh, ma tante, il ne fallait pas !'],
 ['T','Wala ’yon. Sampung taon akong nawala. Kayo ang dahilan kung bakit ako nagtrabaho roon.','Ce n’est rien. J’ai été absente dix ans. C’est pour vous que j’ai travaillé là-bas.'],
 {q:'Pourquoi Tita Mila a-t-elle travaillé à l’étranger ?', o:['Pour sa famille','Pour voyager','Pour étudier'], a:0},
 ['A','Salamat po, Tita. Hindi namin makakalimutan ang sakripisyo ninyo.','Merci, ma tante. Nous n’oublierons jamais votre sacrifice.'],
 {q:'Que signifie « Nag-abala pa kayo » ?', o:['Il ne fallait pas','Vous êtes en retard','Vous êtes fatiguée'], a:0}
]});

S.push({id:'k12', lvl:'C1', after:'u42', t:'Si Juan Tamad', fr:'Juan le Paresseux',
cast:{J:'Juan', B:'Une vieille femme'},
lines:[
 ['','Noong unang panahon, may isang binatang tinatawag na Juan Tamad.','Il était une fois un jeune homme qu’on appelait Juan le Paresseux.'],
 ['','Ayaw niyang magtrabaho. Gusto lang niyang matulog at kumain.','Il ne voulait pas travailler. Il voulait seulement dormir et manger.'],
 {q:'Pourquoi l’appelle-t-on « Tamad » ?', o:['Il est paresseux','Il est riche','Il est malade'], a:0},
 ['','Isang araw, nakakita siya ng puno ng bayabas na hitik sa bunga.','Un jour, il vit un goyavier chargé de fruits.'],
 ['','Sa halip na umakyat, humiga siya sa ilalim ng puno at ibinuka ang kaniyang bibig.','Au lieu de grimper, il s’allongea sous l’arbre et ouvrit la bouche.'],
 ['J','Hihintayin ko na lang na mahulog ang bayabas sa bibig ko.','Je vais juste attendre que la goyave tombe dans ma bouche.'],
 {q:'Que fait Juan pour avoir une goyave ?', o:['Il attend qu’elle tombe','Il grimpe à l’arbre','Il l’achète au marché'], a:0},
 ['','Naghintay siya buong araw. Walang nahulog.','Il attendit toute la journée. Rien ne tomba.'],
 ['','Dumaan ang isang matandang babae.','Une vieille femme passa par là.'],
 ['B','Iho, bakit hindi ka umakyat?','Mon garçon, pourquoi ne grimpes-tu pas ?'],
 ['J','Nakakapagod po umakyat, Lola.','Grimper, c’est fatigant, grand-mère.'],
 ['B','Tandaan mo: kapag may tiyaga, may nilaga. Pero kailangan mo ring kumilos!','Souviens-toi : avec de la persévérance, on a de quoi manger. Mais il faut aussi agir !'],
 {q:'Quelle est la morale ?', o:['Il faut agir, pas seulement attendre','Il faut dormir davantage','Les goyaves sont mauvaises'], a:0}
]});

S.push({id:'k13', lvl:'C1', after:'u43', t:'Bayanihan', fr:'L’entraide',
cast:{M:'Mang Tonyo', K:'Un voisin'},
lines:[
 ['','Sa isang maliit na baryo sa Laguna, lilipat ng tirahan si Mang Tonyo.','Dans un petit village de Laguna, Mang Tonyo va déménager.'],
 ['','Pero hindi lang ang mga gamit niya ang ililipat, kundi pati ang buong bahay-kubo niya!','Mais il ne déménagera pas seulement ses affaires : toute sa maison en bambou aussi !'],
 {q:'Que va faire Mang Tonyo ?', o:['Déplacer sa maison entière','Vendre sa maison','Construire une école'], a:0},
 ['M','Mga kapitbahay, kailangan ko ang tulong ninyo.','Voisins, j’ai besoin de votre aide.'],
 ['K','Walang problema, Mang Tonyo! Magbayanihan tayo!','Pas de problème, Mang Tonyo ! Entraidons-nous !'],
 ['','Dalawampung lalaki ang nagbuhat ng bahay gamit ang mahahabang kawayan.','Vingt hommes ont soulevé la maison à l’aide de longs bambous.'],
 {q:'Combien d’hommes ont porté la maison ?', o:['Vingt','Deux','Cent'], a:0},
 ['','Isa, dalawa, tatlo, buhat! Dahan-dahan silang naglakad papunta sa bagong lote.','Un, deux, trois, on soulève ! Ils marchèrent doucement jusqu’au nouveau terrain.'],
 ['','Samantala, nagluto ng pansit at kakanin ang mga kababaihan para sa lahat.','Pendant ce temps, les femmes ont cuisiné du pancit et des gâteaux de riz pour tout le monde.'],
 ['M','Malaki ang utang na loob ko sa inyong lahat.','Je vous dois énormément, à tous.'],
 ['K','Wala ’yon. Ngayon ikaw, bukas kami naman.','Ce n’est rien. Aujourd’hui c’est toi, demain ce sera nous.'],
 {q:'Que signifie « utang na loob » ?', o:['Une dette de gratitude','Un prêt bancaire','Une maison neuve'], a:0},
 {q:'Quelle valeur illustre cette histoire ?', o:['L’entraide communautaire','La compétition','La solitude'], a:0}
]});
})();
