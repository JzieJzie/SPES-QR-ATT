export const SANTA_ROSA_BARANGAYS = [
  'Aplaya',
  'Balibago',
  'Caingin',
  'Dila',
  'Dita',
  'Don Jose',
  'Ibaba',
  'Labas',
  'Macabling',
  'Malitlit',
  'Malusak (Pob.)',
  'Market Area (Pob.)',
  'Kanluran (Pob.)',
  'Pook',
  'Pulong Santa Cruz',
  'Santo Domingo',
  'Sinalhan',
  'Tagapo',
] as const

type BarangayPin = {
  name: (typeof SANTA_ROSA_BARANGAYS)[number]
  x: number
  y: number
}

export const BARANGAY_PINS: readonly BarangayPin[] = [
  { name: 'Aplaya', x: 56, y: 82 },
  { name: 'Balibago', x: 36, y: 41 },
  { name: 'Caingin', x: 44, y: 69 },
  { name: 'Dila', x: 62, y: 64 },
  { name: 'Dita', x: 62, y: 47 },
  { name: 'Don Jose', x: 46, y: 33 },
  { name: 'Ibaba', x: 60, y: 72 },
  { name: 'Labas', x: 57, y: 88 },
  { name: 'Macabling', x: 30, y: 58 },
  { name: 'Malitlit', x: 24, y: 35 },
  { name: 'Malusak (Pob.)', x: 49, y: 52 },
  { name: 'Market Area (Pob.)', x: 52, y: 60 },
  { name: 'Kanluran (Pob.)', x: 51, y: 56 },
  { name: 'Pook', x: 58, y: 44 },
  { name: 'Pulong Santa Cruz', x: 39, y: 76 },
  { name: 'Santo Domingo', x: 68, y: 58 },
  { name: 'Sinalhan', x: 76, y: 74 },
  { name: 'Tagapo', x: 54, y: 27 },
]
