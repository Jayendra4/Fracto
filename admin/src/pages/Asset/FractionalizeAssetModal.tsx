import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

interface FractionalizeAssetModalProps {
  open: boolean;
  onClose: () => void;
  loading?: boolean;
  marketValue?: number;
  onConfirm: (payload: { totalFractions: number; pricePerFraction: number }) => void;
}

export function FractionalizeAssetModal({
  open,
  onClose,
  onConfirm,
  marketValue,
  loading,
}: FractionalizeAssetModalProps) {
  const [totalFractions, setTotalFractions] = useState('');
  const [pricePerFraction, setPricePerFraction] = useState('');
  const [lastEdited, setLastEdited] = useState<'fractions' | 'price' | null>(null);

  const isFractionsDisabled = lastEdited === 'price' && !!pricePerFraction;
  const isPriceDisabled = lastEdited === 'fractions' && !!totalFractions;
  const handleCloseModal = () => {
    setTotalFractions('');
    setPricePerFraction('');
    onClose();
  };

  const sanitizeInteger = (value: string) => {
    // sirf digits allow karega
    return value.replace(/[^0-9]/g, '');
  };

  const handleFractionsChange = (value: string) => {
    const cleanValue = sanitizeInteger(value);

    if (!cleanValue) {
      setTotalFractions('');
      setPricePerFraction('');
      setLastEdited(null); // 👈 reset
      return;
    }

    setLastEdited('fractions');
    setTotalFractions(cleanValue);

    const fractions = Number(cleanValue);

    if (marketValue && fractions > 0) {
      const price = Math.floor(marketValue / fractions);
      setPricePerFraction(price.toString());
    }
  };

  const handlePriceChange = (value: string) => {
    const cleanValue = sanitizeInteger(value);

    if (!cleanValue) {
      setPricePerFraction('');
      setTotalFractions('');
      setLastEdited(null); // 👈 reset
      return;
    }

    setLastEdited('price');
    setPricePerFraction(cleanValue);

    const price = Number(cleanValue);

    if (marketValue && price > 0) {
      const fractions = Math.floor(marketValue / price);
      setTotalFractions(fractions.toString());
    }
  };
  const handleSubmit = () => {
    onConfirm({
      totalFractions: Number(totalFractions),
      pricePerFraction: Number(pricePerFraction),
    });

    setTotalFractions('');
    setPricePerFraction('');
  };

  return (
    <Dialog open={open} onOpenChange={handleCloseModal}>
      <DialogContent className="max-w-md border border-input">
        <DialogHeader>
          <DialogTitle>Fractionalize Asset</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Market Value</Label>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="Enter total market value"
              value={marketValue}
              disabled
            />
          </div>
          <div className="space-y-2">
            <Label>Total Fractions</Label>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="Enter total fractions"
              value={totalFractions}
              disabled={isFractionsDisabled}
              // onChange={(e) => setTotalFractions(e.target.value)}
              onChange={(e) => handleFractionsChange(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Price per Fraction</Label>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="Enter price per fraction"
              value={pricePerFraction}
              disabled={isPriceDisabled}
              // onChange={(e) => setPricePerFraction(e.target.value)}
              onChange={(e) => handlePriceChange(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={handleCloseModal} disabled={loading}>
            Cancel
          </Button>
          <Button
            disabled={
              loading ||
              !totalFractions ||
              !pricePerFraction ||
              Number(totalFractions) <= 0 ||
              Number(pricePerFraction) <= 0
            }
            onClick={handleSubmit}
          >
            Fractionalize
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
