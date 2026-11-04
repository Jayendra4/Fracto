import BenefitsFractional from '@/components/CorporateInvestor/BenefitsFractional';
import Hero from '@/components/CorporateInvestor/Hero';
import InvestNow from '@/components/CorporateInvestor/InvestNow';
import InvestorOnboarding from '@/components/CorporateInvestor/InvestorOnboarding';
import WhoIsCI from '@/components/CorporateInvestor/WhoIsCI';
import WhyChooseHF from '@/components/CorporateInvestor/WhyChooseHF';
import CommunityOfHouse from '@/components/CommunityOfHouse';

function CorporateInvestor() {
  return (
    <div className="min-h-screen">
      <Hero />
      <CommunityOfHouse />
      <WhoIsCI />
      <InvestorOnboarding />
      <BenefitsFractional />
      <WhyChooseHF />
      <InvestNow />
    </div>
  );
}

export default CorporateInvestor;
