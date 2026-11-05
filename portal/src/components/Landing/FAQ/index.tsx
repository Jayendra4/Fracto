import { useState, type JSX } from 'react';
import { CiCirclePlus } from 'react-icons/ci';
import { motion } from 'framer-motion';

interface FAQItem {
  q: string;
  a: string;
}

const faqs: FAQItem[] = [
  {
    q: 'What is Fracto?',
    a: 'Fracto is a technology-enabled platform that connects Investor with structured, professionally verified real estate participation opportunities in India. We make high-quality real estate accessible — with complete documentation, KYC compliance, and digital dashboards — starting at participation amounts that do not require large-ticket capital deployment.',
  },
  {
    q: 'How is participation structured legally?',
    a: 'Each asset opportunity is structured through a Special Purpose Vehicle — a dedicated legal entity (private limited company or LLP) that holds the underlying property. Investor hold equity shares or in any other form in the SPV, as defined in the participation documents. This structure is governed by the Companies Act, 2013 or LLP Act, 2008.',
  },
  {
    q: 'What is the minimum participation amount?',
    a: 'The minimum participation amount varies by asset opportunity and is disclosed clearly in each asset listing. All minimums are specified in the asset documentation before any commitment is required.',
  },
  {
    q: 'Are the returns guaranteed?',
    a: 'No. Projected returns shown in asset listings are indicative estimates based on available data at the time of listing. Actual returns may vary depending on asset performance, market conditions, and other factors. We encourage all Investor to read the risk disclosures for each opportunity carefully before participating.',
  },
  {
    q: 'What happens to my participation if Fracto shuts down?',
    a: "Your participation is in the SPV that holds the underlying asset — not in Fracto directly. The SPV is an independent legal entity that continues to exist irrespective of the platform's operational status. In such a scenario, the SPV, trustee arrangements, and applicable law govern the continued management and exit of the asset.",
  },
  {
    q: 'How do I exit my participation?',
    a: 'Exit options are defined in the individual transaction documentation for each asset which may include share transfer to other members, resale through the platform’s member bulletin board, or asset sale by SPV shareholder vote. Your exit path is clearly specified before you commit.',
  },
  {
    q: 'Is my personal data safe?',
    a: 'Fracto collects and processes personal data in compliance with applicable Indian data protection laws, as described in our Privacy Policy. KYC documents and financial details are stored securely and shared only with authorised parties for transaction processing, regulatory compliance, or legal obligations.',
  },
  {
    q: 'How do I get support?',
    a: 'You can write to us at support@fracto.com or use the Contact Us form on the website. We aim to respond to all queries within two business days.',
  },
];

export default function FAQSection(): JSX.Element {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number): void => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id="faq"
      className="w-full bg-[var(--bg)] py-10 lg:py -16 font-work scroll-mt-10 px-4 lg:px-10"
    >
      <div className="max-w-[1600px] mx-auto ">
        <div className="flex flex-col items-center mt-5 justify-center pb-10">
          <motion.h2
            initial={{ opacity: 0, filter: 'blur(12px)', y: 20 }}
            whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{
              duration: 0.8,
              ease: 'easeOut',
            }}
            className="text-[var(--fg)]  font-44 font-semibold"
          >
            Frequently Asked Questions
          </motion.h2>
        </div>
        <div className=" mx-auto space-y-6 ">
          {faqs.map((item, index) => (
            <div key={index} className="group  pb-4">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center text-start text-[var(--fg)] font-24 shrink-0"
              >
                {item.q}
                <CiCirclePlus
                  size={32}
                  className={`text-[20px] transition-transform duration-400 ease-in-out text-[#4F86C0] cursor-pointer hover:scale-105 shrink-0 ${openIndex === index ? 'rotate-135' : ''}`}
                />
              </button>
              <div
                className={`transition-all overflow-hidden duration-300 text-[var(--fg)] text-justify ${
                  openIndex === index ? ' mt-4' : 'max-h-0'
                }`}
              >
                {item.a}
              </div>
              <div className="w-full mt-5">
                <div className="h-[1px] bg-[#4F86C0] scale-x-100 origin-left transition-transform duration-1600 ease-in-out group-hover:scale-x-0" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
