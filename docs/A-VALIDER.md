# Points à valider avant la mise en production

Tout ce qui est listé ici est **déjà en place dans le site**, mais repose sur une information à confirmer par Angèle ou sur un élément temporaire.

## Tarifs et offres

- [ ] **Les 72 tarifs** importés de l'ancien site (page consultée le 06/11/2026, mention « Tarifs TTC à compter du 12 mars 2026 »). Ils sont marqués *À vérifier* dans l'administration.
- [ ] **Signification des astérisques** de l'ancien site, interprétée ainsi :
  - `*` → supplément de 13 € pour cheveux longs ou épais ;
  - `**` → supplément + coupe offerte par l'enseigne ;
  - `***` → forfait Beauty Color (prestation régulière) + coupe offerte + supplément.
- [ ] **Regroupement « coupe offerte »** : quand l'ancien site listait la même prestation avec et sans coupe au même prix (ex. Couleur 50 € / Couleur + coupe 50 €), une seule ligne a été conservée avec l'étiquette « Coupe offerte ».
- [ ] **Répartition par onglets** : Renforçateur, Soin et Sourcils sont classés dans « Soins & techniques » ; Couleur, Beauty Color, décoloration et effets dans « Coloration » ; balayages et mèches dans leur onglet.
- [ ] **Offres** (Beauty Color ×3, Forfait'Hair, Formul'Hair, Modelage illimité, parrainage −15 %, bienvenue −10 %, étudiant −10 %, bon cadeau) : toujours en vigueur ?
- [ ] **« L'offre du mois »** (mentionnée sur la page Prestige de l'ancien site) : créée en **brouillon**, non publiée, faute de contenu précis.
- [ ] **Majoration de 20 %** après 20h, dimanches et jours fériés : toujours d'actualité ?

## Zone d'intervention

- [ ] **Liste des 16 communes** « déplacement offert » : l'ancien site indique seulement « Troyes et l'agglomération ». La liste proposée (principales communes de Troyes Champagne Métropole) est à confirmer ou compléter.
- [ ] Montant ou règle des **frais de déplacement hors zone** (actuellement : « selon la distance »).

## Identité et contenus

- [ ] **Logo** : vectorisé fidèlement depuis le fichier fourni (monogramme HHC or `#D8A301`, logotype, signature). Déclinaisons fond sombre / fond clair et favicon générés. À valider visuellement.
- [ ] **Portrait d'Angèle** (page À propos) : emplacement prêt, à importer depuis *Textes & pages → À propos → Portrait*.
- [ ] **Photos** : 35 photographies Unsplash temporaires (licence Unsplash, usage commercial autorisé). Elles ne représentent pas des réalisations d'Angèle ; la galerie l'indique. À remplacer par ses réalisations (Médiathèque → Remplacer partout).
- [ ] **Parcours** (À propos) : reformulé uniquement d'après l'ancien site (grand coiffeur créateur élu aux Victoires de la beauté, Mondial de la Coiffure, formations, marques citées). Aucune date ni diplôme ajouté. Le titre « Maître artisan » vient de l'ancien site.
- [ ] Mention des **marques** (René Furterer, L'Oréal Paris, Sebastian, Toni & Guy, American Crew, Bumble and Bumble, Revlon, Wella) : présentée comme expérience professionnelle, jamais comme partenariat. Conserver ?
- [ ] **Avis clients** : aucun avis inventé. La section invite à laisser un avis sur Facebook jusqu'à l'ajout de vrais témoignages autorisés.
- [ ] **Bijoux & cadeaux** : page activée. Désactivable dans *Paramètres → Modules*.
- [ ] **WhatsApp** : prévu, désactivé. Activer dans *Paramètres → Coordonnées* avec le numéro au format international.
- [ ] **Instagram** : aucun compte connu ; champ prévu.

## Légal

- [ ] **Mentions légales** : raison sociale, forme juridique, SIRET, immatriculation, adresse du siège, directrice de la publication (*Paramètres → Informations légales*). Les champs contiennent des repères « [à compléter] ».
- [ ] **Politique de confidentialité** : durée de conservation proposée de 3 ans après le dernier contact, à confirmer.

## Technique

- [ ] Créer le projet **Neon** (région Europe) et lancer migrations + initialisation.
- [ ] Activer le **rôle public** `hhc_public` (README, étape 3).
- [ ] Ajouter **Vercel Blob**, **Resend** (domaine d'envoi vérifié), éventuellement la clé **Google Maps Embed**.
- [ ] Créer le compte propriétaire d'Angèle (`npm run admin:create`).
- [ ] Bascule DNS du domaine, vérification **Search Console**, envoi du sitemap.
- [ ] Contrôle **Lighthouse** et test d'envoi d'une demande réelle après déploiement.
