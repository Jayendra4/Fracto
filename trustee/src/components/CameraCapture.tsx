import { useEffect, useRef, useState } from 'react';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    let localStream: MediaStream;

    async function startCamera() {
      localStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
      });

      setStream(localStream);

      if (videoRef.current) {
        videoRef.current.srcObject = localStream;
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-[#101010] p-4 rounded-lg w-[90%] max-w-md text-white">
        <video ref={videoRef} autoPlay className="w-full rounded-lg" />

        <canvas ref={canvasRef} className="hidden" />

        <div className="flex justify-between mt-4">
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="px-4 py-2 bg-gray-600 rounded-md"
          >
            Close
          </button>

          <button onClick={takePhoto} className="px-4 py-2 bg-blue-600 rounded-md">
            Capture
          </button>
        </div>
      </div>
    </div>
  );
}
