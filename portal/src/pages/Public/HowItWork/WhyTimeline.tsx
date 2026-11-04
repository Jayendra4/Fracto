type TimelineItem = {
  label: string;
  active?: boolean;
};

const items: TimelineItem[] = [
  { label: 'Curated, documentation-ready asset opportunities', active: true },
  {
    label: 'SPV-based participation structure with defined Investor rights',
  },
  { label: 'Independent trustee oversight where applicable' },
  { label: 'Mandatory KYC and AML compliance for every participant' },
  { label: 'End-to-end digital experience — from onboarding to distributions' },
  {
    label: 'Transparent reporting accessible through your Investor dashboard',
  },
  { label: 'Full risk disclosures provided before any commitment is made' },
  {
    label:
      'Structured exit frameworks defined clearly in transaction documentation',
  },
];

export default function WhyTimeline() {
  return (
    <div className="relative  p-10 text-white w-full max-w-xl font-work">
      <div className="absolute left-4 top-4 h-[calc(100%-2rem)] w-px bg-white/40" />

      <div className="absolute left-[10px] top-3 h-3 w-3 rotate-45 bg-white" />

      <ul className="space-y-10 ml-2">
        {items.map((item, index) => (
          <li key={index} className="relative">
            <div className="absolute -left-10 top-1/2 h-[2px] w-10 bg-gradient-to-r from-[#14375B] via-[#CCCCCC] to-[#14375B]" />
            <div className="inline-block rounded-xl  hover:bg-[#4C82B8]/80 hover:shadow-lg transition-all duration-300 px-4 py-3 text-15 lg:text-15 font-medium text-white border border-transparent hover:border-white/20">
              {item.label}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
