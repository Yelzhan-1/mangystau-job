export interface DistrictCoord {
  lat: number
  lng: number
  label: string
}

// Approximate coordinates for Aktau districts (centered around Aktau city)
export const districtCoordinates: Record<string, DistrictCoord> = {
  'Микрорайон 1':  { lat: 43.6531, lng: 51.1588, label: 'Микрорайон 1' },
  'Микрорайон 2':  { lat: 43.6498, lng: 51.1602, label: 'Микрорайон 2' },
  'Микрорайон 3':  { lat: 43.6471, lng: 51.1623, label: 'Микрорайон 3' },
  'Микрорайон 4':  { lat: 43.6445, lng: 51.1598, label: 'Микрорайон 4' },
  'Микрорайон 5':  { lat: 43.6412, lng: 51.1571, label: 'Микрорайон 5' },
  'Микрорайон 6':  { lat: 43.6384, lng: 51.1552, label: 'Микрорайон 6' },
  'Микрорайон 7':  { lat: 43.6356, lng: 51.1538, label: 'Микрорайон 7' },
  'Микрорайон 8':  { lat: 43.6328, lng: 51.1521, label: 'Микрорайон 8' },
  'Микрорайон 9':  { lat: 43.6302, lng: 51.1505, label: 'Микрорайон 9' },
  'Микрорайон 10': { lat: 43.6278, lng: 51.1488, label: 'Микрорайон 10' },
  'Микрорайон 11': { lat: 43.6251, lng: 51.1471, label: 'Микрорайон 11' },
  'Микрорайон 12': { lat: 43.6224, lng: 51.1454, label: 'Микрорайон 12' },
  'Микрорайон 14': { lat: 43.6198, lng: 51.1430, label: 'Микрорайон 14' },
  'Микрорайон 15': { lat: 43.6171, lng: 51.1416, label: 'Микрорайон 15' },
  'Микрорайон 16': { lat: 43.6145, lng: 51.1400, label: 'Микрорайон 16' },
  'Микрорайон 17': { lat: 43.6118, lng: 51.1385, label: 'Микрорайон 17' },
  'Микрорайон 27': { lat: 43.6088, lng: 51.1365, label: 'Микрорайон 27' },
  'Микрорайон 28': { lat: 43.6062, lng: 51.1348, label: 'Микрорайон 28' },
  'Промзона':      { lat: 43.6592, lng: 51.1720, label: 'Промзона' },
  'Центр':         { lat: 43.6503, lng: 51.1755, label: 'Центр' },
  'Порт':          { lat: 43.6445, lng: 51.1812, label: 'Порт' },
  'Актау':         { lat: 43.6503, lng: 51.1681, label: 'г. Актау' },
}

// Default fallback to city center
const AKTAU_CENTER: DistrictCoord = { lat: 43.6503, lng: 51.1681, label: 'Актау' }

export function getCoordinatesForDistrict(district: string | null | undefined): DistrictCoord {
  if (!district) return AKTAU_CENTER
  const exact = districtCoordinates[district]
  if (exact) return exact

  // Fuzzy match: if the string contains a known key
  for (const key of Object.keys(districtCoordinates)) {
    if (district.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(district.toLowerCase())) {
      return districtCoordinates[key]
    }
  }
  return AKTAU_CENTER
}

// Marker color by sector
export function getMarkerColorBySector(sector: string): string {
  const s = sector.toLowerCase()
  if (s.includes('питание') || s.includes('кафе') || s.includes('ресторан')) return '#F59E0B'
  if (s.includes('логистик') || s.includes('доставк') || s.includes('транспорт')) return '#0EA5E9'
  if (s.includes('торговл') || s.includes('розничн') || s.includes('магазин')) return '#8B5CF6'
  if (s.includes('строительств')) return '#64748B'
  if (s.includes('it') || s.includes('технолог')) return '#10B981'
  if (s.includes('медицин') || s.includes('здоров')) return '#EF4444'
  if (s.includes('образован')) return '#6366F1'
  return '#2563EB'
}

export const AKTAU_MAP_CENTER: [number, number] = [43.6400, 51.1580]
export const AKTAU_MAP_ZOOM = 13
