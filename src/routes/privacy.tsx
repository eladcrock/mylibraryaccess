import { createFileRoute, Link } from "@tanstack/react-router";

const LAST_UPDATED = "May 10, 2026";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy - Library Card Finder" },
      {
        name: "description",
        content:
          "How Library Card Finder collects, uses, and protects your information. No ad tracking, no data sales.",
      },
      { property: "og:title", content: "Privacy Policy - Library Card Finder" },
      {
        property: "og:description",
        content: "Plain-English privacy policy for Library Card Finder.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <p className="text-sm uppercase tracking-wide text-accent">Legal</p>
      <h1 className="mt-2 font-display text-4xl text-foreground">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>

      <div className="prose prose-neutral mt-8 max-w-none text-foreground/90 [&>h2]:mt-10 [&>h2]:font-display [&>h2]:text-2xl [&>h2]:text-foreground [&>h3]:mt-6 [&>h3]:font-semibold [&>p]:mt-3 [&>ul]:mt-3 [&>ul]:list-disc [&>ul]:pl-6 [&>ul>li]:mt-1">
        <p>
          Library Card Finder ("we", "us") helps people discover which public library
          cards they qualify for. We're a civic-tech project and we treat your data
          accordingly: we collect as little as possible, we never sell it, and we don't
          run ad-tech trackers on this site.
        </p>

        <h2>Information we collect</h2>
        <ul>
          <li>
            <strong>Account info</strong> - if you sign up: your email address and, if
            you sign in with Google, your name and avatar URL from your Google profile.
          </li>
          <li>
            <strong>Saved favorites</strong> - the library systems you bookmark while
            signed in.
          </li>
          <li>
            <strong>Suggested corrections</strong> - any edits you submit to library
            data, optionally with an email so we can follow up.
          </li>
          <li>
            <strong>Region requests</strong> - the region, library system, optional
            email, and notes you submit on the{" "}
            <Link to="/request-region" className="text-accent underline">
              Request a region
            </Link>{" "}
            page.
          </li>
          <li>
            <strong>Operational logs</strong> - standard server logs (IP address,
            request path, timestamp, user agent) used to keep the service running and
            to prevent abuse. We hash IPs before storing them with form submissions.
          </li>
        </ul>
        <p>
          The survey on <Link to="/get-started" className="text-accent underline">/get-started</Link>{" "}
          runs in your browser. Your answers (state, county, residency status) are not
          sent to our servers unless you choose to save them.
        </p>

        <h2>What we don't do</h2>
        <ul>
          <li>We don't sell or rent your data.</li>
          <li>We don't run third-party advertising or behavioural-tracking scripts.</li>
          <li>We don't share your email with the libraries you view.</li>
          <li>We don't use dark patterns to coerce signups.</li>
        </ul>

        <h2>Cookies</h2>
        <p>
          We only set the cookies needed to keep you signed in. There are no analytics,
          marketing, or advertising cookies.
        </p>

        <h2>Third parties we rely on</h2>
        <ul>
          <li>
            <strong>Lovable Cloud</strong> - hosts our database, authentication, and
            server functions.
          </li>
          <li>
            <strong>Google</strong> - only if you choose to sign in with Google. Google
            sees that you used your account to sign in to Library Card Finder.
          </li>
        </ul>

        <h2>Your rights</h2>
        <p>
          You can delete your account at any time, which removes your profile,
          favorites, and any submissions tied to your account. To export or delete data
          tied to a request, email us. Where applicable (e.g. CCPA, GDPR) you have the
          right to access, correct, port, or delete your personal information and to
          object to processing.
        </p>

        <h2>Children</h2>
        <p>
          Library Card Finder isn't directed at children under 13 and we don't
          knowingly collect their personal information.
        </p>

        <h2>Changes</h2>
        <p>
          If we make material changes, we'll update the "Last updated" date above and,
          where appropriate, notify signed-in users by email.
        </p>

        <h2>Contact</h2>
        <p>
          Questions or requests: <a className="text-accent underline" href="mailto:privacy@librarycardfinder.app">privacy@librarycardfinder.app</a>.
        </p>
      </div>
    </article>
  );
}