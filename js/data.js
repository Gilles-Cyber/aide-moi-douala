/* Aide-moi Douala — contenus de démonstration (fictifs) */
window.AMD = window.AMD || {};

AMD.WHATSAPP = '237600000000'; // numéro de démonstration, à remplacer par le vrai numéro

AMD.QUARTIERS = ['Akwa', 'Bonanjo', 'Bonapriso', 'Bali', 'Deido', 'Bonabéri', 'Bonamoussadi', 'Makepe', 'Kotto', 'Logpom', 'Ndokotti', 'Logbaba', 'PK 14', 'Village', 'Yassa', 'Autre'];

AMD.CATS = {
  pc: { label: 'PC lent / bloqué', icon: 'laptop', color: '#4f46e5' },
  virus: { label: 'Virus & sécurité', icon: 'shield', color: '#4f46e5' },
  phone: { label: 'Téléphone', icon: 'smartphone', color: '#4f46e5' },
  cv: { label: 'CV & lettres', icon: 'fileText', color: '#4f46e5' },
  office: { label: 'Word / Excel', icon: 'sheet', color: '#4f46e5' },
  internet: { label: 'Internet & Wi-Fi', icon: 'wifi', color: '#4f46e5' }
};

AMD.PUBLICS = { etudiant: 'Étudiants', commercant: 'Commerçants', tous: 'Tout le monde' };

AMD.OFFRES = [
  { id: 'cv', titre: 'CV professionnel', prix: 3000, unite: '', cat: 'cv', public: 'etudiant', delai: 'Livré en 24 h', icon: 'fileText', img: 'img/b-cv.jpg',
    points: ['CV moderne sur 1 page', 'Lettre de motivation offerte', 'Fichiers Word + PDF', '1 correction gratuite'] },
  { id: 'depannage', titre: 'Dépannage à distance', prix: 5000, unite: '', cat: 'pc', public: 'tous', delai: 'Sous 1 h', icon: 'wrench', img: 'img/rep-laptop.jpg', populaire: true,
    points: ['Prise en main à distance sécurisée', 'Virus, lenteur, logiciels, imprimante', 'Explications pendant l\'intervention', 'Satisfait ou remboursé'] },
  { id: 'reparation', titre: 'Réparation guidée WhatsApp', prix: 5000, prixMax: 15000, unite: '', cat: 'phone', public: 'tous', delai: 'Le jour même', icon: 'smartphone', img: 'img/rep-phone.jpg',
    points: ['Diagnostic gratuit par photo / vidéo', 'Téléphone ou PC', 'Devis avant de payer', 'Suivi jusqu\'à la solution'] },
  { id: 'formation', titre: 'Formation complète en vidéo', prix: 10000, unite: '', cat: 'office', public: 'etudiant', delai: 'Accès immédiat', icon: 'graduation', img: 'img/b-excel.jpg',
    points: ['Word, Excel, PowerPoint pour le stage', '25 vidéos courtes en français', 'Exercices corrigés', 'Attestation de fin de formation'] },
  { id: 'boutique', titre: 'Pack boutique connectée', prix: 15000, unite: '', cat: 'office', public: 'commercant', delai: 'En 48 h', icon: 'store', img: 'img/commercante.jpg',
    points: ['Tableau Excel de stock et ventes', 'Fiche Google de ta boutique', 'Catalogue WhatsApp Business', '1 h de formation'] },
  { id: 'vip', titre: 'Abonnement VIP', prix: 5000, unite: '/ mois', cat: 'pc', public: 'tous', delai: 'Sans engagement', icon: 'crown',
    points: ['Questions illimitées', 'Réponse prioritaire en moins d\'1 h', '-20 % sur tous les dépannages', 'Accès à toutes les formations'] }
];

