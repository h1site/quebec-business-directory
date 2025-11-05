/**
 * Script pour analyser le trafic Vercel et identifier la source des requêtes
 *
 * Ce script aide à comprendre pourquoi il y a beaucoup de requêtes dans Vercel
 * mais peu dans Google Analytics (bots vs vraies visites)
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function analyzeVercelLogs() {
  console.log('=== Analyse du trafic Vercel ===\n');

  try {
    // Check if vercel CLI is installed
    try {
      await execAsync('vercel --version');
    } catch (error) {
      console.error('❌ Vercel CLI n\'est pas installé.');
      console.log('\nPour installer:');
      console.log('  npm install -g vercel');
      console.log('\nPuis connectez-vous:');
      console.log('  vercel login\n');
      return;
    }

    console.log('📊 Récupération des logs Vercel (dernières 100 requêtes)...\n');

    // Get recent logs (requires vercel CLI to be logged in)
    const { stdout } = await execAsync('vercel logs --limit 100 --output json', {
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer
    });

    const logs = stdout.trim().split('\n')
      .filter(line => line.trim())
      .map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(log => log !== null);

    if (logs.length === 0) {
      console.log('Aucun log trouvé. Vérifiez que vous êtes connecté avec `vercel login`\n');
      return;
    }

    // Analyze logs
    const analysis = {
      total: logs.length,
      byUserAgent: {},
      byPath: {},
      byStatus: {},
      byMethod: {},
      bots: [],
      realUsers: [],
      unknown: []
    };

    // Common bot patterns
    const botPatterns = [
      /googlebot/i,
      /bingbot/i,
      /slurp/i, // Yahoo
      /duckduckbot/i,
      /baiduspider/i,
      /yandexbot/i,
      /facebookexternalhit/i,
      /twitterbot/i,
      /linkedinbot/i,
      /whatsapp/i,
      /telegrambot/i,
      /slackbot/i,
      /discordbot/i,
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /python/i,
      /go-http/i,
      /lighthouse/i,
      /pingdom/i,
      /uptimerobot/i
    ];

    logs.forEach(log => {
      const userAgent = log.headers?.['user-agent'] || 'Unknown';
      const path = log.path || 'Unknown';
      const status = log.status || 'Unknown';
      const method = log.method || 'GET';

      // Count by user agent
      analysis.byUserAgent[userAgent] = (analysis.byUserAgent[userAgent] || 0) + 1;

      // Count by path
      analysis.byPath[path] = (analysis.byPath[path] || 0) + 1;

      // Count by status
      analysis.byStatus[status] = (analysis.byStatus[status] || 0) + 1;

      // Count by method
      analysis.byMethod[method] = (analysis.byMethod[method] || 0) + 1;

      // Classify as bot or real user
      const isBot = botPatterns.some(pattern => pattern.test(userAgent));

      if (isBot) {
        analysis.bots.push({ userAgent, path, status, method, timestamp: log.timestamp });
      } else if (userAgent === 'Unknown' || userAgent.length < 10) {
        analysis.unknown.push({ userAgent, path, status, method, timestamp: log.timestamp });
      } else {
        analysis.realUsers.push({ userAgent, path, status, method, timestamp: log.timestamp });
      }
    });

    // Display results
    console.log('📈 STATISTIQUES GÉNÉRALES\n');
    console.log(`Total de requêtes analysées: ${analysis.total}`);
    console.log(`  • Bots/Crawlers détectés: ${analysis.bots.length} (${Math.round(analysis.bots.length / analysis.total * 100)}%)`);
    console.log(`  • Vraies visites utilisateurs: ${analysis.realUsers.length} (${Math.round(analysis.realUsers.length / analysis.total * 100)}%)`);
    console.log(`  • Requêtes inconnues: ${analysis.unknown.length} (${Math.round(analysis.unknown.length / analysis.total * 100)}%)`);

    console.log('\n\n🤖 TOP 10 BOTS/CRAWLERS\n');
    const botUserAgents = {};
    analysis.bots.forEach(bot => {
      botUserAgents[bot.userAgent] = (botUserAgents[bot.userAgent] || 0) + 1;
    });
    Object.entries(botUserAgents)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([ua, count]) => {
        console.log(`  ${count}x - ${ua.substring(0, 80)}${ua.length > 80 ? '...' : ''}`);
      });

    console.log('\n\n👥 TOP 10 USER AGENTS (Vraies Visites)\n');
    const realUserAgents = {};
    analysis.realUsers.forEach(user => {
      realUserAgents[user.userAgent] = (realUserAgents[user.userAgent] || 0) + 1;
    });
    Object.entries(realUserAgents)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([ua, count]) => {
        console.log(`  ${count}x - ${ua.substring(0, 80)}${ua.length > 80 ? '...' : ''}`);
      });

    console.log('\n\n📍 TOP 10 PAGES LES PLUS VISITÉES\n');
    Object.entries(analysis.byPath)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([path, count]) => {
        console.log(`  ${count}x - ${path}`);
      });

    console.log('\n\n📊 CODES DE STATUT HTTP\n');
    Object.entries(analysis.byStatus)
      .sort((a, b) => b[1] - a[1])
      .forEach(([status, count]) => {
        const emoji = status === '200' || status === '304' ? '✓' : '⚠';
        console.log(`  ${emoji} ${status}: ${count} requêtes (${Math.round(count / analysis.total * 100)}%)`);
      });

    console.log('\n\n🔍 MÉTHODES HTTP\n');
    Object.entries(analysis.byMethod)
      .sort((a, b) => b[1] - a[1])
      .forEach(([method, count]) => {
        console.log(`  ${method}: ${count} requêtes (${Math.round(count / analysis.total * 100)}%)`);
      });

    console.log('\n\n💡 DIAGNOSTIC\n');

    const botPercentage = Math.round(analysis.bots.length / analysis.total * 100);

    if (botPercentage > 50) {
      console.log('❗ Plus de 50% de vos requêtes proviennent de bots/crawlers.');
      console.log('   C\'est NORMAL - les bots ne déclenchent pas Google Analytics.');
      console.log('   Vos "vraies" visites sont dans Google Analytics.\n');
    } else if (botPercentage > 30) {
      console.log('✓ Environ ' + botPercentage + '% de vos requêtes sont des bots.');
      console.log('   C\'est normal pour un site avec du SEO.\n');
    } else {
      console.log('✓ La majorité de vos requêtes sont de vraies visites utilisateurs.\n');
    }

    console.log('📌 RAPPEL:');
    console.log('  • Vercel logs = TOUT le trafic (bots + utilisateurs)');
    console.log('  • Google Analytics = SEULEMENT les vraies visites (JavaScript chargé)');
    console.log('  • Les bots (Googlebot, etc.) N\'apparaissent PAS dans Google Analytics\n');

    console.log('\n=== Analyse terminée ===\n');

  } catch (error) {
    console.error('❌ Erreur:', error.message);

    if (error.message.includes('not found') || error.message.includes('command not found')) {
      console.log('\n💡 Vercel CLI n\'est pas installé ou pas dans le PATH.');
      console.log('   Installation: npm install -g vercel');
    } else if (error.message.includes('Not Authorized')) {
      console.log('\n💡 Vous devez vous connecter à Vercel:');
      console.log('   Commande: vercel login');
    }
  }
}

// Alternative: Analyse manuelle via dashboard Vercel
function showManualInstructions() {
  console.log('\n📖 ALTERNATIVE: Analyse manuelle via le dashboard Vercel\n');
  console.log('1. Allez sur https://vercel.com');
  console.log('2. Sélectionnez votre projet "quebec-business-directory"');
  console.log('3. Cliquez sur "Analytics" dans le menu latéral');
  console.log('4. Regardez les sections:');
  console.log('   • Top Paths - Pages les plus visitées');
  console.log('   • Top Referrers - D\'où viennent les visiteurs');
  console.log('   • Devices - Desktop vs Mobile');
  console.log('   • Locations - Pays/Régions des visiteurs\n');
  console.log('5. Pour voir les User-Agents:');
  console.log('   • Allez dans "Logs" (menu latéral)');
  console.log('   • Cliquez sur une requête pour voir les détails');
  console.log('   • Regardez le champ "User-Agent" dans les headers\n');
  console.log('🔍 Les User-Agents de bots typiques:');
  console.log('   • Googlebot/2.1 - Google');
  console.log('   • bingbot/2.0 - Microsoft Bing');
  console.log('   • Slurp - Yahoo');
  console.log('   • DuckDuckBot - DuckDuckGo');
  console.log('   • Contient "bot", "crawler", "spider" - Autres bots\n');
}

// Run analysis
analyzeVercelLogs().catch(error => {
  console.error('Erreur:', error.message);
  showManualInstructions();
});
