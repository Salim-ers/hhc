# Design system « Couverture »

## Idée directrice

Un site clair et éditorial, comme un magazine de coiffure : de grandes photographies, une typographie sûre d'elle, et les informations utiles (téléphone, horaires, déplacement) plutôt que des décorations. La signature de la marque, « La coiffure autrement », sert de titre d'accueil. La forme récurrente est **l'arche du miroir** (classe `.arch`) pour les portraits ; autour, tout est doux et arrondi : panneaux (`.panel`), cartes, boutons en pilule, champs de formulaire.

Ce qui a été volontairement retiré, car typique des gabarits générés : fond noir + or + halo lumineux en ouverture, photo inclinée en superposition, pastilles d'arguments, flèche dans un rond, mèches dorées décoratives, boutons « magnétiques », surtitres à tiret, numérotation « 01 — », indicateur « Découvrir », monogrammes en filigrane, tirets cadratins, titres mi-romains mi-italiques.

## Couleurs (`src/app/globals.css`, `@theme`)

| Jeton | Valeur | Usage |
|---|---|---|
| `noir` | `#101010` | Hero, panneaux sombres, pied de page |
| `espresso` | `#382B27` | Panneaux chauds, onglet actif, invitation au rendez-vous |
| `cacao` | `#241C19` | Fond des images en chargement |
| `ivoire` | `#F5F0E8` | Cartes sur fond clair, texte sur fond sombre |
| `lin` | `#FAF8F4` | Fond principal |
| `sable` | `#E9E0D2` | Bloc avis, intertitres de la carte des tarifs |
| `or-logo` | `#D8A301` | **Uniquement** le monogramme |
| `champagne` | `#C7A76C` | Bouton principal, accents sur fond sombre |
| `or-profond` | `#8A6A22` | Texte doré sur fond clair (contraste AA) |
| `encre` / `taupe` | `#1D1715` / `#6F625A` | Texte principal / secondaire |

## Formes

| Élément | Arrondi |
|---|---|
| Boutons, onglets, pastilles, barre d'en-tête au défilement | pilule (`rounded-full`) |
| Champs de formulaire | `1.1rem` |
| Cartes (avantages, offres, FAQ, contact) | `1.5rem` à `1.75rem` |
| Images | `1.5rem` à `2rem`, ou `.arch` pour les portraits |
| Panneaux de section (`.panel`) | `2rem` (mobile), `3rem` (≥ 768 px), marge de 0,5 à 0,75 rem |

`.arch` suppose un format 3:4 (variable `--arch-y: 37.5%`). Pour un autre format, ajuster `--arch-y` = (largeur / 2) / hauteur.

## Typographies (auto-hébergées)

- **Bodoni Moda** : titres, en romain uniquement.
- **Jost** : interface et textes.
- Pas de surtitre : le titre porte seul la hiérarchie. Échelle : `.t-display`, `.t-h1`, `.t-h2`, `.t-h3`, `.t-lead`.

## Mouvement (`src/components/motion/reveal.tsx`)

| Effet | Où |
|---|---|
| Titres révélés mot à mot (`TextReveal`), légère rotation comme une mèche qui retombe | Tous les titres |
| Photo panoramique qui s'ouvre depuis une capsule, léger zoom arrière, parallaxe au défilement | Hero |
| Remplissage qui monte comme un liquide, flèche qui avance | Boutons |
| Section figée, cartes qui défilent horizontalement au rythme du scroll | Prestations signatures (≥ 1024 px) ; carrousel à balayer sur mobile |
| Fil doré qui se remplit au défilement | La coiffure à domicile |
| Rubans de photos en sens contraires, en pause au survol | Aperçu de la galerie |
| Onglet actif qui glisse, lignes de tarifs en cascade | Prestations & tarifs |
| Ouverture fluide des questions | FAQ (CSS, navigateurs récents) |

Règles :
- `prefers-reduced-motion` : aucune animation ; les contenus s'affichent directement, la section des signatures n'est plus figée, les rubans deviennent des rangées défilables à la main.
- Sans JavaScript, une règle `<noscript>` affiche tous les éléments `data-reveal` dans leur état final.
- Le HTML rendu par le serveur ne dépend jamais de la préférence de mouvement (sinon erreur d'hydratation) : seules les animations changent.
- Le loader n'apparaît qu'une fois par session, passable au clic ou avec Échap.

## Mise en page

- Conteneur `max-width: 100rem`, gouttière fluide `clamp(1.25rem, 4vw, 4rem)`.
- Au-delà de 2200 px puis 3000 px (grands moniteurs, téléviseurs), la taille de base passe à 112,5 % puis 140 % : toute la mise en page s'agrandit proportionnellement.
- Hero : photo panoramique arrondie sous l'en-tête, puis le titre (gauche) et le texte, le bouton et le téléphone (droite), puis une ligne horaires / déplacement / lien vers les tarifs. Le tout tient dans un écran de 1440 × 900.
- En-tête clair (texte encre) ; au défilement, capsule claire flottante. En-têtes des pages intérieures : panneau ivoire arrondi.
- Mobile : photo, titre, texte, bouton et téléphone visibles sans défiler ; menu plein écran clair ; barre d'action « Appeler / Prendre rendez-vous » en pilule.

## Architecture de l'information (une page = un rôle)

| Page | Rôle |
|---|---|
| Accueil | Donner envie et orienter : Hero, Angèle, prestations signatures, la coiffure à domicile, galerie, avis, questions |
| Prestations & tarifs | Ce que fait Angèle et combien cela coûte (anciennes pages Prestations et Tarifs fusionnées ; `/tarifs` redirige en 308) |
| Coloriste & visagiste | La méthode, en profondeur |
| Forfaits & offres | Forfaits, formules, parrainage, bon cadeau (n'apparaissent plus en double dans la carte des tarifs) |
| Zone d'intervention | Où et quand ; renvoie vers Contact (un seul formulaire sur le site) |
| Contact | Le formulaire et les coordonnées |

L'invitation au rendez-vous est définie une seule fois (*Accueil → Invitation au rendez-vous*) et affichée en tête du pied de page de toutes les pages, sauf Contact.
