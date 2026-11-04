import { useEffect, useRef, useState } from 'react';
import { FiCamera } from 'react-icons/fi';

interface Props {
  onCapture: (file: File) => void;
}

export default function SelfieCapture({ onCapture }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isCameraOn, setIsCameraOn] = useState(false);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });

      streamRef.current = mediaStream;

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }

      setIsCameraOn(true);
    } catch (err) {
      console.error('Camera access denied', err);
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }

    setIsCameraOn(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

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
    }, 'image/jpeg');
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div
      className="flex flex-col items-center justify-center
      gap-4 border border-dashed border-white/20
      rounded-xl py-20 relative"
    >
      {!isCameraOn ? (
        <button
          onClick={startCamera}
          className="flex flex-col items-center gap-2"
        >
          <FiCamera className="text-3xl text-white/50" />
          <span className="px-4 py-1.5 rounded-md border border-white/20 text-xs">
            Open Camera
          </span>
        </button>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover rounded-lg"
          />

          <button
            onClick={capturePhoto}
            className="absolute bottom-4
              px-6 py-2 rounded-md bg-blue-600 text-sm"
          >
            Capture
          </button>
        </>
      )}

      <canvas ref={canvasRef} hidden />
    </div>
  );
}
