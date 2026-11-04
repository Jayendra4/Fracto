import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function BackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    if (window.history.length > 1 && location.key !== 'default') {
      navigate(-1);
    } else {
      navigate('/', { replace: true });
    }
  };
  return (
    <Button aria-label="Go to home" variant="default" className="flex items-center gap-2" onClick={handleBack}>
      <ArrowLeft className="w-4 h-4" />
      Back
    </Button>
  );
}