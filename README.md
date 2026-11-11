# Aide-moi Douala — prototype

Site d'entraide informatique pour Douala : on aide **gratuitement** d'abord (blog, vidéos, forum),
puis on propose une **aide payante** quand le problème est trop gros (dépannage, CV, formations, VIP).
Cible retenue : **tout le monde à Douala**, avec des filtres « Étudiants » et « Commerçants ».

## Lancer
Double-cliquer sur `index.html` (ou `python -m http.server` dans ce dossier).

## Parcours à montrer (≈ 5 minutes)
1. **Accueil** : taper « mon pc est lent » dans la recherche → suggestion de guide. Cliquer une **vidéo** (lecteur simulé façon TikTok).
2. **Blog** → un guide : cocher les étapes (barre de progression), voter « Ce guide t'a aidé ? », puis l'offre payante en bas.
3. **Poser une question** : envoyer le formulaire vide (messages d'erreur), puis le remplir → des guides similaires sont proposés pendant la saisie.
   Après l'envoi, **Ryan répond automatiquement en 5 secondes** (notification) avec un lien gratuit + une offre adaptée.
4. **Solutions** : filtrer Étudiants / Commerçants, cliquer « Commander » → paiement **Orange Money / MTN MoMo simulé**
   (numéro validé : 9 chiffres commençant par 6) → reçu avec référence. « Devenir VIP » active -20 % et les questions illimitées.
5. **Espace Ryan** (pied de page) : questions à traiter (répondre depuis ici), commandes reçues, interrupteur de la pub locale,
   et **simulateur de revenus** : 1 000 visiteurs → 100 questions → 20 clients ≈ 190 000 FCFA / mois.

Les 4 pages demandées : Accueil · Poser une question (+ forum) · Solutions / Formations · Blog d'aide (10 articles).
Données fictives, enregistrées dans le navigateur ; « Réinitialiser la démo » dans l'Espace Ryan.
Photos : Unsplash (licence Unsplash : usage libre, y compris commercial), enregistrées dans `img/` pour fonctionner hors ligne.
Le numéro WhatsApp est un numéro de démonstration à remplacer dans `js/data.js` (`AMD.WHATSAPP`).