AMD.ARTICLES = [
  { id: 'virus-5-minutes', img: 'img/b-virus.jpg', cat: 'virus', public: 'tous', titre: 'Comment enlever un virus en 5 minutes', min: 5, vues: 4210,
    intro: 'Pubs qui s\'ouvrent toutes seules, PC qui rame, fichiers bizarres sur ta clé USB ? Voici la méthode qui règle 8 cas sur 10.',
    etapes: [
      ['Coupe Internet', 'Débranche le Wi-Fi ou le câble : le virus ne pourra plus envoyer tes données ni se mettre à jour.'],
      ['Lance l\'analyse complète', 'Ouvre « Sécurité Windows » → Protection contre les virus → Options d\'analyse → « Analyse complète ». Laisse tourner jusqu\'au bout.'],
      ['Fais l\'analyse hors ligne', 'Si le virus revient, choisis « Analyse Microsoft Defender hors ligne » : le PC redémarre et nettoie avant que Windows se lance.'],
      ['Nettoie les programmes suspects', 'Paramètres → Applications : désinstalle tout ce que tu n\'as pas installé toi-même (barres d\'outils, « optimiseurs »…).'],
      ['Change tes mots de passe', 'Depuis un autre appareil, change les mots de passe de ta messagerie et de tes comptes importants.']
    ] },
  { id: 'pc-lent', img: 'img/b-pc.jpg', cat: 'pc', public: 'tous', titre: 'Ton PC est lent ? Fais ces 3 choses', min: 4, vues: 6890,
    intro: 'Dans la plupart des cas, la lenteur vient de 3 causes simples. Pas besoin d\'acheter un nouveau PC.',
    etapes: [
      ['Désactive les programmes au démarrage', 'Ctrl + Maj + Échap → onglet « Démarrage » → clic droit → « Désactiver » sur tout ce qui n\'est pas indispensable.'],
      ['Libère de l\'espace disque', 'Il faut au moins 15 % d\'espace libre. Paramètres → Système → Stockage → « Fichiers temporaires » → Supprimer.'],
      ['Vide le dossier temporaire', 'Touches Windows + R, tape %temp% puis Entrée. Sélectionne tout (Ctrl + A) et supprime. Ignore les fichiers en cours d\'utilisation.'],
      ['Bonus : redémarre vraiment', 'Beaucoup de PC ne sont jamais redémarrés. Fais « Redémarrer » (pas « Arrêter ») au moins une fois par semaine.']
    ] },
  { id: 'telephone-ne-s-allume-plus', img: 'img/b-phone.jpg', cat: 'phone', public: 'tous', titre: 'Téléphone qui ne s\'allume plus : que faire ?', min: 4, vues: 5120,
    intro: 'Avant de courir chez le réparateur, essaie ces étapes dans l\'ordre. Elles sauvent souvent le téléphone gratuitement.',
    etapes: [
      ['Charge 30 minutes', 'Une batterie complètement vide peut mettre 15 à 30 minutes avant d\'afficher quelque chose. Utilise une prise murale, pas un PC.'],
      ['Change de câble et de chargeur', 'Les câbles abîmés sont la première cause de « téléphone mort ». Essaie avec un autre câble qui marche.'],
      ['Redémarrage forcé', 'Android : maintiens Marche + Volume bas 15 secondes. iPhone récent : Volume haut, Volume bas, puis maintiens le bouton latéral.'],
      ['Attention à la batterie gonflée', 'Si l\'arrière du téléphone se décolle ou bombe : n\'insiste pas, ne le charge plus et fais remplacer la batterie. C\'est dangereux.']
    ] },
  { id: 'cv-word-20-minutes', img: 'img/b-cv.jpg', cat: 'cv', public: 'etudiant', titre: 'Faire un CV pro sur Word en 20 minutes', min: 6, vues: 3980,
    intro: 'Les recruteurs regardent un CV environ 7 secondes. Voici comment faire un CV clair qui donne envie de t\'appeler.',
    etapes: [
      ['Une seule page', 'Pour un premier emploi ou un stage, 1 page suffit. Supprime ce qui n\'aide pas à obtenir le poste.'],
      ['L\'en-tête qui compte', 'Nom, titre visé (ex. « Assistant comptable »), téléphone, e-mail sérieux, quartier. Photo optionnelle mais professionnelle.'],
      ['Expériences avec des chiffres', '« Gestion de la caisse : 150 clients par jour » est plus fort que « Caissier ». Commence chaque ligne par un verbe.'],
      ['Exporte en PDF', 'Fichier → Enregistrer sous → PDF. Nomme-le « CV_Prenom_Nom.pdf ». Jamais « cv final 2 (3).docx ».']
    ] },
  { id: 'excel-5-formules', img: 'img/b-excel.jpg', cat: 'office', public: 'etudiant', titre: 'Excel pour ton stage : les 5 formules à connaître', min: 7, vues: 4470,
    intro: 'Avec ces 5 formules, tu gères 90 % des tableaux qu\'on te donnera en stage.',
    etapes: [
      ['SOMME', '=SOMME(B2:B20) additionne une colonne. Astuce : Alt + = l\'écrit pour toi.'],
      ['MOYENNE', '=MOYENNE(C2:C20) donne la moyenne, pratique pour les notes ou les ventes.'],
      ['SI', '=SI(D2>=10;"Admis";"Ajourné") affiche un texte selon une condition.'],
      ['NB.SI', '=NB.SI(E2:E200;"Payé") compte combien de lignes contiennent « Payé ».'],
      ['RECHERCHEV', '=RECHERCHEV(A2;Tarifs!A:B;2;FAUX) va chercher un prix dans un autre tableau à partir d\'un code.']
    ] },
  { id: 'cle-usb-raccourcis', img: 'img/b-usb.jpg', cat: 'virus', public: 'tous', titre: 'Clé USB : tes fichiers sont devenus des raccourcis ?', min: 3, vues: 7350,
    intro: 'Très fréquent après un passage au cyber : un virus cache tes fichiers et met des raccourcis à la place. Tes fichiers sont toujours là.',
    etapes: [
      ['Ne clique sur aucun raccourci', 'C\'est le raccourci qui relance le virus. Branche la clé et n\'ouvre rien.'],
      ['Repère la lettre de la clé', 'Ouvre « Ce PC » et note la lettre de la clé (par exemple E:).'],
      ['Commande magique', 'Ouvre l\'invite de commandes, tape : attrib -h -r -s /s /d E:\\*.* (remplace E par ta lettre) puis Entrée.'],
      ['Supprime les raccourcis', 'Tes vrais dossiers réapparaissent. Supprime les raccourcis et fais une analyse antivirus de la clé.']
    ] },
  { id: 'economiser-data', img: 'img/b-data.jpg', cat: 'internet', public: 'tous', titre: 'Économiser ton forfait Internet sur Android', min: 4, vues: 3310,
    intro: 'Ton forfait finit en 3 jours ? Ces réglages peuvent diviser ta consommation par deux.',
    etapes: [
      ['Économiseur de données', 'Paramètres → Réseau → Utilisation des données → active l\'« Économiseur de données ».'],
      ['WhatsApp : pas de téléchargement auto', 'WhatsApp → Paramètres → Stockage et données : désactive le téléchargement automatique sur données mobiles.'],
      ['Mises à jour en Wi-Fi seulement', 'Play Store → Paramètres → Préférences réseau → « Via Wi-Fi uniquement ».'],
      ['Vidéos en qualité réduite', 'Sur TikTok, YouTube et Facebook, active le mode économie de données dans les réglages.']
    ] },
  { id: 'proteger-whatsapp', img: 'img/b-whatsapp.jpg', cat: 'virus', public: 'commercant', titre: 'Protéger ton compte WhatsApp contre le vol', min: 3, vues: 5980,
    intro: 'Le vol de compte WhatsApp est l\'arnaque n°1. Pour un commerçant, c\'est tous tes clients qui sont en danger.',
    etapes: [
      ['Active la vérification en deux étapes', 'WhatsApp → Paramètres → Compte → Vérification en deux étapes → choisis un code à 6 chiffres.'],
      ['Ne donne JAMAIS le code reçu par SMS', 'Personne de sérieux ne te demandera ce code, même un « ami » ou un « agent ».'],
      ['Vérifie les appareils connectés', 'Paramètres → Appareils connectés : déconnecte tout appareil que tu ne reconnais pas.'],
      ['Préviens tes contacts', 'Si ton compte est volé, préviens vite tes clients par un autre moyen pour qu\'ils n\'envoient pas d\'argent.']
    ] },
  { id: 'wifi-sans-internet', img: 'img/b-wifi.jpg', cat: 'internet', public: 'commercant', titre: 'Wi-Fi connecté mais pas d\'Internet', min: 4, vues: 2760,
    intro: 'Le Wi-Fi affiche « connecté » mais rien ne charge ? Voici les vérifications dans le bon ordre.',
    etapes: [
      ['Redémarre la box', 'Débranche la box 30 secondes puis rebranche. Attends que les voyants soient stables.'],
      ['Teste un autre appareil', 'Si aucun appareil n\'a Internet, le problème vient de la box ou du fournisseur : vérifie ton crédit.'],
      ['Oublie le réseau', 'Sur l\'appareil qui bloque : oublie le réseau Wi-Fi puis reconnecte-toi avec le mot de passe.'],
      ['Réinitialise le réseau du PC', 'Windows : Paramètres → Réseau et Internet → Paramètres réseau avancés → Réinitialisation du réseau.']
    ] },
  { id: 'sauvegarder-fichiers', img: 'img/b-save.jpg', cat: 'pc', public: 'tous', titre: 'Sauvegarder tes photos et documents avant qu\'il soit trop tard', min: 5, vues: 2140,
    intro: 'Un vol, une chute, un virus… et 5 ans de photos disparaissent. La règle simple : 3 copies, 2 supports, 1 hors de chez toi.',
    etapes: [
      ['Active la sauvegarde du téléphone', 'Google Photos ou iCloud : active la sauvegarde en Wi-Fi uniquement pour ne pas consommer ton forfait.'],
      ['Copie tes documents importants', 'Diplômes, CNI, CV, contrats : scanne-les et range-les dans Google Drive dans un dossier « Documents importants ».'],
      ['Une clé ou un disque externe', 'Une fois par mois, copie tout sur une clé ou un disque que tu ranges à part.'],
      ['Vérifie que ça marche', 'Ouvre un fichier sauvegardé au hasard de temps en temps : une sauvegarde jamais vérifiée n\'est pas une sauvegarde.']
    ] }
];

