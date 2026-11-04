export default function SignupProgressBar({ progress }: { progress: number }) {
  return (
    <div className="md:absolute bottom-0 left-0 w-full lg:w-1/2 h-[6px] bg-[#1A1A1A]">
      <div
        className="h-full bg-[#00C853] transition-all duration-500"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
