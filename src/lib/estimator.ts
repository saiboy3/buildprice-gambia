// Construction estimation logic for Gambian building standards

export type EstimatorInputs = {
  projectName: string
  location:    string

  // Walls
  buildingLength: number  // metres
  buildingWidth:  number  // metres
  wallHeight:     number  // metres per floor (default 2.7)
  numFloors:      number  // default 1
  numDoors:       number  // default 2
  numWindows:     number  // default 4

  // Roof
  includeRoof:  boolean
  roofPitch:    number   // degrees (default 20)
  roofOverhang: number   // metres each side (default 0.5)
  sheetLength:  number   // feet: 6 | 8 | 10

  // Foundation (strip concrete)
  includeFoundation:  boolean
  foundationWidth:    number  // metres (default 0.45)
  foundationDepth:    number  // metres (default 0.6)

  // Plastering (both sides of all walls)
  includePlastering: boolean
}

export type LineItem = {
  id:          string
  category:    string
  description: string
  quantity:    number
  unit:        string
  unitPrice:   number | null
  total:       number | null
  note?:       string
}

export type PriceMap = {
  cement:  number | null   // per bag (50 kg)
  sand:    number | null   // per m³
  gravel:  number | null   // per m³
  zinc:    number | null   // per sheet
  timber:  number | null   // per piece (12 ft)
  rebar:   number | null   // per tonne
  blocks:  number | null   // per block
}

// ─── helpers ────────────────────────────────────────────────────────────────

function ceil2(n: number) { return Math.ceil(n * 100) / 100 }

function item(
  id: string, category: string, description: string,
  quantity: number, unit: string,
  unitPrice: number | null, note?: string
): LineItem {
  const qty = Math.ceil(quantity)
  return {
    id, category, description,
    quantity: qty, unit,
    unitPrice,
    total: unitPrice !== null ? ceil2(qty * unitPrice) : null,
    note,
  }
}

// ─── main calculation ────────────────────────────────────────────────────────

