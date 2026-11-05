import { type JSX, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const privacySections = [
  {
    title: '1. Information We Collect',
    content:
      'We collect the following categories of personal and non-personal information: Identity & Contact Information: Full name, date of birth, email address, mobile number, residential address. KYC & Identity Documents: PAN card, Aadhaar number, passport, voter ID, driving licence, or other government-issued identity documents as required for verification. Financial Information: Bank account details, income details, investment preferences, source of funds declarations. Entity Details (for companies, LLPs, trusts, or firms): Certificate of incorporation, MOA/AOA, partnership deeds, trust deeds, board resolutions, beneficial ownership details, and authorised signatory information. Platform Usage Data: Log-in records, pages visited, time spent on the platform, device type, browser type, IP address, and interaction data. Communication Records: Emails, messages, support tickets, and any correspondence exchanged with the Fracto team. Transaction & Participation Records: Details of opportunities reviewed, expressions of interest, executed documents, and payment records.',
  },
  {
    title: '2. How We Use Your Information',
    content:
      'We use your information for the following purposes: Account creation, login, and platform access management. KYC and KYB verification and AML screening as required under PMLA, 2002. Assessing eligibility for platform services and specific Opportunities. Facilitating transaction execution, document management, and participation confirmation. Sharing relevant asset documents, updates, distribution statements, and platform communications. Providing customer support and resolving grievances. Improving platform functionality, user experience, and content relevance. Complying with legal and regulatory obligations, including tax reporting and regulatory disclosures. Detecting, preventing, and investigating fraud, misuse, or unauthorised access. Maintaining internal records for audit and compliance purposes.',
  },
  {
    title: '3. Sharing of Your Information',
    content:
      'We may share your information with the following parties, only to the extent necessary and for legitimate purposes: KYC and AML Verification Partners. Payment Gateway Providers and Banking Partners. Escrow Service Providers. Legal Advisors and Compliance Consultants. Asset Owners and Transaction Parties where required for executing a specific participation. Technology and Cloud Service Providers. Regulatory and Government Authorities where required by applicable law, court order, or regulatory mandate. We do not sell, rent, or trade your personal data to any third party for marketing or commercial purposes.',
  },
  {
    title: '4. Data Security',
    content:
      'We implement appropriate technical, administrative, and physical security measures to protect your personal data from unauthorized access, loss, misuse, alteration, or disclosure. These measures include data encryption, access controls, secure storage practices, and regular security reviews. However, no digital system or internet transmission is completely secure. While we take every reasonable precaution, we cannot guarantee absolute security of data transmitted to or from the Platform. In the event of a data breach that is likely to affect your rights or interests, we will notify you as required under applicable law.',
  },
  {
    title: '5. Data Retention',
    content:
      'We retain your personal data for as long as necessary to fulfil the purposes for which it was collected -- including providing platform services, complying with legal and regulatory obligations, resolving disputes, and enforcing agreements. KYC and transaction records are retained for a minimum period as required under PMLA, 2002, and applicable SEBI regulations. Where you request deletion of your account and there is no legal or regulatory obligation requiring retention, we will delete or anonymise your personal data within a reasonable timeframe.',
  },
  {
    title: '6. Cookies and Tracking Technologies',
    content:
      'Our website uses cookies, web beacons, and similar tracking technologies to enhance user experience, analyse platform traffic, and understand visitor behaviour. Cookies may be session-based (deleted when you close your browser) or persistent (stored for a defined period). You may disable cookies through your browser settings; however, doing so may affect the functionality of certain platform features. We do not use tracking technologies to serve third-party advertising.',
  },
  {
    title: '7. Your Rights',
    content:
      'Subject to applicable Indian law, you have the following rights with respect to your personal data: Right to Access: Request a copy of the personal data we hold about you. Right to Correction: Request correction of inaccurate or incomplete data. Right to Withdrawal of Consent: Withdraw consent for processing where consent is the basis, without affecting processing prior to withdrawal. Right to Deletion: Request deletion of your personal data where no legal or regulatory obligation requires us to retain it. Right to Restrict Processing: Request that we limit the processing of your data in specific circumstances. To exercise any of these rights, please write to: privacy@fracto.com. We will respond within 30 days.',
  },
  {
    title: "8. Children's Privacy",
    content:
      'The Platform is not intended for use by individuals under the age of 18. We do not knowingly collect personal data from minors. If we become aware that a minor has registered on the Platform, we will take immediate steps to delete the relevant data and close the account.',
  },
  {
    title: '9. Third-Party Links',
    content:
      'The Platform may contain links to external websites or third-party services. Fracto is not responsible for the privacy practices, security measures, or content of any third-party website. We encourage you to review the privacy policies of any external site you visit.',
  },
  {
    title: '10. Updates to this Policy',
    content:
      'We may update this Privacy Policy from time to time to reflect changes in our practices, the Platform, or applicable law. When we make material changes, we will notify you through the Platform or by email to your registered address. Continued use of the Platform after the effective date of any update constitutes your acceptance of the revised Policy.',
  },
  {
    title: '11. Contact -- Privacy Matters',
    content:
      'For any privacy-related queries, requests, or concerns, please contact our Data Protection contact at: privacy@fracto.com. You may also write to us at the registered office address of Fracto.',
  },
];

const conductSections = [
  {
    title: '1. General Standards',
    content:
      'All users of the Platform are expected to: Act with honesty, integrity, and good faith in all interactions on the Platform. Provide accurate, complete, and up-to-date information at all times -- during registration, KYC, asset listing, and all platform interactions. Comply with all applicable laws, regulations, and platform policies. Treat other users, asset owners, platform staff, and partners with courtesy and professionalism. Use the Platform only for its intended and lawful purposes.',
  },
  {
    title: '2. Prohibited Activities',
    content:
      "The following activities are strictly prohibited on the Fracto Platform: Providing false, misleading, incomplete, or fraudulent information during registration, KYC, or in connection with any Opportunity. Impersonating another person, entity, or representative. Uploading forged, altered, or fraudulent documents. Making misleading or unsubstantiated claims about any Opportunity, asset, return, or the Platform. Representing yourself as an employee, officer, or authorised representative of Fracto without written authorisation. Copying, scraping, reproducing, or commercially exploiting any Platform content, data, or technology. Interfering with or disrupting the Platform's technical infrastructure, systems, or services. Attempting to gain unauthorised access to any part of the Platform, another user's account, or internal systems. Engaging in money laundering, fraudulent transactions, or any activity prohibited under PMLA, 2002. Using the Platform to solicit, promote, or facilitate unlawful schemes, pyramid structures, or unregistered investment schemes. Harassing, threatening, or abusing any other user, asset owner, platform staff, or partner.",
  },
  {
    title: '3. Asset Owner Conduct',
    content:
      'Asset owners and developers listing assets on the Platform additionally agree to: Provide accurate, verified, and up-to-date asset information, documents, financials, valuations, and disclosures. Not make exaggerated, unverified, or misleading claims about projected returns, occupancy, valuations, or asset quality. Promptly disclose any material changes to the asset -- including legal disputes, title encumbrances, regulatory notices, occupancy changes, or financial distress. Honour the commercial terms, distribution commitments, and reporting obligations defined in the Transaction Documents. Not approach Investors outside the Platform with conflicting terms or side arrangements in connection with an asset listed on Fracto.',
  },
  {
    title: '4. Channel Partner Conduct',
    content:
      "Channel partners, brokers, advisors, and introducers additionally agree to: Not make guaranteed return claims, capital protection assurances, or misleading representations about any Platform Opportunity to Investors. Not approach Investors with unapproved materials, undisclosed commissions, or representations inconsistent with the Platform's approved communications. Disclose any conflict of interest to both the Investor and Fracto before facilitating any introduction. Not use the Fracto name, brand, or materials without prior written approval. Comply with all applicable SEBI, RBI, and financial services regulations relevant to their role.",
  },
  {
    title: '5. Consequences of Violation',
    content:
      "Violations of this User Conduct Policy may result in one or more of the following actions, at Fracto's sole discretion: Immediate suspension or permanent termination of the user's account. Removal of any asset listing from the Platform. Termination of any channel partner agreement. Reporting of fraudulent or criminal activity to relevant regulatory or law enforcement authorities. Civil or legal action for damages, including recovery of losses suffered by the Platform or other users. Fracto reserves the right to take these actions without prior notice where urgency or the severity of the violation warrants it.",
  },
  {
    title: '6. Reporting Violations',
    content:
      'If you observe conduct by another user, asset owner, or partner that you believe violates this Policy, we encourage you to report it promptly. Reports can be submitted to: conduct@fracto.com. All reports will be reviewed in confidence. Retaliatory action against a user who makes a good-faith report is itself a violation of this Policy.',
  },
  {
    title: '7. Amendments',
    content:
      'Fracto reserves the right to update this User Conduct Policy at any time. Continued use of the Platform following any update constitutes acceptance of the revised Policy. Material changes will be notified to registered users by email or through the Platform.',
  },
];

const tabs = [
  { id: 'privacy', label: 'Privacy Policy' },
  { id: 'conduct', label: 'User Conduct Policy' },
];

export default function PrivacyPolicy(): JSX.Element {
  const [activeTab, setActiveTab] = useState<'privacy' | 'conduct'>('privacy');

  const sections = activeTab === 'privacy' ? privacySections : conductSections;

  const intro =
    activeTab === 'privacy'
      ? 'Fracto is committed to protecting your privacy and handling your personal data with care, transparency, and respect. This Privacy Policy explains what information we collect, why we collect it, how we use and protect it, and your rights in relation to it. By accessing or using the Platform, you consent to the practices described in this Policy.'
      : 'Fracto is a professional, compliance-focused platform. The integrity of our ecosystem depends on every participant conducting themselves with honesty, accuracy, and respect. This User Conduct Policy forms an integral part of the Fracto Terms & Conditions. By registering on or using the Platform, you confirm that you have read, understood, and agreed to comply with this Policy in its entirety.';

  return (
    <div className="bg-[var(--bg)] text-[var(--fg)] font-work transition-colors duration-300 min-h-screen">
      {/* Hero */}
      <section className="relative pb-24 pt-32 md:pt-40 lg:pt-48 overflow-hidden bg-[var(--inner-card)]">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />

        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 text-center relative z-10">
          <motion.h1
            className="font-48 md:text-[64px] font-bold mb-6 text-[var(--fg)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            Policies
          </motion.h1>
          <motion.p
            className="font-20 text-[var(--fg)]/60 font-light max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
          >
            Our Privacy Policy and User Conduct Policy govern how we handle your
            data and the standards expected from every participant on the
            Platform.
          </motion.p>

          {/* Tabs */}
          <motion.div
            className="mt-10 flex justify-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="inline-flex bg-[var(--bg)]/60 backdrop-blur-sm border border-[var(--fg)]/10 rounded-full p-1 gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'privacy' | 'conduct')}
                  className={`px-6 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-[#4F46E5] to-[#2563EB] text-white shadow-md'
                      : 'text-[var(--fg)]/60 hover:text-[var(--fg)]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-24 relative z-10 -mt-10">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              className="bg-[var(--card)] p-8 md:p-12 lg:p-16 rounded-[2rem] border border-[var(--fg)]/10 shadow-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              {/* Intro */}
              <p className="font-18 text-[var(--fg)]/60 font-light leading-relaxed border-l-4 border-[#4F46E5] pl-4 mb-12">
                {intro}
              </p>

              <div className="space-y-12">
                {sections.map((section, idx) => (
                  <motion.div
                    key={idx}
                    className="mb-6"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{
                      duration: 0.5,
                      delay: Math.min(idx * 0.05, 0.3),
                    }}
                  >
                    <h2 className="font-28 md:text-[32px] font-semibold text-[var(--fg)] mb-4 border-b border-[var(--fg)]/5 pb-2">
                      {section.title}
                    </h2>
                    <p className="text-[var(--fg)]/70 font-16 leading-relaxed">
                      {section.content}
                    </p>
                  </motion.div>
                ))}
              </div>

              <div className="mt-16 pt-8 border-t border-[var(--fg)]/10 text-center">
                <p className="font-16 text-[var(--fg)]/50 italic">
                  Effective Date: To be updated on launch. Last Updated: May
                  2026. Fracto reserves the right to update this policy
                  at any time.
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
