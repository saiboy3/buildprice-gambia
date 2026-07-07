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

// Image IDs below are visually verified to match their material (bags of
// cement, rebar coils, sand piles, etc.) — don't swap them without checking
// the actual photo renders correctly.
export const CATEGORY_META: CategoryMeta[] = [
  { label: 'Cement & Concrete', color: 'bg-slate-100',   text: 'text-slate-700',  border: 'border-slate-200',  image: 'https://images.unsplash.com/photo-1680357680725-f350480aee35?w=480&h=280&fit=crop&q=75', query: 'cement' },
  { label: 'Steel & Metal',     color: 'bg-gray-100',    text: 'text-gray-700',   border: 'border-gray-200',   image: 'https://images.unsplash.com/photo-1763771420303-0f11ccf613d1?w=480&h=280&fit=crop&q=75', query: 'rebar' },
  { label: 'Sand & Aggregate',  color: 'bg-amber-50',    text: 'text-amber-800',  border: 'border-amber-200',  image: 'https://images.unsplash.com/photo-1681880511033-b9582a379ce2?w=480&h=280&fit=crop&q=75', query: 'sand' },
  { label: 'Timber & Wood',     color: 'bg-orange-50',   text: 'text-orange-800', border: 'border-orange-200', image: 'https://images.unsplash.com/photo-1681752972950-6229ca099fbc?w=480&h=280&fit=crop&q=75', query: 'timber' },
  { label: 'Roofing',           color: 'bg-sky-50',      text: 'text-sky-800',    border: 'border-sky-200',    image: 'https://images.unsplash.com/photo-1518736346281-76873166a64a?w=480&h=280&fit=crop&q=75', query: 'zinc' },
  { label: 'Plumbing',          color: 'bg-blue-50',     text: 'text-blue-800',   border: 'border-blue-200',   image: 'https://images.unsplash.com/photo-1545193329-4a052e14eb8f?w=480&h=280&fit=crop&q=75', query: 'pipe' },
  { label: 'Electrical',        color: 'bg-yellow-50',   text: 'text-yellow-800', border: 'border-yellow-200', image: 'https://images.unsplash.com/photo-1518181835702-6eef8b4b2113?w=480&h=280&fit=crop&q=75', query: 'wire' },
  { label: 'Paint & Finishing', color: 'bg-purple-50',   text: 'text-purple-800', border: 'border-purple-200', image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=480&h=280&fit=crop&q=75', query: 'paint' },
]

/** Best-effort match of a category/material name to its visual metadata. */
export function getCategoryMeta(catName: string): CategoryMeta {
  return CATEGORY_META.find(c => catName.toLowerCase().includes(c.query) || c.label.toLowerCase().includes(catName.toLowerCase()))
    ?? CATEGORY_META[0]
}

export const SPECIALTY_META: Record<string, { color: string; text: string; image: string }> = {
  'General Contractor':    { color: 'bg-primary-50',  text: 'text-primary-700',  image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=160&h=160&fit=crop&q=75' },
  'Masonry & Blockwork':   { color: 'bg-slate-100',   text: 'text-slate-700',    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=160&h=160&fit=crop&q=75' },
  'Roofing':               { color: 'bg-sky-50',      text: 'text-sky-700',      image: 'https://images.unsplash.com/photo-1518736346281-76873166a64a?w=160&h=160&fit=crop&q=75' },
  'Plumbing':              { color: 'bg-blue-50',     text: 'text-blue-700',     image: 'https://images.unsplash.com/photo-1545193329-4a052e14eb8f?w=160&h=160&fit=crop&q=75' },
  'Electrical':            { color: 'bg-yellow-50',   text: 'text-yellow-700',   image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=160&h=160&fit=crop&q=75' },
  'Carpentry & Joinery':   { color: 'bg-orange-50',   text: 'text-orange-700',   image: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=160&h=160&fit=crop&q=75' },
  'Tiling & Finishing':    { color: 'bg-rose-50',     text: 'text-rose-700',     image: 'https://images.unsplash.com/photo-1523413307857-ef24c53571ae?w=160&h=160&fit=crop&q=75' },
  'Painting':              { color: 'bg-purple-50',   text: 'text-purple-700',   image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=160&h=160&fit=crop&q=75' },
}
