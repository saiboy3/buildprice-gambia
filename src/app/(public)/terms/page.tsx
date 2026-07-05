import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service',
  robots: { index: true, follow: true },
}

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 text-sm sm:text-base text-gray-700 leading-relaxed [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:text-gray-900 [&>h1]:mb-1 [&>h2]:text-lg [&>h2]:font-bold [&>h2]:text-gray-900 [&>h2]:mt-8 [&>h2]:mb-2 [&_a]:text-primary-600 [&_a]:hover:underline [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1.5 [&>ul]:my-3 [&>p]:my-3">
      <h1>Terms of Service</h1>
      <p className="text-gray-500">Last updated: 4 July 2026</p>

      <h2>1. What BuildPriceGambia is</h2>
      <p>
        BuildPriceGambia is a directory and price-comparison platform for construction materials, suppliers, and
        contractors in The Gambia. We connect buyers with listed suppliers and contractors — we are not a party to
        any purchase, delivery, or contracting agreement made between users.
      </p>

      <h2>2. Accounts</h2>
      <p>
        You must provide accurate information when registering. You're responsible for keeping your password
        confidential and for activity under your account. You can view, correct, export, or delete your account
        data at any time from <Link href="/account">My Account &amp; Privacy</Link>.
      </p>

      <h2>3. Listings &amp; price data</h2>
      <p>
        Suppliers and contractors are responsible for the accuracy of prices, availability, and contact details
        they publish. Field-reported prices are quality-scored based on the submitting account's track record, but
        we cannot guarantee real-time accuracy of any listed price — always confirm directly with the supplier
        before purchasing.
      </p>

      <h2>4. Acceptable use</h2>
      <ul>
        <li>No fraudulent listings, fake reviews, or price manipulation.</li>
        <li>No scraping or automated abuse of the platform outside the documented API.</li>
        <li>No harassment or abusive content in reviews, forum posts, or messages.</li>
      </ul>
      <p>We may suspend or delete accounts that violate these terms, using the same review process described in our admin moderation tools.</p>

      <h2>5. Field reporting &amp; rewards</h2>
      <p>
        If you participate in field price collection, submissions are tied to your verified account (never to
        name-matching alone, to avoid conflating different people who share a common name). Reward eligibility, if
        offered, depends on your account's approval track record as shown in your reporter profile.
      </p>

      <h2>6. Liability</h2>
      <p>
        The platform is provided "as is". We aren't liable for transactions, disputes, or losses arising between
        buyers, suppliers, and contractors using the directory.
      </p>

      <h2>7. Changes</h2>
      <p>We may update these terms as the platform evolves; continued use after a change means you accept the update.</p>

      <h2>8. Contact</h2>
      <p>
        Questions can be sent via the feedback widget on the site or to{' '}
        <a href="mailto:hello@buildpricegambia.com">hello@buildpricegambia.com</a>.
      </p>
    </div>
  )
}
