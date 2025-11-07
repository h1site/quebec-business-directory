import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function viewRecentBotLogs(limit = 50) {
  console.log(`\n📊 Derniers ${limit} logs de bots\n${'='.repeat(80)}\n`);

  const { data: logs, error } = await supabase
    .from('bot_visit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Erreur:', error.message);
    return;
  }

  logs.forEach((log, i) => {
    const indexableIcon = log.indexable ? '✅' : '❌';
    const statusIcon = log.status_code === 200 ? '✅' : log.status_code === 301 ? '🔀' : '⚠️';

    console.log(`${i + 1}. ${indexableIcon} ${statusIcon} [${log.bot_type.toUpperCase()}] ${log.path}`);
    console.log(`   Status: ${log.status_code} | Type: ${log.page_type || 'N/A'} | Time: ${log.response_time_ms || '?'}ms`);

    if (!log.indexable) {
      console.log(`   ⚠️  Raison: ${log.indexable_reason}`);
    }

    if (log.redirect_to) {
      console.log(`   🔀 Redirigé vers: ${log.redirect_to} (${log.redirect_reason})`);
    }

    console.log(`   🕐 ${new Date(log.created_at).toLocaleString('fr-CA')}\n`);
  });
}

async function viewBotStats() {
  console.log(`\n📈 Statistiques des bots\n${'='.repeat(80)}\n`);

  // Stats by bot type and indexability
  const { data: stats, error } = await supabase
    .from('bot_visit_logs')
    .select('bot_type, indexable, indexable_reason');

  if (error) {
    console.error('Erreur:', error.message);
    return;
  }

  // Group stats
  const grouped = stats.reduce((acc, log) => {
    const key = `${log.bot_type}-${log.indexable}-${log.indexable_reason || 'none'}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  // Display stats
  Object.entries(grouped)
    .sort((a, b) => b[1] - a[1])
    .forEach(([key, count]) => {
      const [botType, indexable, reason] = key.split('-');
      const indexableIcon = indexable === 'true' ? '✅' : '❌';
      const reasonText = reason !== 'none' ? ` (${reason})` : '';
      console.log(`${indexableIcon} ${botType.toUpperCase()}: ${count} visites${reasonText}`);
    });

  console.log(`\nTotal: ${stats.length} visites enregistrées\n`);
}

async function viewRedirectStats() {
  console.log(`\n🔀 Statistiques des redirections 301\n${'='.repeat(80)}\n`);

  const { data: redirects, error } = await supabase
    .from('bot_visit_logs')
    .select('redirect_reason, business_slug, path')
    .eq('status_code', 301);

  if (error) {
    console.error('Erreur:', error.message);
    return;
  }

  // Group by redirect reason
  const grouped = redirects.reduce((acc, log) => {
    const reason = log.redirect_reason || 'unknown';
    if (!acc[reason]) {
      acc[reason] = { count: 0, businesses: new Set() };
    }
    acc[reason].count++;
    if (log.business_slug) {
      acc[reason].businesses.add(log.business_slug);
    }
    return acc;
  }, {});

  Object.entries(grouped)
    .sort((a, b) => b[1].count - a[1].count)
    .forEach(([reason, data]) => {
      console.log(`🔀 ${reason}: ${data.count} redirections (${data.businesses.size} entreprises uniques)`);
    });

  console.log(`\nTotal: ${redirects.length} redirections 301\n`);
}

async function view404Errors() {
  console.log(`\n❌ Erreurs 404\n${'='.repeat(80)}\n`);

  const { data: errors, error } = await supabase
    .from('bot_visit_logs')
    .select('path, bot_type, created_at')
    .eq('status_code', 404)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Erreur:', error.message);
    return;
  }

  // Group by path
  const grouped = errors.reduce((acc, log) => {
    if (!acc[log.path]) {
      acc[log.path] = { count: 0, bots: new Set(), lastSeen: log.created_at };
    }
    acc[log.path].count++;
    acc[log.path].bots.add(log.bot_type);
    return acc;
  }, {});

  Object.entries(grouped)
    .sort((a, b) => b[1].count - a[1].count)
    .forEach(([path, data]) => {
      console.log(`❌ ${path}`);
      console.log(`   ${data.count} erreurs | Bots: ${Array.from(data.bots).join(', ')}`);
      console.log(`   Dernière vue: ${new Date(data.lastSeen).toLocaleString('fr-CA')}\n`);
    });

  console.log(`Total: ${errors.length} erreurs 404 enregistrées\n`);
}

async function viewResponseTimes() {
  console.log(`\n⏱️  Temps de réponse moyens\n${'='.repeat(80)}\n`);

  const { data: logs, error } = await supabase
    .from('bot_visit_logs')
    .select('page_type, bot_type, response_time_ms')
    .not('response_time_ms', 'is', null);

  if (error) {
    console.error('Erreur:', error.message);
    return;
  }

  // Group by page type and bot type
  const grouped = logs.reduce((acc, log) => {
    const key = `${log.page_type || 'unknown'}-${log.bot_type}`;
    if (!acc[key]) {
      acc[key] = { times: [], pageType: log.page_type, botType: log.bot_type };
    }
    acc[key].times.push(log.response_time_ms);
    return acc;
  }, {});

  Object.values(grouped)
    .map(group => ({
      ...group,
      avg: Math.round(group.times.reduce((a, b) => a + b, 0) / group.times.length),
      min: Math.min(...group.times),
      max: Math.max(...group.times)
    }))
    .sort((a, b) => b.avg - a.avg)
    .forEach(({ pageType, botType, avg, min, max, times }) => {
      console.log(`${pageType || 'unknown'} (${botType.toUpperCase()})`);
      console.log(`   Moyenne: ${avg}ms | Min: ${min}ms | Max: ${max}ms | Requêtes: ${times.length}\n`);
    });
}

// Main menu
const args = process.argv.slice(2);
const command = args[0] || 'recent';

switch (command) {
  case 'recent':
    await viewRecentBotLogs(parseInt(args[1]) || 50);
    break;
  case 'stats':
    await viewBotStats();
    break;
  case 'redirects':
    await viewRedirectStats();
    break;
  case '404':
    await view404Errors();
    break;
  case 'response-times':
    await viewResponseTimes();
    break;
  case 'all':
    await viewRecentBotLogs(20);
    await viewBotStats();
    await viewRedirectStats();
    await view404Errors();
    await viewResponseTimes();
    break;
  default:
    console.log(`
Usage: node scripts/view-bot-logs.js [command] [options]

Commands:
  recent [limit]   Afficher les derniers logs (défaut: 50)
  stats            Afficher les statistiques globales
  redirects        Afficher les statistiques de redirections 301
  404              Afficher les erreurs 404
  response-times   Afficher les temps de réponse moyens
  all              Afficher toutes les statistiques

Exemples:
  node scripts/view-bot-logs.js recent 100
  node scripts/view-bot-logs.js stats
  node scripts/view-bot-logs.js all
    `);
}

process.exit(0);
