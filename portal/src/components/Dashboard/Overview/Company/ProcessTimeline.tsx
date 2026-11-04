import { TimelineStep } from "./TimelineStep";


type TimelineStatus = 'completed' | 'active' | 'pending';

type TimelineItem = {
  title: string;
  subtitle?: string;
  status: TimelineStatus;
};

type ProcessTimelineProps = {
  heading: string;
  subheading: string;
  items: TimelineItem[];
};

export default function ProcessTimeline({
  heading,
  subheading,
  items,
}: ProcessTimelineProps) {
  return (
    <div className="rounded-xl bg-gradient-to-b from-[var(--dark-card)] to-[var(--card)] border border-white/10 p-5 text-[var(--fg)]  font-work">
      <div className="mb-5">
        <p className="font-20 font-normal">{heading}</p>
        <p className="font-16 ">{subheading}</p>
      </div>
      <div className="h-px bg-dark-grey my-4" />
      <div className="relative pl-6 ">
        {items.map((item, index) => (
          <TimelineStep
            key={index}
            title={item.title}
            subtitle={item.subtitle}
            status={item.status}
          />
        ))}
      </div>
    </div>
  );
}
