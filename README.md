# Site LaRuche

Site vitrine + interface d'administration pour **LaRuche**, entreprise apicole haïtienne.
Miel *Bee Happy* — « Vivre Haïti dans chaque goutte ! »

Stack : site statique (`public/`) + **Cloudflare Pages Functions** (`functions/`) + **KV** pour le contenu éditable et les images. Même architecture que le portfolio Djamina.

---

## Structure

```
laruche-site/
├── public/                 # servi tel quel
│   ├── index.html          # le site
│   ├── styles.css          # identité (palette officielle F2B150 / 413229 / 5B6A36)
│   ├── script.js           # animations (pollen, reveal, parallaxe)
│   ├── cms.js              # hydrate la page depuis /api/content
│   ├── content-defaults.js # tous les textes par défaut (repli si KV vide)
│   ├── admin.html          # /admin — interface d'édition
│   ├── admin.js            # logique admin (login, édition, upload, save)
│   └── images/             # logos, mockups, packshots produits
├── functions/              # API serverless (Cloudflare Pages Functions)
│   ├── _lib/auth.js        # session signée HMAC-SHA256
│   ├── api/{login,logout,session,content,upload}.js
│   └── media/[[path]].js   # sert les images stockées dans KV
├── wrangler.jsonc          # config (⚠️ id KV à renseigner)
└── .dev.vars               # mot de passe admin DEV local (gitignoré)
```

## Contenu de marque (source)

Tous les textes viennent du propriétaire ; coordonnées confirmées par le papier à en-tête et les étiquettes imprimées :

- **Slogan** : Vivre Haïti dans chaque goutte !
- **Site** : www.laruche.com · **Email** : larucheht@gmail.com
- **Tél** : +509 3785-6706 / 3563-0175
- **Adresse** : 524, Autoroute de Carrefour, Entre Thor 67 et 69 (Bâtiment de New System Academy)
- **Produits** : Bee Happy 175 / 350 / 750 ml

---

## Développement local

```bash
cd laruche-site
npx wrangler pages dev public --kv STORE --local
# → http://localhost:8788   ·   admin : http://localhost:8788/admin
# mot de passe local défini dans .dev.vars (ADMIN_PASSWORD)
```

## Mise en production (Cloudflare — à lancer par Léger dans son terminal)

Les écritures wrangler (OAuth) ne fonctionnent pas depuis un shell non interactif : ces commandes sont à exécuter **dans ton terminal**.

```bash
cd laruche-site

# 1. Créer le namespace KV (une seule fois) — copier l'id retourné
npx wrangler kv namespace create STORE

# 2. Coller cet id dans wrangler.jsonc à la place de
#    "PLACEHOLDER_A_REMPLACER_APRES_CREATION_DU_NAMESPACE"

# 3. Définir le mot de passe admin de production (secret, jamais dans le code)
npx wrangler pages secret put ADMIN_PASSWORD --project-name=laruche

# 4. Déployer
npx wrangler pages deploy public
```

Pour **redéployer** après une modif de code : `npx wrangler pages deploy public`.
Le contenu éditable et les images restent dans KV entre les déploiements — pas besoin de redéployer pour un changement de texte/image (ça passe par `/admin`).

## Administration

`/admin` → mot de passe → édition de **tous les textes** (accueil, histoire, missions, valeurs, contact, pied de page), remplacement de **toutes les images** (logo d'accueil, image histoire, chaque pot, chaque mockup), ajout/suppression de produits et de visuels. « Enregistrer » écrit dans KV ; le site public se met à jour aussitôt.

## À finaliser

- **Packshot 750 ml** : le visuel généré affiche « 700 ml » et une ligne de texte incohérente (défaut de génération IA). À régénérer proprement, puis remplacer via `/admin`. Les visuels 175 et 350 ml sont corrects.
- Génération des visuels produits manquants : via l'extension Chrome sur le compte Google Pro (Gemini/Nanobanana), à tester.