AMD.VIDEOS = [
  { id: 'v1', img: 'img/v-pc.jpg', titre: 'Ton PC est lent ? Fais ces 3 choses', duree: '0:58', vues: '12,4 k', article: 'pc-lent',
    slides: ['Ton PC rame ?', 'Ctrl + Maj + Échap → Démarrage', 'Désactive tout le superflu', 'Windows + R → %temp% → supprime', 'Redémarre une fois par semaine', 'PC rapide ! Abonne-toi'] },
  { id: 'v2', img: 'img/v-usb.jpg', titre: 'Clé USB : fichiers en raccourcis', duree: '0:45', vues: '18,9 k', article: 'cle-usb-raccourcis',
    slides: ['Tes fichiers sont des raccourcis ?', 'Ne clique sur rien !', 'Ouvre l\'invite de commandes', 'attrib -h -r -s /s /d E:\\*.*', 'Tes fichiers reviennent'] },
  { id: 'v3', img: 'img/v-cv.jpg', titre: 'Le CV qui décroche le stage', duree: '1:12', vues: '8,1 k', article: 'cv-word-20-minutes',
    slides: ['7 secondes pour convaincre', '1 seule page', 'Des chiffres dans tes expériences', 'Exporte en PDF', 'CV pro en 24 h : 3 000 FCFA'] }
];

