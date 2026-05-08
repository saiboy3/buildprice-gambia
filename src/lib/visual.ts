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
  image:   string        // Unsplash photo URL
  query:   string        // search keyword
}

export const CATEGORY_META: CategoryMeta[] = [
  { label: 'Cement & Concrete', color: 'bg-slate-100',   text: 'text-slate-700',  border: 'border-slate-200',  image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=120&h=120&fit=crop&q=70', query: 'cement' },
  { label: 'Steel & Metal',     color: 'bg-gray-100',    text: 'text-gray-700',   border: 'border-gray-200',   image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=120&h=120&fit=crop&q=70', query: 'rebar' },
  { label: 'Sand & Aggregate',  color: 'bg-amber-50',    text: 'text-amber-800',  border: 'border-amber-200',  image: 'https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=120&h=120&fit=crop&q=70', query: 'sand' },
  { label: 'Timber & Wood',     color: 'bg-orange-50',   text: 'text-orange-800', border: 'border-orange-200', image: 'https://images.unsplash.com/photo-1542621334-a254cf47733d?w=120&h=120&fit=crop&q=70', query: 'timber' },
  { label: 'Roofing',           color: 'bg-sky-50',      text: 'text-sky-800',    border: 'border-sky-200',    image: 'https://images.unsplash.com/photo-1605152276897-4f618f831968?w=120&h=120&fit=crop&q=70', query: 'zinc' },
  { label: 'Plumbing',          color: 'bg-blue-50',     text: 'text-blue-800',   border: 'border-blue-200',   image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=120&h=120&fit=crop&q=70', query: 'pipe' },
  { label: 'Electrical',        color: 'bg-yellow-50',   text: 'text-yellow-800', border: 'border-yellow-200', image: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=120&h=120&fit=crop&q=70', query: 'wire' },
  { label: 'Paint & Finishing', color: 'bg-purple-50',   text: 'text-purple-800', border: 'border-purple-200', image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=120&h=120&fit=crop&q=70', query: 'paint' },
]

export const SPECIALTY_META: Record<string, { color: string; text: string; image: string }> = {
  'General Contractor':    { color: 'bg-primary-50',  text: 'text-primary-700',  image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=80&h=80&fit=crop&q=70' },
  'Masonry & Blockwork':   { color: 'bg-slate-100',   text: 'text-slate-700',    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=80&h=80&fit=crop&q=70' },
  'Roofing':               { color: 'bg-sky-50',      text: 'text-sky-700',      image: 'https://images.unsplash.com/photo-1605152276897-4f618f831968?w=80&h=80&fit=crop&q=70' },
  'Plumbing':              { color: 'bg-blue-50',     text: 'text-blue-700',     image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=80&h=80&fit=crop&q=70' },
  'Electrical':            { color: 'bg-yellow-50',   text: 'text-yellow-700',   image: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=80&h=80&fit=crop&q=70' },
  'Carpentry & Joinery':   { color: 'bg-orange-50',   text: 'text-orange-700',   image: 'https://images.unsplash.com/photo-1542621334-a254cf47733d?w=80&h=80&fit=crop&q=70' },
  'Tiling & Finishing':    { color: 'bg-rose-50',     text: 'text-rose-700',     image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=80&h=80&fit=crop&q=70' },
  'Painting':              { color: 'bg-purple-50',   text: 'text-purple-700',   image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=80&h=80&fit=crop&q=70' },
}
