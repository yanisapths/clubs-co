// app/privacy-policy/page.tsx
"use client";

import Link from "next/link";

const LAST_UPDATED = "July 19, 2026";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "information-we-collect", label: "Information we collect" },
  { id: "google-oauth", label: "Signing in with Google" },
  { id: "how-we-use-it", label: "How we use information" },
  { id: "sharing", label: "Sharing & disclosure" },
  { id: "cookies", label: "Cookies & similar tech" },
  { id: "retention", label: "Data retention" },
  { id: "your-rights", label: "Your rights & choices" },
  { id: "children", label: "Children's privacy" },
  { id: "security", label: "Security" },
  { id: "international", label: "International transfers" },
  { id: "changes", label: "Changes to this policy" },
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

function PrivacyPolicyPage() {
  return (
    <div className="relative min-h-screen bg-black">
      <main className="relative mx-auto max-w-7xl px-6 pb-24 pt-10">
        <p className="text-sm text-neutral-500">Legal</p>
        <h1 className="mt-2 text-4xl font-medium text-neutral-100">
          Privacy Policy
        </h1>
        <p className="mt-3 max-w-2xl text-neutral-500">
          Last updated: {LAST_UPDATED}
        </p>

        <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-[1fr_220px]">
          <div className="space-y-16">
            <Section id="overview" title="Overview">
              <p>
                This Privacy Policy explains how [Legal Entity Name]
                (&quot;Meeteon&quot;, &quot;we&quot;, &quot;us&quot;, or
                &quot;our&quot;) collects, uses, and shares information when you
                use the Meeteon website, apps, and related services
                (collectively, the &quot;Service&quot;), including creating,
                joining, and managing clubs.
              </p>
              <p>
                By using the Service, you agree to the collection and use of
                information as described here. If you don&apos;t agree, please
                don&apos;t use the Service.
              </p>
            </Section>

            <Section id="information-we-collect" title="Information we collect">
              <p>We collect information in three ways:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <span className="text-neutral-200">
                    Information you provide directly
                  </span>{" "}
                  — such as your username, profile details, club names and
                  descriptions, messages, and any content you post within a
                  club.
                </li>
                <li>
                  <span className="text-neutral-200">
                    Information from third-party sign-in
                  </span>{" "}
                  — when you sign in with Google, we receive basic profile
                  information as described below.
                </li>
                <li>
                  <span className="text-neutral-200">
                    Information collected automatically
                  </span>{" "}
                  — device and log data (IP address, browser type, pages viewed,
                  timestamps), and cookies or similar identifiers used to keep
                  you signed in and understand how the Service is used.
                </li>
              </ul>
            </Section>

            <Section id="google-oauth" title="Signing in with Google">
              <p>
                When you choose &quot;Sign in with Google&quot;, Google shares a
                limited set of information with us based on the permissions you
                approve — typically your name, email address, and profile
                picture. We use this only to create and authenticate your
                Meeteon account; we do not receive your Google password, and we
                don&apos;t access other Google services or data on your behalf
                beyond what you explicitly authorize.
              </p>
              <p>
                You can review or revoke Meeteon&apos;s access at any time from
                your{" "}
                <a
                  href="https://myaccount.google.com/permissions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-100 underline decoration-neutral-600 underline-offset-4 hover:decoration-neutral-400"
                >
                  Google Account permissions
                </a>{" "}
                page.
              </p>
            </Section>

            <Section id="how-we-use-it" title="How we use information">
              <ul className="list-disc space-y-2 pl-5">
                <li>To create and maintain your account.</li>
                <li>
                  To operate core features, like creating clubs, managing
                  membership and seats, and displaying club content to the right
                  members.
                </li>
                <li>
                  To communicate with you about your account, club activity, and
                  service updates.
                </li>
                <li>To maintain the security and integrity of the Service.</li>
                <li>
                  To understand usage patterns and improve the Service over
                  time.
                </li>
                <li>To comply with legal obligations.</li>
              </ul>
            </Section>

            <Section id="sharing" title="Sharing & disclosure">
              <p>
                We don&apos;t sell your personal information. We may share it:
              </p>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <span className="text-neutral-200">Within a club</span> — your
                  profile info and content are visible to other members of clubs
                  you join, as controlled by that club&apos;s settings.
                </li>
                <li>
                  <span className="text-neutral-200">
                    With service providers
                  </span>{" "}
                  who host, analyze, or support the Service under
                  confidentiality obligations.
                </li>
                <li>
                  <span className="text-neutral-200">For legal reasons</span> —
                  if required by law, or to protect the rights, safety, and
                  property of Meeteon, our users, or the public.
                </li>
                <li>
                  <span className="text-neutral-200">
                    In a business transfer
                  </span>{" "}
                  — such as a merger, acquisition, or sale of assets, subject to
                  this policy or a successor policy.
                </li>
              </ul>
            </Section>

            <Section id="cookies" title="Cookies & similar tech">
              <p>
                We use cookies and similar technologies to keep you signed in,
                remember preferences, and understand aggregate usage. You can
                control cookies through your browser settings; disabling them
                may affect parts of the Service, such as staying signed in.
              </p>
            </Section>

            <Section id="retention" title="Data retention">
              <p>
                We retain account and club information for as long as your
                account is active or as needed to provide the Service. If you
                delete your account, we delete or anonymize your personal
                information within a reasonable period, except where we&apos;re
                required to keep it for legal, security, or legitimate business
                purposes.
              </p>
            </Section>

            <Section id="your-rights" title="Your rights & choices">
              <p>
                Depending on where you live, you may have rights to access,
                correct, export, or delete your personal information, or to
                object to or restrict certain processing. You can update most
                account information directly in your Meeteon settings, or
                contact us using the details below to make a request.
              </p>
            </Section>

            <Section id="children" title="Children's privacy">
              <p>
                Meeteon is not directed to children under 13 (or the minimum age
                required in your region), and we don&apos;t knowingly collect
                personal information from them. If you believe a child has
                provided us with personal information, contact us and we&apos;ll
                take appropriate steps to remove it.
              </p>
            </Section>

            <Section id="security" title="Security">
              <p>
                We use reasonable technical and organizational measures to
                protect your information. No method of transmission or storage
                is completely secure, so we can&apos;t guarantee absolute
                security.
              </p>
            </Section>

            <Section id="international" title="International transfers">
              <p>
                Your information may be processed in countries other than the
                one you live in. Where required, we use appropriate safeguards
                to protect information transferred internationally.
              </p>
            </Section>

            <Section id="changes" title="Changes to this policy">
              <p>
                We may update this Privacy Policy from time to time. If we make
                material changes, we&apos;ll notify you by updating the date at
                the top of this page or through other reasonable means.
                Continued use of the Service after changes take effect means you
                accept the updated policy.
              </p>
            </Section>

            <Section id="contact" title="Contact us">
              <p className="text-neutral-500">
                See also our{" "}
                <Link
                  href="/terms-of-service"
                  className="text-neutral-100 underline decoration-neutral-600 underline-offset-4 hover:decoration-neutral-400"
                >
                  Terms of Service
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

export default PrivacyPolicyPage;
