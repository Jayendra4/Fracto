import Benefits from '@/components/Broker/Benefits';
import Bridge from '@/components/Broker/Bridge';
import BrokerDashboardPortal from '@/components/Broker/BrokerDashboardPortal';
import BrokerOverview from '@/components/Broker/BrokerOverview';
import BrokerPortal from '@/components/Broker/BrokerPortal';
import Capabilities from '@/components/Broker/Capabilities';
import Hero from '@/components/Broker/Hero';
import Security from '@/components/Broker/Security';
import CommunityOfHouse from '@/components/CommunityOfHouse';

function Broker() {
  return (
    <div className="min-h-screen">
      <Hero />
      <CommunityOfHouse />
      <BrokerOverview />
      <BrokerPortal />
      <BrokerDashboardPortal />
      <Capabilities />
      <Benefits />
      <Security />
      <Bridge />
    </div>
  );
}

export default Broker;
