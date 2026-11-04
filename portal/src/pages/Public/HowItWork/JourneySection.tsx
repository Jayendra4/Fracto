import { motion } from 'framer-motion';

type Step = {
  title: string;
  description: string;
};

const steps: Step[] = [
  {
    title: 'Create Your Account',
    description:
      'Register as a Investor, Asset Owner, or Channel Partner. Profile setup is free, takes under five minutes, and provides access to the platform to explore the onboarding process at your own pace.',
  },
  {
    title: 'Complete KYC Verification',
    description:
      'All Investors must complete mandatory KYC verification, including identity and address checks. Businesses and institutions undergo additional KYB and AML due diligence to maintain a trusted ecosystem.',
  },
  {
    title: 'Join a Club',
    description:
      "After KYC approval, apply to join one or more Clubs. Club membership provides access to opportunities aligned with the Club's objectives and member profile.",
  },
  {
    title: 'Browse Opportunities Within Your Club',
    description:
      'Explore opportunities available within your Club. Each listing includes asset details, participation structure, returns, legal documents, risks, exit options, and asset owner information.',
  },
  {
    title: 'Club-Level Due Diligence',
    description:
      'Review asset documentation, financial projections, legal summaries, and risk disclosures provided by the Club. Members should evaluate all materials carefully before making participation decisions.',
  },
  {
    title: 'Club Vote on Asset',
    description:
      "Eligible Club members vote on whether an asset advances to the subscription stage. Voting requirements and approval thresholds are defined in the Club's governing terms.",
  },
  {
    title: 'SPV Formation',
    description:
      'If approved, a Special Purpose Vehicle (SPV) is established to hold the asset. The SPV structure provides legal separation, defined rights, and clear ownership documentation.',
  },
  {
    title: 'Subscription',
    description:
      'Eligible members complete required agreements and transfer their participation amount through approved banking channels to the designated escrow, SPV, or collection account.',
  },
  {
    title: 'Allotment',
    description:
      'Once funds and documentation are verified, participation is formally allotted and recorded. Members receive confirmation in accordance with applicable procedures.',
  },
  {
    title: 'Access Your Co-owner Dashboard',
    description:
      'View participation details, asset updates, documents, distribution statements, and support resources through your dashboard, along with periodic asset performance updates.',
  },
  {
    title: 'Exit or Transfer Your Participation',
    description:
      'At the end of the tenure or under agreed terms, members may exit through approved mechanisms such as transfers, resale opportunities, or asset sale processes defined in the documentation.',
  },
];

export default function JourneySection() {
  return (
    <section className="bg-[var(--inner-card)] py-20  px-4 lg:px-10 font-work">
      <div className="mx-auto max-w-[1600px] text-[var(--fg)]">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="font-48 font-semibold "
          >
            Your Journey to Structured Real Estate Participation
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
            className="mt-2 font-24 max-w-[700px] mx-auto text-[var(--fg)]/70"
          >
            A transparent, KYC-verified, document-backed path -- from the moment
            you register to the moment you receive your first distribution and
            beyond.
          </motion.p>
        </div>

        <div className="flex flex-col gap-6 lg:gap-8 max-w-[1400px] mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 w-full">
            {steps.map((step, index) => (
              <StepCard key={index} index={index + 1} {...step} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const StepCard: React.FC<Step & { index: number }> = ({
  title,
  description,
  index,
}) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 40,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.6,
        ease: 'easeOut',
      }}
      className="rounded-[2rem] border border-[var(--fg)]/10 p-8 flex flex-col items-center text-center transition-all hover:scale-105 hover:border-blue-400/50 hover:shadow-lg bg-[var(--card)] w-full h-full group"
    >
      <div className="mb-6 flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-transparent flex items-center justify-center text-blue-500 font-28 font-bold border border-blue-500/20 group-hover:scale-110 transition-transform duration-300">
        {index}
      </div>
      <h3 className="font-28 font-semibold text-[var(--fg)] mb-3">{title}</h3>
      <p className="font-16 text-[var(--fg)]/70 text-center leading-relaxed font-light">
        {description}
      </p>
    </motion.div>
  );
};
