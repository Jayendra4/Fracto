export default function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="text-center text-[var(--fg)] ">
      <p className="text-[10px] sm:text-[14px] ">{label}</p>
      <p className="text-[14px] font-medium">{value}</p>
    </div>
  );
}
