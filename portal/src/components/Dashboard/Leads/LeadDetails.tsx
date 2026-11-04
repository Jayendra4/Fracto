import HandleBack from '@/components/UI/Handleback';
import { ComplianceCard } from './complianceCard';
import { useParams, useLocation } from 'react-router-dom';
import { useActivities } from '@/api/activity.api';
import Loader from '@/components/Loader';
import { useLeadDetails } from '@/api/leadsDetails.api';
import { FiChevronDown } from 'react-icons/fi';
import { useState } from 'react';

export default function LeadDetails() {
  const { leadId } = useParams();
  const location = useLocation();
  const stateId = location.state?.id;
  const referredUserId = location.state?.referredUserId || leadId;

  // Fetch lead details using the id passed via state
  const { data: leadRes, isLoading: isLeadLoading } = useLeadDetails(
    stateId || 0
  );
  const leadData = leadRes?.success === true ? leadRes.data : null;

  // Fetch activities using the referredUserId from state
  const { data: activitiesRes, isLoading: isActivityLoading } = useActivities({
    accountId: referredUserId || 0,
  });
  const activities =
    activitiesRes?.success === true ? activitiesRes?.data?.data : [];

  if (isLeadLoading || isActivityLoading) {
    return <Loader />;
  }

  // Use API data if available, otherwise show not found
  const user = leadData?.user;
  const kyc = user?.kyc;
  const address = kyc?.address;

  if (!leadData) {
    return (
      <div className="text-center py-20 text-[var(--fg)]/60">
        Lead not found
      </div>
    );
  }

  return (
    <section className="w-full text-[var(--fg)] font-work pt-38 lg:pt-44 pb-20 ">
      <div className="px-4 lg:px-10">
        <div className="p-4 md:p-6 max-w-[1600px] mx-auto space-y-6 bg-[var(--inner-card)] border border-[var(--fg)]/5 shadow-sm rounded-xl w-full">
          <div className="flex items-center justify-between pt-4 pb-8 border-b border-[var(--fg)]/10">
            <div className="flex items-center gap-4">
              <img
                src={'/images/f-avatar.svg'}
                className="w-18 h-18 rounded-full object-cover"
                alt={user?.name}
              />
              <div>
                <h1 className="font-32 ">{user?.name}</h1>
                <p className="font-14 text-[var(--fg)]/70">
                  HOF ID: HOF-{user?.id}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-8">
              <HandleBack />
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-4 w-full">
            <div className=" lg:col-span-4 space-y-6 lg:pr-6 lg:border-r lg:border-[var(--fg)]/10">
              <Card title="Basic Details">
                <LabelValue label="Email" value={user?.email} />
                <LabelValue label="Mobile Number" value={user?.mobile} />
                <LabelValue
                  label="Country"
                  value={
                    address ? `${address.city}, ${address.state}` : 'India'
                  }
                />
              </Card>
            </div>
            <div className="lg:col-span-5 w-full lg:pr-5 lg:border-r lg:border-[var(--fg)]/10">
              <div className="lg:p-4 rounded-xl space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-24 font-medium text-[var(--fg)]">
                      Compliance Checklist
                    </h3>
                  </div>
                  <div className="w-full border-b border-[var(--fg)]/20" />
                </div>

                <div className="space-y-3">
                  <ComplianceCard
                    title="Investor KYC"
                    description="Government-issued ID and address proof verified"
                    status={
                      kyc?.status === 'Approved' ? 'completed' : 'pending'
                    }
                  />

                  {/* <ComplianceCard
                    title="Risk Disclosure Signed"
                    description="Investor has acknowledged investment risks"
                    status="completed"
                  />

                  <ComplianceCard
                    title="Payment Readiness"
                    description="Payment method verified and ready"
                    status="pending"
                  />

                  <ComplianceCard
                    title="Risk Disclosure Signed"
                    description="Investor has acknowledged investment risks"
                    status="completed"
                  /> */}
                </div>
              </div>
            </div>

            <Card
              title="Activity Timeline"
              collapsible
              defaultOpen={true}
              className="lg:col-span-3"
            >
              <div className="mt-4">
                {activities?.map((item: any, index: number) => (
                  <TimelineItem
                    key={item.id}
                    title={item.label || item.metadata?.message || item.type}
                    timestamp={new Date(item.createdAt).toLocaleString()}
                    isLast={index === activities?.length - 1}
                  />
                ))}
                {activities?.length === 0 && (
                  <div className="text-[var(--fg)]/60 text-sm">
                    No activities found.
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
function Card({
  title,
  action,
  children,
  collapsible = false,
  defaultOpen = true,
  className = '',
}: any) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggleCard = () => {
    if (collapsible) {
      setIsOpen((prev: boolean) => !prev);
    }
  };

  return (
    <div
      className={`bg-[var(--inner-card)] border border-[var(--fg)]/5 shadow-sm p-4 rounded-xl space-y-4 ${className}`}
    >
      <div
        className={`flex justify-between items-center ${
          collapsible ? 'cursor-pointer' : ''
        }`}
        onClick={toggleCard}
      >
        <h3 className="font-24 font-medium">{title}</h3>

        <div className="flex items-center gap-3">
          {action}

          {collapsible && (
            <FiChevronDown
              className={`transition-transform duration-300 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          )}
        </div>
      </div>

      <div className="w-full border-b border-[var(--fg)]/20" />

      {(!collapsible || isOpen) && children}
    </div>
  );
}

function LabelValue({ label, value }: any) {
  return (
    <div className="flex gap-2">
      <p className="font-16 text-[var(--fg)]/60">
        {label}
        {':'}
      </p>
      <p className="font-16 text-[var(--fg)]">{value}</p>
    </div>
  );
}

interface TimelineItemProps {
  title: string;
  timestamp: string;
  isLast?: boolean;
}

export function TimelineItem({ title, timestamp, isLast }: TimelineItemProps) {
  return (
    <div className="flex gap-4">
      <div className="relative flex flex-col items-center">
        <div className="h-6 w-6 p-1 bg-green/12 rounded-full flex items-center justify-center shrink-0">
          <div className="rounded-full h-3 w-3  bg-green shrink-0" />
        </div>
        {!isLast && <div className="w-px flex-1 bg-green" />}
      </div>
      <div className="pb-8 space-y-2">
        <p className="font-16 font-semibold text-[var(--fg)]">{title}</p>
        <p className="text-xs text-[var(--fg)]/70">{timestamp}</p>
      </div>
    </div>
  );
}

// import { FiCheckCircle, FiUser } from 'react-icons/fi';
// type Status = 'pending' | 'completed';

// interface ComplianceCardProps {
//   title: string;
//   description: string;
//   status: Status;
// }

// export function ComplianceCard({
//   title,
//   description,
//   status,
// }: ComplianceCardProps) {
//   const isCompleted = status === 'completed';

//   return (
//     <div className="flex items-center justify-between rounded-xl border border-white/10 px-5 py-4">
//       <div className="flex items-start gap-4">
//         <div
//           className={`flex h-10 w-10 items-center justify-center rounded-lg ${
//             isCompleted
//               ? 'bg-green-500/12 text-green-400'
//               : 'bg-[#E56B00]/12 text-[#E56B00]'
//           }`}
//         >
//           {isCompleted ? (
//             <FiCheckCircle className="text-lg" />
//           ) : (
//             <FiUser className="text-lg" />
//           )}
//         </div>

//         <div>
//           <p className="font-16 font-semibold text-white">{title}</p>
//           <p className="font-14 text-white/70">{description}</p>
//         </div>
//       </div>

//       <span
//         className={`inline-flex items-center gap-2 px-3 py-1 rounded-md border text-xs ${
//           isCompleted
//             ? 'bg-green/12 text-green'
//             : 'bg-[#E56B00]/12 text-[#E56B00]'
//         }`}
//       >
//         <span
//           className={`h-2 w-2 rounded-full ${
//             isCompleted ? 'bg-green' : 'bg-[#E56B00]'
//           }`}
//         />
//         {isCompleted ? 'Completed' : 'Pending'}
//       </span>
//     </div>
//   );
// }
