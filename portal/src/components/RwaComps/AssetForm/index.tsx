import RwaAssetForm from '@/components/Form/RwaAssetForm';
import {
  assetGroup1,
  assetGroup2,
  assetGroup3,
  assetGroup4,
} from '@/constants/rwa';

export default function AssetForm({ onSubmit }: any) {
  return (
    <RwaAssetForm
      group1={assetGroup1}
      group2={assetGroup2}
      group3={assetGroup3}
      group4={assetGroup4}
      onSubmit={onSubmit}
      button={{ label: 'Save & Continue', variant: 'primary' }}
    />
  );
}
