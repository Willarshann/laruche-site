# Prompts de génération — visuels produits LaRuche

## Le problème à éviter
À chaque génération, l'IA **réécrit le texte de l'étiquette et le casse** (« LoRuche », « 700 ml », lignes en charabia).
La règle d'or : **ne jamais laisser l'IA réinventer le texte**. Deux méthodes, par ordre de fiabilité :

1. **Édition ciblée (recommandé — Nanobanana / Gemini « edit image »)** : on fournit le packshot existant + une consigne qui corrige UNIQUEMENT le texte fautif, sans retoucher le reste.
2. **Génération complète** : seulement si l'édition échoue ; fournir en référence une étiquette nette (le packshot **175 ml** dont l'étiquette est parfaite) pour que le modèle copie le texte.

Texte EXACT de l'étiquette (à respecter au caractère près) :
```
LaRuche            (logo, en haut)
100% Naturel       (bandeau vert)
BEE HAPPY          (grand titre, lettres miel sur cartouche brun foncé)
[mascotte abeille souriante, pouce levé, cuillère à miel]
XXX ml             (volume, en bas à droite : 175 / 350 / 750)
Vivre Haïti dans chaque goutte !
Produit et distribué par l'entreprise LaRuche en Haïti.
Téls : +509 3785-6706 / 3563-0175
```

---

## 750 ml — PRIORITAIRE (l'actuel affiche « 700 ml » + ligne du bas illisible)

### Méthode 1 — édition ciblée (fournir le packshot 750 actuel)
```json
{
  "task": "edit_image",
  "input_image": "product-750 actuel (bouteille cylindrique haute, bouchon jaune, miel doré, fond studio blanc)",
  "instructions": "Corrige UNIQUEMENT le texte de l'étiquette, sans rien changer d'autre (forme de la bouteille, couleurs, lumière, mascotte, mise en page). Remplace le volume par exactement '750 ml'. Remplace la ligne du bas illisible par exactement, sur trois lignes : 'Vivre Haïti dans chaque goutte !' / 'Produit et distribué par l'entreprise LaRuche en Haïti.' / 'Téls : +509 3785-6706 / 3563-0175'. Le mot de marque doit être 'LaRuche' (jamais LoRuche). Garde le bandeau vert '100% Naturel' et le titre 'BEE HAPPY' intacts.",
  "keep": ["forme de la bouteille", "bouchon jaune", "miel doré", "fond studio", "mascotte abeille", "cartouche BEE HAPPY"]
}
```

### Méthode 2 — génération complète (si l'édition échoue)
```json
{
  "task": "product_photography",
  "subject": "Bouteille de miel liquide, verre transparent, forme cylindrique haute type bouteille de sirop, bouchon à vis jaune, remplie de miel doré translucide.",
  "label": {
    "brand_logo_top": "LaRuche (abeille ambre + mot LaRuche brun)",
    "green_ribbon": "100% Naturel",
    "big_title": "BEE HAPPY (lettres couleur miel, contour, sur cartouche brun foncé)",
    "mascot": "abeille cartoon souriante, pouce levé, tenant une cuillère à miel en bois",
    "volume": "750 ml",
    "tagline": "Vivre Haïti dans chaque goutte !",
    "legal_line": "Produit et distribué par l'entreprise LaRuche en Haïti.",
    "phones": "Téls : +509 3785-6706 / 3563-0175",
    "background_style": "dégradé miel/crème avec alvéoles de ruche en filigrane"
  },
  "scene": "packshot studio, fond blanc/gris très clair uniforme, lumière douce, légère ombre portée, cadrage vertical centré",
  "critical": "Le texte doit être NET et ORTHOGRAPHIÉ EXACTEMENT comme indiqué. Marque = 'LaRuche'. Volume = '750 ml'.",
  "reference_for_text": "utiliser l'étiquette du packshot 175 ml (nette) comme modèle typographique"
}
```

---

## 350 ml — optionnel (l'actuel est correct sauf une micro-ligne du bas)

### Méthode 1 — édition ciblée (fournir le packshot 350 actuel)
```json
{
  "task": "edit_image",
  "input_image": "product-350 actuel (bouteille type soda, bouchon jaune, miel ambré)",
  "instructions": "Corrige UNIQUEMENT la petite ligne de bas de l'étiquette : elle doit dire exactement 'Produit et distribué par l'entreprise LaRuche en Haïti.'. Ne change rien d'autre. Vérifie que le volume affiche bien '350 ml' et la marque 'LaRuche'.",
  "keep": ["tout le reste de l'image à l'identique"]
}
```

---

## Après génération
1. Enregistrer les fichiers en `product-750.jpg` / `product-350.jpg` (packshot vertical, fond clair).
2. Les déposer via **/admin → Produits → Image du pot** (remplacement en un clic), OU écraser les fichiers dans `public/images/` et redéployer.
3. Idéal : fond studio blanc/gris clair uniforme (se fond avec les cartes crème du site).
