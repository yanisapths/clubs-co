"use client";

import Link from "next/link";

const LAST_UPDATED = "July 19, 2026";

const SECTIONS = [
  { id: "acceptance", label: "Acceptance of terms" },
  { id: "the-service", label: "The service" },
  { id: "accounts", label: "Accounts & eligibility" },
  { id: "clubs", label: "Clubs, seats & limits" },
  { id: "acceptable-use", label: "Acceptable use" },
  { id: "content", label: "Content & ownership" },
  { id: "fees", label: "Fees during beta" },
  { id: "termination", label: "Suspension & termination" },
  { id: "disclaimers", label: "Disclaimers" },
  { id: "liability", label: "Limitation of liability" },
  { id: "governing-law", label: "Governing law" },
  { id: "changes", label: "Changes to these terms" },
  { id: "contact", label: "Contact us" },
];

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-2xl font-medium text-neutral-100">{title}</h2>
      <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-neutral-400">
        {children}
      </div>
    </section>
  );
}

function TermsOfServicePage() {
  return (
    <div className="relative min-h-screen bg-black">
      <main className="relative mx-auto max-w-7xl px-6 pb-24 pt-10">
        <p className="text-sm text-neutral-500">Legal</p>
        <h1 className="mt-2 text-4xl font-medium text-neutral-100">
          Terms of Service
        </h1>
        <p className="mt-3 max-w-2xl text-neutral-500">
          Last updated: {LAST_UPDATED}
        </p>

        <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-[1fr_220px]">
          <div className="space-y-16">
            <Section id="acceptance" title="Acceptance of terms">
              <p>
                These Terms of Service (&quot;Terms&quot;) govern your access to
                and use of Meeteon, operated by [Legal Entity Name]
                (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;). By creating
                an account or otherwise using the Service, you agree to be bound
                by these Terms and our{" "}
                <Link
                  href="/privacy-policy"
                  className="text-neutral-100 underline decoration-neutral-600 underline-offset-4 hover:decoration-neutral-400"
                >
                  Privacy Policy
                </Link>
                . If you don&apos;t agree, don&apos;t use the Service.
              </p>
            </Section>

            <Section id="the-service" title="The service">
              <p>
                Meeteon lets members create, join, and manage clubs — community
                spaces with members, roles, and shared content. The Service is
                currently in beta (
                <span className="text-neutral-200">Beta 1.0.0</span>) and may
                change, expand, or be modified as it develops.
              </p>
            </Section>

            <Section id="accounts" title="Accounts & eligibility">
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  You must be at least 13 years old (or the minimum age of
                  digital consent in your country) to use Meeteon.
                </li>
                <li>
                  You&apos;re responsible for maintaining the confidentiality of
                  your account, including when signing in via Google, and for
                  all activity that occurs under it.
                </li>
                <li>
                  You agree to provide accurate information and to keep it up to
                  date.
                </li>
                <li>
                  You&apos;re responsible for notifying us promptly of any
                  unauthorized use of your account.
                </li>
              </ul>
            </Section>

            <Section id="clubs" title="Clubs, seats & limits">
              <p>During the current beta, the following limits apply:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  Each member may create up to{" "}
                  <span className="text-neutral-200">5 clubs</span>.
                </li>
                <li>
                  Each club may have up to{" "}
                  <span className="text-neutral-200">200 seats</span>, set by
                  the club&apos;s founder.
                </li>
                <li>
                  There&apos;s no limit on how many clubs a member may{" "}
                  <span className="text-neutral-200">join</span>.
                </li>
              </ul>
              <p>
                Club founders and moderators are responsible for the content and
                conduct within their clubs, and must comply with these Terms and
                applicable law. We may adjust these limits as the Service
                evolves; material changes will be reflected in our{" "}
                <Link
                  href="/release-notes"
                  className="text-neutral-100 underline decoration-neutral-600 underline-offset-4 hover:decoration-neutral-400"
                >
                  release notes
                </Link>
                .
              </p>
            </Section>

            <Section id="acceptable-use" title="Acceptable use">
              <p>You agree not to:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  Use the Service for anything unlawful, harmful, or that
                  infringes others&apos; rights.
                </li>
                <li>
                  Harass, abuse, or threaten other members, or post content that
                  is hateful, obscene, or discriminatory.
                </li>
                <li>
                  Attempt to circumvent club or account limits, security
                  measures, or access controls.
                </li>
                <li>
                  Use automated means (bots, scrapers) to access the Service
                  without our written permission.
                </li>
                <li>
                  Impersonate any person or entity, or misrepresent your
                  affiliation with one.
                </li>
              </ul>
              <p>
                We may remove content or restrict accounts that violate these
                rules.
              </p>
            </Section>

            <Section id="content" title="Content & ownership">
              <p>
                You retain ownership of content you post to Meeteon. By posting
                content, you grant us a non-exclusive, worldwide, royalty-free
                license to host, store, display, and distribute that content
                solely as needed to operate and improve the Service.
              </p>
              <p>
                Meeteon&apos;s branding, software, and platform features are
                owned by us or our licensors and are protected by intellectual
                property laws. These Terms don&apos;t grant you any rights to
                our trademarks or branding.
              </p>
            </Section>

            <Section id="fees" title="Fees during beta">
              <p>
                Meeteon Clubs is currently free to use for all members, with no
                platform fees during the beta period. Pricing for organizations
                and creator monetization features will be announced in a future
                release and will not apply retroactively without notice. See our{" "}
                <Link
                  href="/guidelines/pricing-faq"
                  className="text-neutral-100 underline decoration-neutral-600 underline-offset-4 hover:decoration-neutral-400"
                >
                  Pricing FAQ
                </Link>
                .
              </p>
            </Section>

            <Section id="termination" title="Suspension & termination">
              <p>
                You may stop using the Service or delete your account at any
                time. We may suspend or terminate your access if you violate
                these Terms, create risk or legal exposure for us, or if
                required by law. Provisions that by their nature should survive
                termination (like ownership, disclaimers, and limitation of
                liability) will continue to apply.
              </p>
            </Section>

            <Section id="disclaimers" title="Disclaimers">
              <p>
                The Service is provided &quot;as is&quot; and &quot;as
                available&quot; without warranties of any kind, express or
                implied, including merchantability, fitness for a particular
                purpose, and non-infringement. We don&apos;t guarantee the
                Service will be uninterrupted, secure, or error-free,
                particularly during this beta period.
              </p>
            </Section>

            <Section id="liability" title="Limitation of liability">
              <p>
                To the fullest extent permitted by law, [Legal Entity Name] will
                not be liable for any indirect, incidental, special,
                consequential, or punitive damages, or any loss of data,
                profits, or goodwill, arising from your use of the Service. Our
                total liability for any claim relating to the Service will not
                exceed the amount you paid us, if any, in the 12 months before
                the claim arose.
              </p>
            </Section>

            <Section id="governing-law" title="Governing law">
              <p>
                These Terms are governed by the laws of [Jurisdiction], without
                regard to conflict-of-law principles. Any disputes will be
                resolved in the courts located in [Jurisdiction], unless
                applicable law requires otherwise.
              </p>
            </Section>

            <Section id="changes" title="Changes to these terms">
              <p>
                We may update these Terms as the Service evolves. If we make
                material changes, we&apos;ll notify you by updating the date
                above or through other reasonable means. Continuing to use the
                Service after changes take effect means you accept the updated
                Terms.
              </p>
            </Section>

            <Section id="contact" title="Contact us">
              <p className="text-neutral-500">
                See also our{" "}
                <Link
                  href="/privacy-policy"
                  className="text-neutral-100 underline decoration-neutral-600 underline-offset-4 hover:decoration-neutral-400"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </Section>
          </div>

          <aside className="hidden md:block">
            <div className="sticky top-24 space-y-1 border-l border-neutral-900 pl-4">
              <p className="mb-3 text-xs uppercase tracking-wide text-neutral-600">
                On this page
              </p>
              {SECTIONS.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="block py-1 text-sm text-neutral-500 hover:text-neutral-200"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default TermsOfServicePage;
