import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About & Mission - Library Card Finder" },
      {
        name: "description",
        content:
          "Our mission, why digital library access matters, how library card signups support local libraries, and the public sources we cite.",
      },
      { property: "og:title", content: "About & Mission - Library Card Finder" },
      {
        property: "og:description",
        content:
          "Mission, digital access, why signups support local libraries, and our sources.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <p className="text-sm uppercase tracking-wide text-accent">About</p>
      <h1 className="mt-2 font-display text-4xl text-foreground">Our mission</h1>

      <div className="prose prose-neutral mt-8 max-w-none text-foreground/90 [&>h2]:mt-10 [&>h2]:font-display [&>h2]:text-2xl [&>h2]:text-foreground [&>h3]:mt-6 [&>h3]:font-semibold [&>p]:mt-3 [&>ul]:mt-3 [&>ul]:list-disc [&>ul]:pl-6 [&>ul>li]:mt-1">
        <p>
          Library Card Finder exists to make every public library benefit a Californian
          is entitled to easy to discover, understand, and claim — in one place, for free,
          with no ads or tracking. Most residents qualify for several library cards and
          rarely know what each one unlocks. We close that gap.
        </p>

        <h2>Digital access</h2>
        <p>
          Public libraries are now one of the largest providers of digital services in
          the country: ebooks and audiobooks (Libby), streaming film (Kanopy), music and
          comics (Hoopla), professional courses (LinkedIn Learning), full-text newspapers
          (NYT, WSJ), research databases, language learning, and more. For households
          without paid subscriptions or reliable broadband at home, a library card is
          often the most direct path to the same digital tools wealthier households take
          for granted. The American Library Association and the federal Institute of
          Museum and Library Services (IMLS) both classify digital inclusion as a core
          public-library function.
        </p>

        <h2>Why signing up helps your local library</h2>
        <p>
          Public library funding in California comes mostly from local property taxes and
          city/county general funds, with smaller state and federal contributions. Active
          cardholder counts and circulation aren't a direct dollar-per-signup formula,
          but they do matter:
        </p>
        <ul>
          <li>
            Every California library reports active cardholders, visits, and circulation
            (including digital circulation) to the California State Library each year as
            part of the Public Libraries Survey. Those numbers feed state and federal
            datasets.
          </li>
          <li>
            City councils, county boards, and library commissions use those same
            usage numbers when setting budgets, justifying staffing, and defending
            branches from cuts or closures.
          </li>
          <li>
            Some state and federal grant programs (administered through IMLS and the
            California State Library) weigh population served and demonstrated use when
            allocating funds.
          </li>
          <li>
            Digital-content vendors price ebook, audiobook, and streaming licenses
            partly on cardholder counts, so an active card base strengthens what your
            library can negotiate for.
          </li>
        </ul>
        <p>
          Short version: signing up for and using a card is one of the most direct civic
          actions a resident can take to keep a local library funded and well-stocked.
        </p>

        <h2>Sources</h2>
        <p>
          We try to verify claims against primary sources. Where a benefit, eligibility
          rule, or statistic is stated on this site, it is drawn from one of the
          following:
        </p>
        <ul>
          <li>
            Individual library system websites (e.g. Los Angeles Public Library, San
            Francisco Public Library, San Diego Public Library, Contra Costa County
            Library, Solano County Library, etc.) for eligibility, card types, and
            included digital benefits.
          </li>
          <li>
            <a
              href="https://www.library.ca.gov/services/to-libraries/statistics/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline"
            >
              California State Library — California Public Library Statistics
            </a>{" "}
            (Public Libraries Survey, FY 2023–24).
          </li>
          <li>
            <a
              href="https://www.library.ca.gov/uploads/2025/01/California-Library-Laws-2025.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline"
            >
              California Library Laws 2025
            </a>{" "}
            (PDF) — statutory framework for public library service in California.
          </li>
          <li>
            <a
              href="https://www.imls.gov/research-evaluation/data-collection/public-libraries-survey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline"
            >
              Institute of Museum and Library Services — Public Libraries Survey
            </a>
            .
          </li>
          <li>
            <a
              href="https://www.ala.org/advocacy/digital-equity"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline"
            >
              American Library Association — Digital Equity
            </a>
            .
          </li>
          <li>
            <a
              href="https://www.bklynlibrary.org/library-card-study"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline"
            >
              Brooklyn Public Library — Library Card Study (2024)
            </a>{" "}
            on national signup practice.
          </li>
        </ul>
        <p className="text-sm text-muted-foreground">
          Find an error or an out-of-date benefit? Let us know on the{" "}
          <Link to="/request-region" className="text-accent underline">
            request a region
          </Link>{" "}
          page and we'll correct the record.
        </p>
        <figure className="mt-12 border-t border-border pt-8 text-center">
          <blockquote className="text-base italic text-muted-foreground">
            In loving memory of Inez Diaz Owen; a fierce champion of libraries
            who taught us the bold art of resourcefulness.
          </blockquote>
        </figure>
      </div>
    </article>
  );
}
