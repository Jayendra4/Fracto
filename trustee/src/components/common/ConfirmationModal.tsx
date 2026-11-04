import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative z-50 w-full max-w-md rounded-2xl border border-[#27272a] bg-[#141416] p-6 shadow-2xl transition-all">
        <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>

        <p className="mt-3 text-xs leading-relaxed text-[#9898a0]">{description}</p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#27272a] bg-[#1e1e24] px-4 py-2 text-xs font-semibold text-gray-300 transition hover:bg-[#2a2a32] hover:text-white"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`rounded-lg px-4 py-2 text-xs font-semibold text-white transition shadow-md ${
              confirmVariant === 'danger'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-[#2563eb] hover:bg-[#1d4ed8]'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
