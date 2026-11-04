import { useState, type JSX } from 'react';
import SourcingAddAsset from './SourcingAddAsset';

export default function ListAnAssetTab(): JSX.Element {
  const [aaIndex, setAaIndex] = useState(1);

  const showConfirm = (title: string, text: string, onConfirm: () => void) => {
    if (window.confirm(`${title}\n\n${text}`)) {
      onConfirm();
    }
  };

  return (
    <SourcingAddAsset
      aaIndex={aaIndex}
      setAaIndex={setAaIndex}
      showConfirm={showConfirm}
    />
  );
}
