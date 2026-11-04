import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiZoomIn, FiZoomOut, FiRefreshCw } from 'react-icons/fi';

interface Props {
  open: boolean;
  url: string;
  onClose: () => void;
}

export default function DocumentPreviewModal({ open, url, onClose }: Props) {
  useEffect(() => {
    if (!open) return;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [open]);

  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!open) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!open) return null;

  const isPdf = url.toLowerCase().endsWith('.pdf');

  const zoomIn = () => setScale((s) => Math.min(s + 0.2, 3));
  const zoomOut = () => setScale((s) => Math.max(s - 0.2, 1));
  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (scale === 1) return;
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return;
    setPosition((p) => ({
      x: p.x + e.clientX - lastPos.current.x,
      y: p.y + e.clientY - lastPos.current.y,
    }));
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const stopDrag = () => (dragging.current = false);

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();

    if (e.deltaY < 0) {
      zoomIn();
    } else {
      zoomOut();
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-6xl rounded-2xl bg-gradient-to-b from-[#061a2d] to-[#041221] shadow-2xl overflow-hidden border border-white/10">
        <div className="flex items-center justify-between px-5 py-3 bg-white/5 backdrop-blur border-b border-white/10">
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <span className="font-medium">Document Preview</span>
            {/* <span className="text-white/40">•</span> */}
            {/* <span className="uppercase text-xs">{isPdf ? 'PDF' : 'Image'}</span> */}
          </div>

          <div className="flex items-center gap-2">
            <ToolbarButton onClick={zoomIn} icon={<FiZoomIn />} />
            <ToolbarButton onClick={zoomOut} icon={<FiZoomOut />} />
            <ToolbarButton onClick={resetZoom} icon={<FiRefreshCw />} />
            <ToolbarButton onClick={onClose} icon={<FiX />} danger />
          </div>
        </div>

        <div
          className="relative h-[75vh] overflow-hidden flex items-center justify-center bg-black/20"
          onWheel={onWheel}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={stopDrag}
          onMouseLeave={stopDrag}
        >
          <div
            className="transition-transform duration-150 ease-out"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              cursor: scale > 1 ? 'grab' : 'default',
            }}
          >
            {isPdf ? (
              <iframe
                src={url}
                className="w-[960px] h-[70vh] rounded-lg bg-white shadow-xl"
              />
            ) : (
              <img
                src={url}
                className="max-h-[70vh] object-contain rounded-lg shadow-xl"
                draggable={false}
              />
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function ToolbarButton({
  icon,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-9 h-9 flex items-center justify-center rounded-lg transition
        ${
          danger
            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
            : 'bg-white/10 text-white/80 hover:bg-white/20'
        }`}
    >
      {icon}
    </button>
  );
}
