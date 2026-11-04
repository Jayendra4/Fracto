import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function BackButton() {
  const navigate = useNavigate();

  return (
    <Button variant="default" className="flex items-center gap-2" onClick={() => navigate(-1)}>
      <ArrowLeft className="h-4 w-4" />
      Back
    </Button>
  );
}
