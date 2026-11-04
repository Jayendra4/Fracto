import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false
}: ConfirmationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border border-slate-800 text-white max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-white font-display">{title}</DialogTitle>
          <DialogDescription className="text-slate-400 text-sm mt-2 whitespace-pre-line leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6 flex flex-row gap-3 justify-end">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="font-semibold text-xs h-9 border-slate-800 hover:bg-slate-800 text-slate-300 px-4"
          >
            {cancelLabel}
          </Button>
          <Button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            variant={isDestructive ? 'destructive' : 'default'}
            className="font-semibold text-xs h-9 px-4"
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
