# Design system — « Luxury Hair Editorial »

## Idée directrice

L'élément mémorable est **l'arc du « C » du monogramme HHC** : le loader trace le monogramme et fait glisser un reflet doré, puis un cercle s'ouvre depuis le « C » pour révéler la page ; dans le Hero, l'image apparaît par ce même cercle. Ensuite, l'arc revient discrètement comme **un seul angle arrondi** sur les grandes photographies (`.arc-tl`, `.arc-tr`). Tout le reste reste calme : filets fins, grands blancs, typographie.

## Couleurs (`src/app/globals.css`, `@theme`)

| Jeton | Valeur | Usage |
|---|---|---|
| `noir` | `#101010` | Fonds sombres, Hero, pied de page |
| `espresso` | `#382B27` | Troisième fond, rythme entre noir et ivoire |
| `cacao` | `#241C19` | Cartes sur fond sombre |
| `ivoire` | `#F5F0E8` | Fonds clairs, texte sur fond sombre |
| `lin` | `#FAF8F4` | Fond principal clair |
| `sable` | `#E9E0D2` | Section avis |
| `or-logo` | `#D8A301` | **Uniquement** le monogramme (or exact du logo officiel) |
| `champagne` | `#C7A76C` | Accents et boutons sur fond sombre |
| `or-profond` | `#8A6A22` | Texte doré sur fond clair (contraste AA) |
| `encre` / `taupe` | `#1D1715` / `#6F625A` | Texte principal / secondaire |

Le doré n'est jamais utilisé en aplat de grande surface ni en dégradé décoratif, sauf le reflet métallique du loader.

## Typographies (auto-hébergées, aucun appel à Google Fonts)

- **Bodoni Moda** (variable, tailles optiques) — titres. Grands corps, interlignage serré, lignes entières en italique (jamais un mot isolé).
- **Jost** (variable) — interface et textes ; sa géométrie répond au logotype « Hair Home Concept ».
- Surtitres en Bodoni italique, en minuscules, précédés d'un filet — jamais de capitales espacées.

Échelle : `.t-display` (Hero), `.t-h1`, `.t-h2`, `.t-h3`, `.t-lead`.

> Cormorant Garamond, envisagé au départ, a été écarté : sa version web affiche mal les accents (ô, à) — rédhibitoire pour un site en français.

## Mouvement

- Un seul moment orchestré : loader → ouverture du Hero.
- Titres révélés ligne par ligne derrière un masque ; images révélées par rideau avec léger zoom arrière ; parallaxe modérée.
- Transitions de page : fondu court.
- `prefers-reduced-motion` : toutes les animations sont neutralisées (et le loader n'apparaît pas).
- Le loader n'apparaît qu'une fois par session, passable au clic ou avec Échap, et jamais sans JavaScript.

## Mise en page

- Grille 12 colonnes, gouttière fluide `clamp(1.25rem, 4vw, 4rem)`, largeur max 1600 px.
- Compositions asymétriques (image 5 col. / texte 7 col., alternées).
- Mobile recomposé : Hero plein cadre avec texte en bas, menu plein écran, barre d'action « Appeler / Prendre rendez-vous ».
- Tarifs présentés comme une carte imprimée : nom, points de conduite, prix en chiffres tabulaires.
