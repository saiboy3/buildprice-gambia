// Consistent color + initials utilities used across cards

const PALETTE = [
  'bg-rose-500',    'bg-pink-500',  'bg-fuchsia-500', 'bg-purple-500',
  'bg-violet-500',  'bg-indigo-500','bg-blue-500',     'bg-sky-500',
  'bg-cyan-500',    'bg-teal-500',  'bg-emerald-500',  'bg-green-500',
  'bg-lime-600',    'bg-yellow-500','bg-amber-500',     'bg-orange-500',
]

/** Return a stable Tailwind bg color class for any string */
export function avatarColor(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return PALETTE[Math.abs(hash) % PALETTE.length]
}

/** Up to 2-letter initials from a name */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

// ── Material category metadata ───────────────────────────────────────────────

export type CategoryMeta = {
  label:   string
  color:   string        // Tailwind bg
  text:    string        // Tailwind text
  border:  string        // Tailwind border
  emoji:   string
  query:   string        // search keyword
}

export const CATEGORY_META: CategoryMeta[] = [
  { label: 'Cement & Concrete', color: 'bg-slate-100',   text: 'text-slate-700',  border: 'border-slate-200',  emoji: '🧱', query: 'cement' },
  { label: 'Steel & Metal',     color: 'bg-gray-100',    text: 'text-gray-700',   border: 'border-gray-200',   emoji: '⚙️', query: 'rebar' },
  { label: 'Sand & Aggregate',  color: 'bg-amber-50',    text: 'text-amber-800',  border: 'border-amber-200',  emoji: '🏖️', query: 'sand' },
  { label: 'Timber & Wood',     color: 'bg-orange-50',   text: 'text-orange-800', border: 'border-orange-200', emoji: '🪵', query: 'timber' },
  { label: 'Roofing',           color: 'bg-sky-50',      text: 'text-sky-800',    border: 'border-sky-200',    emoji: '🏠', query: 'zinc' },
  { label: 'Plumbing',          color: 'bg-blue-50',     text: 'text-blue-800',   border: 'border-blue-200',   emoji: '🔧', query: 'pipe' },
  { label: 'Electrical',        color: 'bg-yellow-50',   text: 'text-yellow-800', border: 'border-yellow-200', emoji: '⚡', query: 'wire' },
  { label: 'Paint & Finishing', color: 'bg-purple-50',   text: 'text-purple-800', border: 'border-purple-200', emoji: '🎨', query: 'paint' },
]

export const SPECIALTY_META: Record<string, { color: string; text: string; emoji: string }> = {
  'General Contractor':    { color: 'bg-primary-50',  text: 'text-primary-700',  emoji: '🏗️' },
  'Masonry & Blockwork':   { color: 'bg-slate-100',   text: 'text-slate-700',    emoji: '🧱' },
  'Roofing':               { color: 'bg-sky-50',      text: 'text-sky-700',      emoji: '🏠' },
  'Plumbing':              { color: 'bg-blue-50',     text: 'text-blue-700',     emoji: '🔧' },
  'Electrical':            { color: 'bg-yellow-50',   text: 'text-yellow-700',   emoji: '⚡' },
  'Carpentry & Joinery':   { color: 'bg-orange-50',   text: 'text-orange-700',   emoji: '🪚' },
  'Tiling & Finishing':    { color: 'bg-rose-50',     text: 'text-rose-700',     emoji: '✨' },
  'Painting':              { color: 'bg-purple-50',   text: 'text-purple-700',   emoji: '🎨' },
}
