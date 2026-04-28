// 17 administrative regions of Quebec
// Each region maps to all the variations stored in the businesses.region column
export const REGIONS: Array<{ slug: string; name: string; variants: string[] }> = [
  { slug: 'bas-saint-laurent', name: 'Bas-Saint-Laurent', variants: ['Bas-Saint-Laurent', '01-bas-saint-laurent'] },
  { slug: 'saguenay-lac-saint-jean', name: 'Saguenay–Lac-Saint-Jean', variants: ['Saguenay–Lac-Saint-Jean', 'Saguenay-Lac-Saint-Jean', '02-saguenay-lac-saint-jean'] },
  { slug: 'capitale-nationale', name: 'Capitale-Nationale', variants: ['Capitale-Nationale', '03-capitale-nationale'] },
  { slug: 'mauricie', name: 'Mauricie', variants: ['Mauricie', '04-mauricie'] },
  { slug: 'estrie', name: 'Estrie', variants: ['Estrie', '05-estrie'] },
  { slug: 'montreal', name: 'Montréal', variants: ['Montréal', '06-montreal'] },
  { slug: 'outaouais', name: 'Outaouais', variants: ['Outaouais', '07-outaouais'] },
  { slug: 'abitibi-temiscamingue', name: 'Abitibi-Témiscamingue', variants: ['Abitibi-Témiscamingue', '08-abitibi-temiscamingue'] },
  { slug: 'cote-nord', name: 'Côte-Nord', variants: ['Côte-Nord', '09-cote-nord'] },
  { slug: 'nord-du-quebec', name: 'Nord-du-Québec', variants: ['Nord-du-Québec', '10-nord-du-quebec'] },
  { slug: 'gaspesie-iles-de-la-madeleine', name: 'Gaspésie–Îles-de-la-Madeleine', variants: ['Gaspésie–Îles-de-la-Madeleine', '11-gaspesie-iles-de-la-madeleine'] },
  { slug: 'chaudiere-appalaches', name: 'Chaudière-Appalaches', variants: ['Chaudière-Appalaches', '12-chaudiere-appalaches'] },
  { slug: 'laval', name: 'Laval', variants: ['Laval', '13-laval'] },
  { slug: 'lanaudiere', name: 'Lanaudière', variants: ['Lanaudière', '14-lanaudiere'] },
  { slug: 'laurentides', name: 'Laurentides', variants: ['Laurentides', '15-laurentides'] },
  { slug: 'monteregie', name: 'Montérégie', variants: ['Montérégie', '16-monteregie'] },
  { slug: 'centre-du-quebec', name: 'Centre-du-Québec', variants: ['Centre-du-Québec', '17-centre-du-quebec'] },
]

export function findRegion(slug: string) {
  return REGIONS.find(r => r.slug === slug)
}