AMD.SEED_QUESTIONS = [
  { id: 'Q-1042', nom: 'Brenda', quartier: 'Bonamoussadi', cat: 'pc', public: 'etudiant', titre: 'Mon PC portable met 10 minutes à démarrer', texte: 'C\'est un HP de 2018, il rame surtout au démarrage. J\'ai mon mémoire à rendre…', date: -2, votes: 14, statut: 'resolu',
    reponses: [{ par: 'Ryan', equipe: true, date: -2, texte: 'Salut Brenda ! Commence par l\'article « Ton PC est lent ? Fais ces 3 choses ». Si c\'est encore lent après, ton disque est sûrement fatigué : un SSD change tout (dès 15 000 FCFA). Je peux vérifier à distance pour 5 000 FCFA.' }, { par: 'Brenda', date: -1, texte: 'Merci, le démarrage passe à 1 minute !' }] },
  { id: 'Q-1041', nom: 'M. Ekwalla', quartier: 'Akwa', cat: 'virus', public: 'commercant', titre: 'On m\'a volé mon WhatsApp de la boutique', texte: 'Quelqu\'un écrit à mes clients pour demander de l\'argent avec mon numéro. Que faire vite ?', date: -3, votes: 21, statut: 'resolu',
    reponses: [{ par: 'Ryan', equipe: true, date: -3, texte: 'Urgent : réinstalle WhatsApp et reconnecte-toi avec ton numéro, le code SMS te reviendra. Active ensuite la vérification en deux étapes. Préviens tes clients par SMS ou statut. Tout est détaillé dans l\'article « Protéger ton compte WhatsApp ».' }] },
  { id: 'Q-1040', nom: 'Junior', quartier: 'Ndokotti', cat: 'phone', public: 'tous', titre: 'Téléphone tombé dans l\'eau, il ne s\'allume plus', texte: 'Tecno Spark, tombé dans un seau hier soir. Je l\'ai mis dans le riz.', date: -1, votes: 9, statut: 'repondu',
    reponses: [{ par: 'Ryan', equipe: true, date: -1, texte: 'Surtout ne le charge pas ! Le riz aide peu : il faut l\'ouvrir et nettoyer la carte à l\'alcool isopropylique. Envoie-moi une photo sur WhatsApp, je te dis si ça vaut la réparation.' }] },
  { id: 'Q-1039', nom: 'Aïcha', quartier: 'Makepe', cat: 'office', public: 'etudiant', titre: 'Comment faire une RECHERCHEV entre deux feuilles Excel ?', texte: 'Pour mon stage je dois retrouver les prix depuis une autre feuille.', date: -4, votes: 7, statut: 'resolu',
    reponses: [{ par: 'Ryan', equipe: true, date: -4, texte: 'Exemple : =RECHERCHEV(A2;Tarifs!A:B;2;FAUX). « Tarifs » est le nom de l\'autre feuille, 2 la colonne du prix. Voir l\'article « Excel : les 5 formules ».' }] },
  { id: 'Q-1038', nom: 'Patrick', quartier: 'Deido', cat: 'internet', public: 'commercant', titre: 'Wi-Fi de la boutique connecté mais pas d\'internet', texte: 'Depuis ce matin, le terminal de paiement et les téléphones n\'ont plus internet.', date: 0, votes: 3, statut: 'attente', reponses: [] },
  { id: 'Q-1037', nom: 'Grâce', quartier: 'Bonabéri', cat: 'cv', public: 'etudiant', titre: 'Quelle photo mettre sur mon CV ?', texte: 'Je postule pour un stage en banque. Photo obligatoire ?', date: -5, votes: 5, statut: 'resolu',
    reponses: [{ par: 'Ryan', equipe: true, date: -5, texte: 'Pas obligatoire, mais conseillée au Cameroun. Fond uni, tenue sobre, visage bien éclairé, pas de selfie. Je peux te faire le CV complet pour 3 000 FCFA.' }] }
];

AMD.TEMOIGNAGES = [
  { nom: 'Brenda, étudiante', av: 'img/av1.jpg', quartier: 'Bonamoussadi', texte: 'Mon PC démarrait en 10 minutes. Avec l\'article gratuit c\'est réglé. J\'ai ensuite pris la formation Excel pour mon stage.', note: 5 },
  { nom: 'M. Ekwalla, quincaillerie', av: 'img/av2.jpg', quartier: 'Akwa', texte: 'On m\'avait volé mon WhatsApp de boutique. Ryan m\'a répondu en 20 minutes, j\'ai tout récupéré.', note: 5 },
  { nom: 'Sandrine, couturière', av: 'img/av3.jpg', quartier: 'Logbaba', texte: 'Mon CV a été fait en une journée pour 3 000 FCFA. J\'ai eu un entretien la semaine suivante !', note: 5 }
];

AMD.SPONSOR = { nom: 'InfoPlus Akwa', texte: 'PC reconditionnés garantis 6 mois · SSD dès 15 000 FCFA', lieu: 'Rue Joss, Akwa', tarif: 20000 };
