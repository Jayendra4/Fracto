import HowItWorkCTA from './HowItWorkCTA';
import HowItWorkHero from './HowItWorkHero';
import JourneySection from './JourneySection';
import ParticipantsSection from './ParticipantsSection';
import ComplianceSection from './ComplianceSection';
// import Property from "@/components/Landing/Property";
import WhyHouseOfFrac from './WhyHouseOfFrac';

export default function HowItWork() {
  return (
    <>
      <HowItWorkHero />
      <JourneySection />
      {/* <Property /> */}
      <ParticipantsSection />
      <WhyHouseOfFrac />
      <ComplianceSection />
      <HowItWorkCTA />
    </>
  );
}
