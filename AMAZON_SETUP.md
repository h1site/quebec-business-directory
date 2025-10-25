# Amazon Associates Configuration

## Clés Amazon (À ajouter dans Vercel)

**IMPORTANT:** Ces clés doivent être ajoutées dans Vercel Environment Variables, PAS dans le code!

1. Allez sur https://vercel.com/h1site/quebec-business-directory
2. Settings → Environment Variables
3. Ajoutez ces variables:

```
AMAZON_ACCESS_KEY=AKPAIKGGWA1761397818
AMAZON_SECRET_KEY=0V5mqFbmceHJfxZKpV9jzF6FJy9Hl4m9IywbW3nR
AMAZON_ASSOCIATE_TAG=h1site0d-20
AMAZON_REGION=ca
```

## ⚠️ SÉCURITÉ

Après avoir ajouté ces clés dans Vercel:

1. **Supprimez ce fichier** (ne le commitez jamais!)
2. **Régénérez de nouvelles clés** dans votre compte Amazon Associates
3. Les clés dans ce fichier doivent être considérées comme compromises

## Comment ça fonctionne

L'intégration Amazon affiche des produits recommandés sur les fiches d'entreprise basés sur:
- La catégorie de l'entreprise
- Les mots-clés pertinents
- La localisation (produits Amazon.ca)

Les produits sont affichés dans une section "Produits et Ressources Recommandés" en bas de page.
