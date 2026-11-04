type Props = {
  step: number;
  totalSteps: number;
};

export default function CircleProgress({ step, totalSteps }: Props) {
  const percent = (step / totalSteps) * 100;

  return (
    <div className="relative w-[55px] h-[55px] md:w-[90px] md:h-[90px] mb-4">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `
            conic-gradient(
              #32D25E ${percent}%,
              #D3D3D3 ${percent}% 100%
            )
          `,
          WebkitMask:
            'radial-gradient(farthest-side, transparent calc(100% - 6px), black 0)', 
          mask: 'radial-gradient(farthest-side, transparent calc(100% - 6px), black 0)',
        }}
      />

      <div className="absolute inset-[8px] bg-transparent rounded-full flex flex-col items-center justify-center text-white">
        <p className="text-[12px] md:text-xl font-semibold">
          {step}/{totalSteps}
        </p>
      </div>
    </div>
  );
}
