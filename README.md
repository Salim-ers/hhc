# Hair Home Concept — site & administration

Refonte complète de **hairhomeconcept.com** : coiffure haut de gamme à domicile à Troyes et Sainte-Savine (Angèle, maître artisan coloriste et visagiste).

- **Site public** multipage « Le miroir » (voir `docs/DESIGN-SYSTEM.md`) : loader au monogramme, Hero en arche de miroir, page Prestations & tarifs à onglets, galerie avec visionneuse, carte de la zone d'intervention, formulaire unique de demande de rendez-vous.
- **Administration sur mesure** (`/admin`) : prix et prestations, offres programmables, textes avec brouillon / aperçu / publication, médiathèque (import, recadrage, remplacement partout), demandes de rendez-vous, paramètres, comptes, historique.
- **Aucun WordPress.** Toutes les données (tarifs compris) sont en base PostgreSQL **Neon** ; les modifications publiées apparaissent sans redéploiement.

---

## Stack

| Rôle | Outil |
|---|---|
| Framework | Next.js 15 (App Router), React 19, TypeScript |
| Style | Tailwind CSS 4, composants d'administration façon shadcn/ui (Radix UI) |
| Animations | Motion (Framer Motion), Lenis (défilement fluide) |
| Base de données | **Neon** PostgreSQL + Drizzle ORM, migrations SQL versionnées |
| Sécurité BDD | Rôle public `hhc_public` restreint par **Row-Level Security** |
| Authentification | Sessions serveur stockées dans Neon (jeton haché, cookie httpOnly), mots de passe scrypt |
| Images | Vercel Blob (conversion WebP, 2560 px max) ; images servies en AVIF/WebP responsives |
| E-mails | Resend |
| Carte | Google Maps Embed (chargée après accord du visiteur) |
| Hébergement | Vercel |

> GSAP était prévu « si nécessaire » : toutes les animations ont pu être réalisées avec Motion seul, ce qui allège le site. Il n'est donc pas inclus.

## Structure

```
src/
  app/
    (site)/            Pages publiques (accueil, prestations [& tarifs], coloriste-visagiste,
                       forfaits-offres, galerie, a-propos, zone-intervention, contact,
                       bijoux-cadeaux, mentions-legales, confidentialite)
    admin/             Administration : connexion, (panel)/… pages protégées, _actions/ (actions serveur)
    api/preview/       Aperçu des brouillons (réservé aux personnes connectées)
    sitemap.ts robots.ts manifest.ts opengraph-image.tsx
  components/
    brand/             Monogramme et logotype officiels (vectorisés depuis le logo fourni)
    motion/            Révélations, parallaxe, masques
    layout/            Loader, en-tête, menu mobile, pied de page, barre d'action mobile
    sections/          Sections éditoriales réutilisables
    site/              Composants interactifs (tarifs, galerie, formulaire, carte, JSON-LD)
    admin/             Kit d'interface de l'administration
  lib/
    db/                Schéma Drizzle et connexions (propriétaire / public)
    data/              Lecture des contenus publiés (cache + invalidation à la publication)
    auth/              Mots de passe, sessions, contrôle des rôles
    services/          E-mails, stockage d'images, demandes de rendez-vous
    content/           Registre des sections éditables, données initiales, visuels temporaires
drizzle/               Migrations SQL (0000 schéma, 0001 rôle public + RLS)
scripts/               migrate, seed, create-admin, local-postgres
docs/                  Guide d'Angèle, points à valider, design system
```

---

## 1. Démarrage en local

```bash
npm install
cp .env.example .env.local      # puis renseigner DATABASE_URL (Neon) — ou étape suivante
```

**Sans compte Neon**, un PostgreSQL local est fourni :

```bash
npm run db:local                # terminal 1 : Postgres sur le port 5433
# .env.local → DATABASE_URL=postgres://postgres:postgres@localhost:5433/hhc
npm run db:setup                # migrations + données initiales
npm run admin:create            # crée le compte propriétaire (demande e-mail, prénom, mot de passe)
npm run dev                     # http://localhost:3000  ·  http://localhost:3000/admin
```

**Mode démonstration** : sans `DATABASE_URL`, le site public fonctionne avec les données initiales (pratique pour une première présentation). L'administration et l'enregistrement des demandes nécessitent la base.

Astuce : ajouter `?sans-intro` à une URL pour passer l'écran d'ouverture.

## 2. Base de données Neon

