import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  robots: { index: true, follow: true },
}

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 text-sm sm:text-base text-gray-700 leading-relaxed [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:text-gray-900 [&>h1]:mb-1 [&>h2]:text-lg [&>h2]:font-bold [&>h2]:text-gray-900 [&>h2]:mt-8 [&>h2]:mb-2 [&_a]:text-primary-600 [&_a]:hover:underline [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1.5 [&>ul]:my-3 [&>p]:my-3">
      <h1>Privacy Policy</h1>
      <p className="text-gray-500">Last updated: 4 July 2026</p>

      <p>
        BuildPriceGambia ("we", "us") operates a construction-materials price comparison platform for The Gambia.
        This policy explains what personal data we collect, why, and the rights you have over it — including
        rights modelled on the EU General Data Protection Regulation (GDPR), which we apply as a baseline of
        good practice regardless of where you're located.
      </p>

      <h2>1. What we collect</h2>
      <ul>
        <li><strong>Account data:</strong> name, phone number, optional email, and a hashed password when you register.</li>
        <li><strong>Business profile data:</strong> if you register as a supplier or contractor — business name, location, contact details, and (for field reporters) GPS coordinates you choose to submit with a price report.</li>
        <li><strong>Usage data:</strong> pages visited, search queries, device type, and an anonymous session ID — collected only if you accept analytics cookies (see our <Link href="#cookies">Cookie use</Link> below).</li>
        <li><strong>Content you submit:</strong> price reports, reviews, forum posts, RFQ requests, and support/feedback messages.</li>
      </ul>

      <h2>2. Why we use it</h2>
      <ul>
        <li>To operate your account and display supplier/contractor listings you create.</li>
        <li>To show construction material prices and connect buyers with suppliers/contractors.</li>
        <li>To maintain data quality — field-reported prices are scored using a reporter's track record.</li>
        <li>To improve the platform via aggregate, consent-gated usage analytics.</li>
        <li>To detect abuse and enforce rate limits on registration, login, and submissions.</li>
      </ul>

      <h2>3. Legal bases (GDPR Article 6)</h2>
      <p>
        We process account and listing data under <em>contract</em> (to provide the service you signed up for),
        usage analytics under <em>consent</em> (via the cookie banner), and security/rate-limiting data under
        <em> legitimate interest</em> in keeping the platform safe from abuse.
      </p>

      <h2 id="cookies">4. Cookies &amp; local storage</h2>
      <p>
        We use a small number of essential cookies/local storage entries required for login sessions and your
        cookie preference itself. Analytics tracking (page views, search queries) only runs after you accept it
        in the cookie banner, and you can change your choice at any time by clearing your browser's local storage
        for this site.
      </p>

      <h2>5. Your rights</h2>
      <p>Regardless of location, you can:</p>
      <ul>
        <li><strong>Access</strong> — download a complete copy of your data from <Link href="/account">My Account &amp; Privacy</Link>.</li>
        <li><strong>Erasure</strong> — permanently delete your account from the same page.</li>
        <li><strong>Rectification</strong> — edit your profile at any time from your dashboard.</li>
        <li><strong>Portability</strong> — the data export is provided as structured JSON.</li>
      </ul>

      <h2>6. Data sharing</h2>
      <p>
        We do not sell personal data. Supplier and contractor profile details you choose to publish (name, location,
        contact, prices) are shown publicly on the platform by design, since that's the purpose of a directory listing.
        We use third-party infrastructure providers (hosting, database, error monitoring) solely to operate the service,
        under their own data-processing terms.
      </p>

      <h2>7. Data retention</h2>
      <p>
        We keep account data for as long as your account is active. Deleting your account (see above) removes your
        login and any linked supplier or field-reporter profile; a linked contractor listing, if any, stays live but
        is unlinked from your account. Activity logs used for security auditing are retained separately for abuse
        investigation.
      </p>

      <h2>8. Security</h2>
      <p>
        Passwords are hashed (never stored in plain text), access to admin functions is role-restricted, sensitive
        endpoints are rate-limited, and the site is served exclusively over HTTPS with modern browser security headers.
      </p>

      <h2>9. Contact</h2>
      <p>
        Questions about this policy or a data request can be sent via the feedback widget on the site or to{' '}
        <a href="mailto:hello@buildpricegambia.com">hello@buildpricegambia.com</a>.
      </p>

      <p className="text-xs text-gray-400 mt-8">
        This page describes our engineering practices and is provided for transparency. It is not a substitute for
        formal legal advice on regulatory compliance in your jurisdiction.
      </p>
    </div>
  )
}
