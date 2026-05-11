import { createFileRoute } from "@tanstack/react-router";

const LAST_UPDATED = "May 10, 2026";

export const Route = createFileRoute("/security")({
  head: () => ({
    meta: [
      { title: "Security - Library Card Finder" },
      {
        name: "description",
        content:
          "How Library Card Finder secures your account and data: HTTPS, Row Level Security, encrypted backups, and responsible disclosure.",
      },
      { property: "og:title", content: "Security - Library Card Finder" },
      {
        property: "og:description",
        content: "Our security posture in plain English.",
      },
    ],
  }),
  component: SecurityPage,
});

function SecurityPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <p className="text-sm uppercase tracking-wide text-accent">Trust</p>
      <h1 className="mt-2 font-display text-4xl text-foreground">Security</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>

      <div className="prose prose-neutral mt-8 max-w-none text-foreground/90 [&>h2]:mt-10 [&>h2]:font-display [&>h2]:text-2xl [&>h2]:text-foreground [&>p]:mt-3 [&>ul]:mt-3 [&>ul]:list-disc [&>ul]:pl-6 [&>ul>li]:mt-1">
        <p>
          We collect very little from you, and what we do collect we protect with
          standard, audited controls. Here's what's actually in place today.
        </p>

        <h2>In transit</h2>
        <ul>
          <li>HTTPS everywhere - HTTP requests are redirected to TLS.</li>
          <li>HSTS is enabled on the production domain.</li>
        </ul>

        <h2>Authentication</h2>
        <ul>
          <li>Email + password and Google sign-in via our managed auth provider.</li>
          <li>Passwords are hashed by the auth provider - we never see them.</li>
          <li>
            New and changed passwords are checked against the Have I Been Pwned breach
            corpus and rejected if known to be compromised.
          </li>
          <li>Sessions are stored in httpOnly cookies and rotated on sign-in.</li>
        </ul>

        <h2>Authorization</h2>
        <ul>
          <li>
            Postgres Row Level Security is enabled on every table. Public library data
            is readable by anyone; favorites are readable only by their owner;
            corrections, region requests, and scrape jobs are admin-only.
          </li>
          <li>
            Admin checks go through a dedicated <code>has_role()</code> function so
            roles can never be elevated by a client request.
          </li>
          <li>The service role key is server-only and never shipped to the browser.</li>
        </ul>

        <h2>Data minimization</h2>
        <ul>
          <li>The eligibility survey runs in your browser. Answers stay local unless you save favorites.</li>
          <li>Region request emails are optional and stored only so we can notify you.</li>
          <li>IPs attached to form submissions are SHA-256 hashed before storage.</li>
          <li>No payments, no SSNs, no document uploads - none are collected.</li>
        </ul>

        <h2>Storage and backups</h2>
        <ul>
          <li>Managed Postgres with encryption at rest.</li>
          <li>Automated daily backups with point-in-time recovery.</li>
        </ul>

        <h2>Secrets and dependencies</h2>
        <ul>
          <li>API keys live in Lovable Cloud secrets, not in source control.</li>
          <li>Dependencies are pinned and scanned for known vulnerabilities.</li>
          <li>Webhook endpoints (where used) verify signatures before processing.</li>
        </ul>

        <h2>Reporting a vulnerability</h2>
        <p>
          If you believe you've found a security issue, please email{" "}
          <a className="text-accent underline" href="mailto:security@librarycardfinder.app">
            security@librarycardfinder.app
          </a>{" "}
          with steps to reproduce. We aim to acknowledge reports within 72 hours and
          ask that you give us a reasonable window to fix issues before public
          disclosure. We won't pursue legal action against good-faith research that
          respects user privacy and avoids service disruption.
        </p>

        <h2>Out of scope today</h2>
        <p>
          Library Card Finder is in early access. We do not yet operate a formal bug
          bounty, SOC 2 program, or 24/7 incident response. We'll update this page as
          our program matures.
        </p>
      </div>
    </article>
  );
}