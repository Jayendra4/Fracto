import type { RootState } from '@/redux/store';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';

const SECTIONS = [
  { id: 'General Use', label: 'General Use' },
  { id: 'eligibility', label: 'Eligibility' },
  { id: 'nature', label: 'Nature of the Platform' },
  { id: 'account', label: 'User Account & Responsibility' },
  { id: 'noncustodial', label: 'Non-Custodial Disclaimer' },
  { id: 'risk', label: 'Asset Information & Risk' },
  { id: 'advice', label: 'No Investment Advice' },
  { id: 'fees', label: 'Fees & Charges' },
  { id: 'compliance', label: 'Compliance & Verification' },
  { id: 'prohibited', label: 'Prohibited Activities' },
  { id: 'liability', label: 'Limitation of Liability' },
  { id: 'ip', label: 'Intellectual Property' },
  { id: 'termination', label: 'Suspension & Termination' },
  { id: 'privacy', label: 'Privacy' },
  { id: 'amendments', label: 'Amendments' },
  { id: 'law', label: 'Governing Law' },
];

type Section =
  | {
      id: string;
      title: string;
      content: string;
    }
  | {
      id: string;
      title: string;
      list: string[];
    };

export const TERMS_SECTIONS: Section[] = [
  {
    id: 'General Use',
    title: '1. General Use',
    content:
      'The information provided on the platform is for informational and discovery purposes only and should not be considered as financial, legal, tax, or investment advice.',
  },
  {
    id: 'eligibility',
    title: '2. Eligibility',
    list: [
      'You must be at least 18 years of age to use the Platform.',
      'You must have the legal capacity to enter into binding agreements.',
      'Access to the Platform may be restricted or prohibited in certain jurisdictions due to applicable laws or regulations.',
    ],
  },
  {
    id: 'nature',
    title: '3. Nature of the Platform',
    list: [
      'Fracto operates solely as a technology platform.',
      'We are not a Channel Partner, dealer, investment advisor, or financial institution.',
      'The Platform does not provide guarantees regarding returns, income, capital preservation, or asset appreciation.',
    ],
  },
  {
    id: 'account',
    title: '4. User Account & Responsibility',
    list: [
      'You are responsible for maintaining the confidentiality of your login credentials and account access.',
      'All activities conducted through your account are deemed to be performed by you.',
      'You agree to provide accurate, complete, and up-to-date information at all times.',
    ],
  },
  {
    id: 'noncustodial',
    title: '5. Non-Custodial Disclaimer',
    list: [
      'Fracto does not custody or control user funds, private keys, or wallets.',
      'You are solely responsible for securing your wallet credentials and access keys.',
      'Loss of private keys may result in permanent loss of access, which cannot be recovered by the Platform.',
    ],
  },
  {
    id: 'risk',
    title: '6. Asset Information & Risk Disclosure',
    content:
      'Participation in real estate assets and blockchain-based systems involves inherent financial, legal, technical, and market risks. Asset values may fluctuate, and returns are not assured. Past performance of any asset or strategy is not indicative of future results.',
  },
  {
    id: 'advice',
    title: '7. No Investment Advice',
    content:
      'The information made available on the Platform is provided for general informational purposes only and does not constitute investment, legal, tax, or financial advice.',
  },
  {
    id: 'fees',
    title: '8. Fees & Charges',
    content:
      'Certain transactions on the Platform may be subject to service fees, network fees, or other charges. All applicable fees will be disclosed prior to transaction confirmation.',
  },
  {
    id: 'compliance',
    title: '9. Compliance & Verification',
    content:
      'Fracto may require users to complete identity verification, KYC, or other compliance checks.',
  },
  {
    id: 'prohibited',
    title: '10. Prohibited Activities',
    list: [
      'Engaging in fraudulent, deceptive, or illegal activities',
      'Providing false or misleading information',
      'Attempting to exploit, disrupt, or misuse the Platform or its systems',
    ],
  },
  {
    id: 'liability',
    title: '11. Limitation of Liability',
    content:
      'Use of the Platform is entirely at your own risk. Fracto shall not be liable for indirect or consequential losses.',
  },
  {
    id: 'ip',
    title: '12. Intellectual Property',
    content:
      'All platform content, trademarks, logos, and intellectual property are owned by or licensed to Fracto.',
  },
  {
    id: 'termination',
    title: '13. Suspension & Termination',
    content:
      'Access to the Platform may be suspended or terminated due to legal, policy, or security reasons.',
  },
  {
    id: 'privacy',
    title: '14. Privacy',
    content: 'User data is processed in accordance with our Privacy Policy.',
  },
  {
    id: 'amendments',
    title: '15. Amendments',
    content:
      'Continued use of the Platform indicates acceptance of updated Terms & Conditions.',
  },
  {
    id: 'law',
    title: '16. Governing Law & Jurisdiction',
    content:
      'These Terms are governed by the laws of India and subject to Indian courts.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Terms() {
  const [active, setActive] = useState<string>('introduction');
  const observer = useRef<IntersectionObserver | null>(null);
  const { role } = useSelector((state: RootState) => state.authLogin);

  useEffect(() => {
    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { rootMargin: '-40% 0px -50% 0px' }
    );

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.current?.observe(el);
    });

    return () => observer.current?.disconnect();
  }, []);

  return (
    <div
      className={`min-h-screen w-full text-[var(--fg)] font-work pb-20 px: lg:px-10 ${role === `corporateinvestor` ? 'pt-20 lg:pt-30' : 'pt-34.5 md:pt-35 lg:pt-44'}`}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-[1600px] flex gap-10"
      >
        <motion.aside
          variants={itemVariants}
          className="hidden lg:block w-[280px] "
        >
          <div className="sticky top-0 rounded-xl border border-[var(--fg)]/10 bg-[var(--card)] p-5">
            <h3 className="text-sm font-semibold text-[var(--fg)]/70 mb-4">
              On this page
            </h3>
            <ul className="space-y-2 text-sm max-h-[330px] 2xl:max-h-[500px] overflow-y-auto scrollbar-ui pr-2">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => {
                      document.getElementById(s.id)?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                      });
                    }}
                    className={`w-full text-left block rounded-md px-3 py-2 transition ${
                      active === s.id
                        ? 'bg-[var(--card)]  text-[var(--fg)]'
                        : 'text-[var(--fg)]/50 hover:text-[var(--fg)]'
                    }`}
                  >
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </motion.aside>

        <motion.main variants={itemVariants} className="flex-1">
          <div className="mb-4 flex flex-col gap-4 border-b border-[var(--fg)]/10 pb-6">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-semibold tracking-wide">
                Terms & Conditions
              </h1>
              <span className="rounded-full bg-[var(--card)]  px-3 py-1 text-xs text-[#7EA6FF] [var(--fg)]space-nowrap">
                Last updated · Jan 2026
              </span>
            </div>
            <p className="text-[var(--fg)]/60 max-w-3xl text-center sm:text-left">
              These Terms govern your access to and use of the Fracto
              platform. Please read them carefully.
            </p>
          </div>

          <div
            className="space-y-10 md:space-y-14 text-[var(--fg)]/85 leading-relaxed max-h-[350px] md:max-h-[400px] lg:max-h-[330px] xl:max-h-[400px]
                2xl:max-h-[500px] overflow-y-auto scrollbar-ui pr-3"
          >
            {TERMS_SECTIONS.map((section) => (
              <section id={section.id} key={section.id}>
                <h2 className="section-title font-semibold border-b border-[var(--fg)]/20 pb-4 mb-2">
                  {section.title}
                </h2>

                {'content' in section ? (
                  <p>{section.content}</p>
                ) : (
                  <ul className="list-disc pl-6 space-y-2">
                    {section.list.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </motion.main>
      </motion.div>
    </div>
  );
}
