import { Link } from 'react-router-dom';
import './AdminTools.css';

export default function AdminTools() {
  return (
    <div className="admin-tools">
      <div className="admin-header">
        <Link to="/admin" className="back-link">← Retour au dashboard</Link>
        <h1>🛠️ Outils d'administration</h1>
        <p>Scripts et outils pour gérer les données</p>
      </div>

      <div className="tools-grid">
        {/* Import REQ */}
        <div className="tool-card">
          <div className="tool-icon">📥</div>
          <h3>Importer des entreprises (REQ)</h3>
          <p>Importer des entreprises depuis le Registre des Entreprises du Québec</p>

          <div className="tool-commands">
            <h4>Commandes à exécuter dans le terminal:</h4>

            <div className="command-block">
              <strong>Test (10 entreprises):</strong>
              <code>node scripts/import-req-businesses.js --limit=10 --dry-run</code>
            </div>

            <div className="command-block">
              <strong>Import réel (100 entreprises):</strong>
              <code>node scripts/import-req-businesses.js --limit=100</code>
            </div>

            <div className="command-block">
              <strong>Import massif (1000 entreprises):</strong>
              <code>node scripts/import-req-businesses.js --limit=1000</code>
            </div>
          </div>

          <div className="tool-info">
            <strong>ℹ️ Informations:</strong>
            <ul>
              <li>Filtre automatique les entreprises "9000-XXXX QUÉBEC INC."</li>
              <li>Génère des slugs SEO-friendly avec ville</li>
              <li>Mappe automatiquement région/MRC/ville</li>
            </ul>
          </div>
        </div>

        {/* Enrichissement Google */}
        <div className="tool-card">
          <div className="tool-icon">🌐</div>
          <h3>Enrichir avec Google Places</h3>
          <p>Ajouter téléphone, site web, notes, horaires via Google Places API</p>

          <div className="tool-commands">
            <h4>Commandes:</h4>

            <div className="command-block">
              <strong>Test (5 entreprises):</strong>
              <code>node scripts/enrich-req-data.js --limit=5 --dry-run</code>
            </div>

            <div className="command-block">
              <strong>Enrichissement (50 entreprises):</strong>
              <code>node scripts/enrich-req-data.js --limit=50</code>
            </div>

            <div className="command-block">
              <strong>Batch quotidien (100 entreprises):</strong>
              <code>node scripts/enrich-req-data.js --limit=100</code>
            </div>
          </div>

          <div className="tool-info">
            <strong>ℹ️ Informations:</strong>
            <ul>
              <li>✅ 100% gratuit (sous 28,000 requêtes/mois)</li>
              <li>Récupère: téléphone, site web, notes Google, coordonnées GPS</li>
              <li>Ajoute les types Google (catégories précises)</li>
            </ul>
          </div>
        </div>

        {/* Assignation catégories */}
        <div className="tool-card">
          <div className="tool-icon">🏷️</div>
          <h3>Assigner catégories SCIAN</h3>
          <p>Assigner automatiquement les catégories basées sur codes SCIAN</p>

          <div className="tool-commands">
            <h4>Commandes:</h4>

            <div className="command-block">
              <strong>Test:</strong>
              <code>node scripts/assign-categories-from-scian.js --limit=30 --dry-run</code>
            </div>

            <div className="command-block">
              <strong>Assignation (100 entreprises):</strong>
              <code>node scripts/assign-categories-from-scian.js --limit=100</code>
            </div>
          </div>

          <div className="tool-info">
            <strong>⚠️ Note:</strong>
            <ul>
              <li>Les catégories Google (via enrichissement) sont plus précises</li>
              <li>Utiliser seulement si pas d'enrichissement Google</li>
              <li>Taux de succès: ~60%</li>
            </ul>
          </div>
        </div>

        {/* Validation */}
        <div className="tool-card">
          <div className="tool-icon">🔍</div>
          <h3>Valider les données</h3>
          <p>Vérifier la qualité des données importées</p>

          <div className="tool-commands">
            <h4>Commandes:</h4>

            <div className="command-block">
              <strong>Valider toutes les entreprises REQ:</strong>
              <code>node scripts/validate-req-data.js --limit=1000</code>
            </div>
          </div>

          <div className="tool-info">
            <strong>ℹ️ Vérifie:</strong>
            <ul>
              <li>Format NEQ (10 chiffres)</li>
              <li>Codes postaux québécois valides</li>
              <li>Adresses complètes</li>
              <li>Villes mappées aux régions/MRC</li>
            </ul>
          </div>
        </div>

        {/* Nettoyage */}
        <div className="tool-card danger">
          <div className="tool-icon">🧹</div>
          <h3>Nettoyer les données</h3>
          <p>Supprimer des entreprises importées (DANGER)</p>

          <div className="tool-commands">
            <h4>Commandes:</h4>

            <div className="command-block">
              <strong>Supprimer toutes les entreprises REQ:</strong>
              <code>node scripts/clean-req-businesses.js</code>
            </div>

            <div className="command-block">
              <strong>Supprimer entreprises "9000-XXXX":</strong>
              <code>node scripts/clean-9000-businesses.js</code>
            </div>
          </div>

          <div className="tool-info danger">
            <strong>⚠️ DANGER:</strong>
            <ul>
              <li>Ces commandes suppriment définitivement les données</li>
              <li>Utilisez avec précaution</li>
            </ul>
          </div>
        </div>

        {/* Vérification slugs */}
        <div className="tool-card">
          <div className="tool-icon">🔗</div>
          <h3>Vérifier les slugs</h3>
          <p>Lister toutes les entreprises et vérifier les slugs</p>

          <div className="tool-commands">
            <h4>Commandes:</h4>

            <div className="command-block">
              <strong>Afficher toutes les entreprises:</strong>
              <code>node scripts/check-slugs.js</code>
            </div>
          </div>
        </div>
      </div>

      <div className="quick-workflow">
        <h2>🚀 Workflow recommandé</h2>
        <ol>
          <li>
            <strong>Importer</strong> les entreprises REQ
            <code>node scripts/import-req-businesses.js --limit=100</code>
          </li>
          <li>
            <strong>Enrichir</strong> avec Google Places (données précises)
            <code>node scripts/enrich-req-data.js --limit=100</code>
          </li>
          <li>
            <strong>Valider</strong> la qualité des données
            <code>node scripts/validate-req-data.js --limit=100</code>
          </li>
          <li>
            <strong>Vérifier</strong> les résultats dans le dashboard admin
          </li>
        </ol>
      </div>
    </div>
  );
}