export function calculate(inputs: EstimatorInputs, prices: PriceMap): LineItem[] {
  const items: LineItem[] = []

  // ── Walls ──────────────────────────────────────────────────────────────────
  const BLOCK_W    = 0.45   // m (face width)
  const BLOCK_H    = 0.225  // m (face height)
  const DOOR_W     = 0.9    // m
  const DOOR_H     = 2.1    // m
  const WIN_W      = 1.2    // m
  const WIN_H      = 1.2    // m

  const perimeter      = 2 * (inputs.buildingLength + inputs.buildingWidth)
  const grossWallArea  = perimeter * inputs.wallHeight * inputs.numFloors
  const openingsArea   = inputs.numDoors * DOOR_W * DOOR_H + inputs.numWindows * WIN_W * WIN_H
  const netWallArea    = Math.max(0, grossWallArea - openingsArea)

  // Blocks (6-inch hollow concrete block, 450 × 225 mm face, 10% wastage)
  const blocks = (netWallArea / (BLOCK_W * BLOCK_H)) * 1.1
  items.push(item('blocks', 'Masonry', 'Concrete Blocks 6 inch', blocks, 'blocks',
    prices.blocks, 'Includes 10% wastage'))

  // Cement for mortar (1 bag per 50 blocks, 1:6 mix)
  const cementMasonry = blocks / 50
  items.push(item('cement-mortar', 'Masonry', 'OPC Cement – mortar', cementMasonry, 'bags (50 kg)',
    prices.cement))

  // Sand for mortar (1 truck ≈ 5 m³, 1 truck per 500 blocks)
  const sandMasonryTrucks = blocks / 500
  items.push(item('sand-mortar', 'Masonry', 'Sharp Sand – mortar', sandMasonryTrucks, 'trucks (5 m³)',
    prices.sand !== null ? prices.sand * 5 : null,
    'Approx 1 truck per 500 blocks'))

  // ── Plastering ─────────────────────────────────────────────────────────────
  if (inputs.includePlastering) {
    // Both faces of all walls, 15 mm thick, 1:4 cement:sand mix
    const plasterVolume = netWallArea * 2 * 0.015
    const cementPlaster = plasterVolume * 8   // ~8 bags/m³ for 1:4 mix
    const sandPlasterM3 = plasterVolume * 0.8

    items.push(item('cement-plaster', 'Plastering', 'OPC Cement – plaster', cementPlaster, 'bags (50 kg)',
      prices.cement, '1:4 mix, 15 mm both sides'))
    items.push(item('sand-plaster', 'Plastering', 'Sharp Sand – plaster',
      sandPlasterM3 / 5, 'trucks (5 m³)',
      prices.sand !== null ? prices.sand * 5 : null))
  }

  // ── Foundation ─────────────────────────────────────────────────────────────
  if (inputs.includeFoundation) {
    // Strip foundation, 1:2:4 concrete mix
    const foundVolume = perimeter * inputs.foundationWidth * inputs.foundationDepth

    // Cement: 7 bags/m³
    items.push(item('cement-found', 'Foundation', 'OPC Cement – concrete',
      foundVolume * 7, 'bags (50 kg)', prices.cement, '1:2:4 mix'))

    // Sand: 0.5 m³/m³ concrete
    items.push(item('sand-found', 'Foundation', 'Sharp Sand – concrete',
      (foundVolume * 0.5) / 5, 'trucks (5 m³)',
      prices.sand !== null ? prices.sand * 5 : null))

    // Gravel: 1 m³/m³ concrete
    items.push(item('gravel-found', 'Foundation', 'Gravel / Chippings – concrete',
      (foundVolume * 1.0) / 5, 'trucks (5 m³)',
      prices.gravel !== null ? prices.gravel * 5 : null))

    // Rebar 12 mm: 4 bars around perimeter, 12 m rod lengths, 10% laps
    const rebarTonnes = (perimeter * 4 * 1.1 * 0.888) / 1000  // 0.888 kg/m for 12mm
    items.push(item('rebar-found', 'Foundation', 'Rebar 12 mm – footing',
      rebarTonnes, 'tonnes', prices.rebar, '4-bar stirrup layout'))
  }

  // ── Roofing ────────────────────────────────────────────────────────────────
  if (inputs.includeRoof) {
    const pitchRad     = (inputs.roofPitch * Math.PI) / 180
    const halfSpan     = inputs.buildingWidth / 2
    const rafterLength = (halfSpan / Math.cos(pitchRad)) + inputs.roofOverhang

    // Zinc corrugated sheets (0.762 m wide, 0.686 m effective coverage)
    const EFFECTIVE_WIDTH = 0.686
    const sheetLengthM    = inputs.sheetLength * 0.3048  // ft → m
    const sheetsAlong     = Math.ceil(rafterLength / sheetLengthM)
    const sheetsAcross    = Math.ceil(inputs.buildingLength / EFFECTIVE_WIDTH)
    const sheets          = sheetsAlong * sheetsAcross * 2 * 1.05  // both sides + 5% wastage

    items.push(item('zinc-sheets', 'Roofing',
      `Corrugated Zinc Sheet (${inputs.sheetLength} ft)`, sheets, 'sheets',
      prices.zinc, 'Both sides + 5% wastage'))

    // Timber for roof structure (rafters @ 600 mm, purlins @ 900 mm)
    const numRafterPairs    = Math.ceil(inputs.buildingLength / 0.6) + 1
    const totalRafterLength = numRafterPairs * 2 * rafterLength
    const ridgeLength       = inputs.buildingLength
    const numPurlinsPerSide = Math.ceil(rafterLength / 0.9) + 1
    const totalPurlinLength = numPurlinsPerSide * 2 * inputs.buildingLength
    const totalTimber       = totalRafterLength + ridgeLength + totalPurlinLength
    const PIECE_M           = 3.66  // 12 ft in metres
    const timberPieces      = totalTimber / PIECE_M

    items.push(item('timber-roof', 'Roofing', 'Timber 2×4 inch – roof structure',
      timberPieces, 'pieces (12 ft)', prices.timber,
      'Rafters @ 600 mm, purlins @ 900 mm'))
  }

  return items
}

// ─── extract a PriceMap from the /api/prices response ───────────────────────

type ApiPrice = {
  price: number
  unit:  string
  material: { name: string }
}

export function buildPriceMap(apiPrices: ApiPrice[]): PriceMap {
  const lowest = (keyword: string, unitHint?: string): number | null => {
    const matches = apiPrices.filter(p =>
      p.material.name.toLowerCase().includes(keyword.toLowerCase()) &&
      (unitHint ? p.unit.toLowerCase().includes(unitHint.toLowerCase()) : true)
    )
    if (!matches.length) return null
    return Math.min(...matches.map(p => p.price))
  }

  return {
    cement: lowest('cement opc') ?? lowest('cement'),
    sand:   lowest('sharp sand'),
    gravel: lowest('gravel'),
    zinc:   lowest('zinc'),
    timber: lowest('timber 2'),
    rebar:  lowest('rebar 12'),
    blocks: lowest('concrete blocks'),
  }
}

export const DEFAULT_INPUTS: EstimatorInputs = {
  projectName: '',
  location:    '',
  buildingLength:     10,
  buildingWidth:       8,
  wallHeight:          2.7,
  numFloors:           1,
  numDoors:            2,
  numWindows:          4,
  includeRoof:         true,
  roofPitch:           20,
  roofOverhang:        0.5,
  sheetLength:         8,
  includeFoundation:   true,
  foundationWidth:     0.45,
  foundationDepth:     0.6,
  includePlastering:   true,
}
