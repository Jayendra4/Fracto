import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomButton from '@/components/Base/CustomButton';
import { HiX, HiCamera, HiSparkles } from 'react-icons/hi';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

export default function CameraCapture({
  onCapture,
  onClose,
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const isLocalOrStaging =
    window.location.hostname === 'localhost' ||
    window.location.hostname.includes('staging') ||
    window.location.hostname.includes('127.0.0.1');

  useEffect(() => {
    let localStream: MediaStream | null = null;

    async function startCamera() {
      try {
        localStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
        });

        setStream(localStream);

        if (videoRef.current) {
          videoRef.current.srcObject = localStream;
        }
      } catch (err: any) {
        console.error('Camera access error:', err);
        setError('Could not access camera. Please check permissions.');
      }
    }

    startCamera();

    return () => {
      localStream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const stopCamera = () => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    setIsCapturing(true);
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) return;

      const file = new File([blob], 'selfie.jpg', {
        type: 'image/jpeg',
      });

      onCapture(file);
      stopCamera();
      onClose();
    }, 'image/jpeg');
  };

  const dummyCapture = async () => {
    // Generate a simple dummy image for local/staging
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, 640, 480);
      ctx.fillStyle = '#38bdf8';
      ctx.font = '24px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('STAGING / LOCAL DUMMY SELFIE', 320, 240);
    }

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], 'dummy-selfie.jpg', { type: 'image/jpeg' });
      onCapture(file);
      stopCamera();
      onClose();
    }, 'image/jpeg');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999] p-4 font-work"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-[var(--card)] border border-[var(--fg)]/10 rounded-3xl overflow-hidden w-full max-w-2xl shadow-2xl relative"
        >
          {/* Header */}
          <div className="p-6 border-b border-[var(--fg)]/5 flex justify-between items-center bg-gradient-to-r from-[var(--fg)]/5 to-transparent">
            <div>
              <h2 className="text-2xl font-semibold text-[var(--fg)]">Capture Selfie</h2>
              <p className="text-[var(--fg)]/50 text-sm mt-1">Please ensure your face is clearly visible</p>
            </div>
            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="p-2 rounded-full hover:bg-[var(--fg)]/10 text-[var(--fg)] transition-colors"
            >
              <HiX className="text-2xl" />
            </button>
          </div>

          <div className="p-4 lg:p-8">
            <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-[var(--fg)]/10 shadow-inner group">
              {error ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                    <HiX className="text-3xl" />
                  </div>
                  <p className="text-red-500 font-medium">{error}</p>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover mirror"
                    style={{ transform: 'scaleX(-1)' }} // Mirror the selfie view
                  />
                  {!stream && !error && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 border-4 border-[var(--fg)]/20 border-t-[var(--fg)]/80 rounded-full animate-spin" />
                    </div>
                  )}
                  {/* Overlay Guides */}
                  <div className="absolute inset-0 border-[60px] md:border-[100px] border-black/40 pointer-events-none">
                    <div className="w-full h-full rounded-full border-2 border-dashed border-white/50 animate-pulse" />
                  </div>
                </>
              )}
            </div>

            <canvas ref={canvasRef} className="hidden" />

            <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex gap-4 w-full sm:w-auto">
                {isLocalOrStaging && (
                  <CustomButton
                    variant="outline"
                    onClick={dummyCapture}
                    className="flex-1 sm:flex-none border-dashed border-sky-500/50 hover:bg-sky-500/10 text-sky-500"
                  >
                    <HiSparkles className="mr-2 text-lg" />
                    Dummy Capture
                  </CustomButton>
                )}
                <CustomButton
                  variant="outline"
                  onClick={() => {
                    stopCamera();
                    onClose();
                  }}
                  className="flex-1 sm:flex-none"
                >
                  Cancel
                </CustomButton>
              </div>

              <CustomButton
                disabled={!stream || isCapturing}
                onClick={takePhoto}
                variant="formButton"
                className="w-full sm:w-auto min-w-[180px] shadow-lg shadow-blue-500/20"
              >
                {isCapturing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Capturing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <HiCamera className="text-xl" />
                    Take Photo
                  </div>
                )}
              </CustomButton>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
