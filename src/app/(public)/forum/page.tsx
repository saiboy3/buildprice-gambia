import type { Metadata } from 'next'
import ForumClient from './ForumClient'

export const metadata: Metadata = {
  title: 'Community Forum',
  description:
    'Join The Gambia\'s construction community forum. Ask questions, share knowledge about building materials, construction techniques, suppliers and regulations.',
  openGraph: {
    title: 'Construction Community Forum – The Gambia',
    description:
      'Discuss building materials, construction techniques and regulations with the Gambia construction community.',
  },
}

export default function ForumPage() {
  return <ForumClient />
}
