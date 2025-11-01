/**
 * Script to count API requests made for a single business page
 *
 * This script intercepts Supabase API calls and counts them
 * Run this in Chrome DevTools Console on a business page
 */

// Monkey-patch fetch to count Supabase requests
(function() {
  const originalFetch = window.fetch;
  const supabaseRequests = [];

  window.fetch = function(...args) {
    const url = args[0];

    // Check if it's a Supabase API request
    if (typeof url === 'string' && url.includes('supabase.co')) {
      const timestamp = new Date().toISOString();
      const method = args[1]?.method || 'GET';

      // Extract table name from URL
      let table = 'unknown';
      const tableMatch = url.match(/\/rest\/v1\/([^?]+)/);
      if (tableMatch) {
        table = tableMatch[1];
      }

      supabaseRequests.push({
        timestamp,
        method,
        url,
        table
      });

      console.log(`🔵 Supabase API Request #${supabaseRequests.length}:`, {
        method,
        table,
        url: url.substring(0, 100) + '...'
      });
    }

    return originalFetch.apply(this, args);
  };

  // Add a function to get the count
  window.getSupabaseRequestCount = function() {
    console.log('\n📊 SUPABASE API REQUEST SUMMARY');
    console.log('================================');
    console.log(`Total Requests: ${supabaseRequests.length}`);
    console.log('\nBreakdown by table:');

    const byTable = {};
    supabaseRequests.forEach(req => {
      byTable[req.table] = (byTable[req.table] || 0) + 1;
    });

    Object.entries(byTable).forEach(([table, count]) => {
      console.log(`  - ${table}: ${count} request(s)`);
    });

    console.log('\nDetailed log:');
    supabaseRequests.forEach((req, index) => {
      console.log(`  ${index + 1}. [${req.method}] ${req.table} - ${req.timestamp}`);
    });

    console.log('\n💡 With 10,000 requests/day limit:');
    console.log(`   ${Math.floor(10000 / supabaseRequests.length)} page views per day maximum`);
    console.log(`   ${Math.floor(10000 / supabaseRequests.length / 24)} page views per hour average`);

    return supabaseRequests.length;
  };

  console.log('✅ API Request Counter installed!');
  console.log('📝 Navigate to a business page, then run: getSupabaseRequestCount()');
})();
