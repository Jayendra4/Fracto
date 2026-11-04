import AssetOwnerBenefits from '@/components/AssetOwner/AssetOwnerBenefits';
import AssetOwnerJourney from '@/components/AssetOwner/AssetOwnerJourney';
import AssetReviewFraction from '@/components/AssetOwner/AssetReviewFraction';
import AssetSecurityGovernance from '@/components/AssetOwner/AssetSecurityGovernance';
import AssetHero from '@/components/AssetOwner/Hero';
import PostApproval from '@/components/AssetOwner/PostApproval';
import TransformAssetCTA from '@/components/AssetOwner/TransformAssetCTA';
import WhoIsAssetOwner from '@/components/AssetOwner/WhoIsAssetOwner';

function AssetOwner() {
  return (
    <div className="min-h-screen w-full">
      <AssetHero />
      <WhoIsAssetOwner />
      <AssetOwnerJourney />
      <PostApproval />
      <AssetOwnerBenefits />
      <AssetReviewFraction />
      <AssetSecurityGovernance />
      <TransformAssetCTA />
    </div>
  );
}

export default AssetOwner;
