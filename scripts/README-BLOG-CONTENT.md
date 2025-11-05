# Génération automatique du contenu des articles de blog

Ce script utilise l'API Claude d'Anthropic pour générer automatiquement du contenu riche et détaillé pour tous les articles de blog.

## Fonctionnalités

Le script génère pour chaque article:
- 6-8 sections principales avec balises `<h2>`
- Plusieurs sous-sections avec `<h3>`, `<h4>`, `<h5>` et même `<h6>`
- Des paragraphes détaillés et informatifs (3-5 paragraphes par section minimum)
- Des listes à puces et numérotées
- Des exemples concrets et pratiques
- Contenu optimisé pour SEO (2000-3000 mots par article)
- Contenu bilingue (français et anglais)

## Prérequis

1. **Clé API Anthropic**: Obtenez une clé API sur [console.anthropic.com](https://console.anthropic.com/)

2. **Ajoutez la clé dans .env**:
   ```bash
   echo "ANTHROPIC_API_KEY=votre_clé_api_ici" >> .env
   ```

3. **Installation des dépendances** (si pas déjà fait):
   ```bash
   npm install @anthropic-ai/sdk
   ```

## Utilisation

### Générer le contenu pour tous les articles

```bash
node scripts/generate-blog-content.js
```

Le script va:
1. Lire tous les articles depuis `api/blog-data.js`
2. Pour chaque article, générer du contenu riche en français et en anglais
3. Mettre à jour automatiquement le fichier `api/blog-data.js` avec le contenu généré
4. Respecter les limites de taux de l'API (délais de 2 secondes entre chaque requête)

### Sortie attendue

```
=== Génération automatique du contenu des articles de blog ===

[1/3] Article: neq-quebec-tout-savoir-numero-entreprise
Génération du contenu pour "NEQ Québec : tout savoir sur le numéro d'entreprise du Québec" (fr)...
✓ Contenu généré (8542 caractères)
Génération du contenu pour "Quebec NEQ: Everything About the Quebec Enterprise Number" (en)...
✓ Contenu généré (8231 caractères)
✓ Article "neq-quebec-tout-savoir-numero-entreprise" complété

[2/3] Article: comment-reclamer-fiche-entreprise-registre-quebec
...

✓ Fichier blog-data.js mis à jour avec succès!
   Localisation: /path/to/api/blog-data.js

=== Génération terminée ===
```

## Coûts

Le script utilise le modèle `claude-sonnet-4-20250514` avec un maximum de 16000 tokens par génération.

Pour 3 articles × 2 langues = 6 générations:
- Coût estimé: ~$0.50 - $1.00 USD
- Durée: ~2-3 minutes

## Personnalisation

### Modifier le prompt de génération

Éditez le fichier `scripts/generate-blog-content.js` et modifiez la variable `prompt` dans la fonction `generateArticleContent()`.

### Modifier le modèle Claude utilisé

Changez la ligne:
```javascript
model: 'claude-sonnet-4-20250514',
```

Modèles disponibles:
- `claude-sonnet-4-20250514` - Équilibre performance/coût (recommandé)
- `claude-opus-4-20250514` - Meilleure qualité mais plus cher
- `claude-haiku-3-5-20250107` - Plus rapide et moins cher mais qualité moindre

### Modifier la longueur du contenu

Changez `max_tokens` dans la fonction `generateArticleContent()`:
- `8000` tokens ≈ 1500-2000 mots
- `16000` tokens ≈ 3000-4000 mots (valeur actuelle)
- `32000` tokens ≈ 6000-8000 mots

## Après la génération

1. **Vérifier le contenu**: Lisez le contenu généré dans `api/blog-data.js`
2. **Tester localement**: Lancez `npm run dev` et vérifiez les pages de blog
3. **Commit et push**:
   ```bash
   git add api/blog-data.js package.json package-lock.json scripts/generate-blog-content.js
   git commit -m "Add AI-generated rich content for all blog articles"
   git push
   ```
4. **Déploiement**: Vercel déploiera automatiquement les changements

## Dépannage

### Erreur: ANTHROPIC_API_KEY non définie

Solution: Ajoutez la clé dans `.env`:
```bash
export ANTHROPIC_API_KEY=votre_clé_api_ici
node scripts/generate-blog-content.js
```

Ou ajoutez-la directement dans le fichier `.env`:
```
ANTHROPIC_API_KEY=votre_clé_api_ici
```

### Erreur: Rate limit exceeded

Solution: Le script attend déjà 2 secondes entre chaque génération. Si l'erreur persiste, augmentez le délai dans le code:
```javascript
await new Promise(resolve => setTimeout(resolve, 5000)); // 5 secondes
```

### Le contenu généré n'est pas assez long

Solution: Augmentez `max_tokens` à 32000 dans le code.

### Le contenu généré n'est pas dans le bon format HTML

Solution: Vérifiez que le prompt contient bien les instructions de formatage et les exemples de styles inline.

## Structure du contenu généré

Le contenu sera injecté dans le SSR de chaque article entre l'introduction et le footer:

```html
<article class="blog-article">
  <header>
    <h1>Titre de l'article</h1>
    <div>Par Auteur • Date • Temps de lecture</div>
    <img src="hero-image.jpg" />
  </header>
  <div class="article-content">
    <p>Introduction...</p>

    <!-- CONTENU GÉNÉRÉ ICI -->
    <section>
      <h2>Section principale 1</h2>
      <p>Paragraphes...</p>
      <h3>Sous-section 1.1</h3>
      <p>Plus de détails...</p>
    </section>
    <!-- FIN DU CONTENU GÉNÉRÉ -->

    <div>Footer avec call-to-action</div>
  </div>
</article>
```

## Avantages pour le SEO

Le contenu généré automatiquement offre:
1. **Volume de contenu**: 2000-3000 mots par article
2. **Structure sémantique**: Hiérarchie H2-H6 claire
3. **Mots-clés naturels**: Intégrés naturellement dans le texte
4. **Contenu unique**: Généré spécifiquement pour chaque article
5. **Bilingue**: Contenu équivalent en français et anglais
6. **Indexable**: Tout le contenu est dans le HTML SSR, visible par les crawlers

## Maintenance future

Pour ajouter de nouveaux articles:

1. Ajoutez l'article dans `api/blog-data.js` (sans le champ `content`)
2. Lancez le script: `node scripts/generate-blog-content.js`
3. Le script regénérera le contenu pour TOUS les articles (y compris le nouveau)

**Astuce**: Si vous voulez générer seulement pour un article spécifique, modifiez le code pour filtrer par slug.
