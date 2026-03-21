export const SANTA_ROSA_BARANGAYS = [
  'Aplaya',
  'Balibago',
  'Caingin',
  'Dila',
  'Dita',
  'Don Jose',
  'Ibaba',
  'Kanluran (Poblacion Uno)',
  'Labas',
  'Macabling',
  'Malitlit',
  'Malusak (Poblacion Dos)',
  'Market Area (Poblacion Tres)',
  'Pulong Santa Cruz',
  'Santo Domingo',
  'Santo Tomas (Kalinungan)',
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
  { name: 'Kanluran (Poblacion Uno)', x: 51, y: 56 },
  { name: 'Labas', x: 57, y: 88 },
  { name: 'Macabling', x: 30, y: 58 },
  { name: 'Malitlit', x: 24, y: 35 },
  { name: 'Malusak (Poblacion Dos)', x: 49, y: 52 },
  { name: 'Market Area (Poblacion Tres)', x: 52, y: 60 },
  { name: 'Pulong Santa Cruz', x: 39, y: 76 },
  { name: 'Santo Domingo', x: 68, y: 58 },
  { name: 'Santo Tomas (Kalinungan)', x: 69, y: 38 },
  { name: 'Sinalhan', x: 76, y: 74 },
  { name: 'Tagapo', x: 54, y: 27 },
]