1. Créer un projet sur [neon.tech](https://neon.tech), **région Europe (Frankfurt)** pour le RGPD.
2. Copier la chaîne « **Pooled connection** » dans `DATABASE_URL`.
3. Appliquer le schéma et les contenus :

```bash
npm run db:migrate              # crée les tables, le rôle hhc_public et les politiques RLS
npm run db:seed                 # tarifs, offres, textes, galerie, communes (n'écrase jamais l'existant)
npm run admin:create            # compte propriétaire d'Angèle
```

`npm run db:seed -- --reset` réinitialise tous les contenus (pas les comptes ni les demandes).

## 3. Rôle public restreint (recommandé)

La migration `0001` crée `hhc_public`, qui ne peut **lire que les contenus publiés** et **créer des demandes** (jamais les lire). Pour l'utiliser :

1. Console Neon → *SQL Editor* :
   ```sql
   ALTER ROLE hhc_public WITH LOGIN PASSWORD 'un-mot-de-passe-long-et-aleatoire';
   ```
2. `DATABASE_URL_PUBLIC` = même URL que `DATABASE_URL`, avec l'utilisateur `hhc_public` et ce mot de passe.

Les politiques ont été testées : brouillons, offres expirées, comptes, sessions, historique, médiathèque et demandes sont inaccessibles à ce rôle ; seule l'insertion d'une demande (statut « nouvelle » imposé) est permise.

## 4. Déploiement Vercel

1. Pousser le projet sur GitHub, puis *Add New Project* sur Vercel.
2. **Storage → Create → Blob** : ajoute automatiquement `BLOB_READ_WRITE_TOKEN`.
3. Renseigner les variables de `.env.example` (Production + Preview).
4. Déployer. Les pages publiques sont pré-générées, puis rafraîchies automatiquement à chaque publication dans l'administration (invalidation du cache, aucun redéploiement).

**Démonstration express** : un déploiement sans aucune variable affiche le site complet en mode démonstration.

## 5. Intégrations

- **Resend** : créer une clé API, vérifier le domaine d'envoi (SPF/DKIM), renseigner `RESEND_API_KEY` et `EMAIL_FROM`. L'adresse de réception se règle dans *Paramètres → Notifications*.
- **Google Maps** : facultatif ; une clé *Maps Embed API* restreinte au domaine améliore la carte. La carte ne se charge qu'après un clic du visiteur (cookies Google).
- **Google Search Console** : coller le code de vérification dans *Paramètres → Référencement*, puis soumettre `/sitemap.xml`.
- **Google Analytics** : renseigner l'identifiant G-… dans les Paramètres ; un bandeau de consentement apparaît alors et rien n'est chargé sans accord.

## 6. Bascule du domaine et SEO

- Les anciennes URL IziSpot (`/accueil_243.htm`, `/femmes___etudiantes___enfants_259.htm`, …) redirigent en **301/308** vers les nouvelles pages (`next.config.ts`).
- Chaque page a un titre et une description uniques (modifiables dans *Textes & pages*), une balise canonical, Open Graph, et des données structurées : `HairSalon` (avec `areaServed`, sans adresse de salon), `FAQPage`, `BreadcrumbList`, `OfferCatalog`.
- Domaine : ajouter `hairhomeconcept.com` et `www` dans Vercel → Domains, puis mettre à jour les DNS chez le registrar.

## 7. Sécurité — résumé

- Aucune clé ni mot de passe dans le code ; comptes créés par script ou par la propriétaire.
- Sessions : jeton aléatoire 256 bits en cookie `httpOnly`/`Secure`/`SameSite=Lax`, seul son SHA-256 est en base ; expiration 14 jours.
- Mots de passe : scrypt (N=2¹⁶), 12 caractères minimum, comparaison à temps constant.
- Connexion : limitation à 6 échecs / 15 min par IP et par e-mail, message d'erreur générique.
- Chaque page et **chaque action serveur** de l'administration revérifie la session en base et le rôle (propriétaire / éditeur) ; le middleware n'est qu'un premier filtre.
- Formulaire public : validation serveur (zod), pot de miel, délai minimal, 5 demandes/heure/IP, consentement horodaté.
- En-têtes HTTP de sécurité (HSTS, nosniff, frame, referrer, permissions) ; `/admin` en `noindex`.

## 8. Vérifications effectuées

- `next build`, `tsc --noEmit` et ESLint : sans erreur.
- Migrations et RLS exécutées sur un vrai PostgreSQL, avec tests d'accès du rôle public.
- Parcours automatisé dans Chrome : garde d'accès, cookie falsifié refusé, connexion, modification d'un prix visible immédiatement sur `/tarifs`, création de prestation, demande de rendez-vous (confirmation, validation), réception et changement de statut dans l'admin, brouillon → aperçu → publication, masquage de section, import et remplacement d'image partout, retrait d'offre, page en brouillon → 404, historique, redirections, sitemap, robots.
- 12 pages × 6 tailles d'écran (360 px → 2560 px) : aucun débordement, un seul `h1` par page, toutes les images ont un texte alternatif, aucun lien interne cassé, aucune erreur JavaScript.

Non testable depuis l'environnement de développement (à vérifier après déploiement) : envoi réel des e-mails Resend, stockage Vercel Blob, carte Google Maps, Lighthouse sur le domaine final.

## Documentation

- [`docs/GUIDE-ANGELE.md`](docs/GUIDE-ANGELE.md) — guide simple de l'administration.
- [`docs/A-VALIDER.md`](docs/A-VALIDER.md) — tout ce qu'il reste à confirmer avant la mise en production.
- [`docs/DESIGN-SYSTEM.md`](docs/DESIGN-SYSTEM.md) — couleurs, typographies, principes.
