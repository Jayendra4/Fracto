import { TbCircleFilled } from "react-icons/tb";

 export default function StatusBadge({ label, danger, success, warning }: any) {
  const base = 'inline-flex items-center px-2 py-1 rounded text-xs font-medium';

  if (danger)
    return (
      <span
        className={`${base}  flex items-center gap-1 font-14 bg-red/12 text-red border border-red`}
      >
        <TbCircleFilled className="w-2 h-2" /> {label}
      </span>
    );

  if (success)
    return (
      <span
        className={`${base} flex items-center gap-1 font-14 bg-green/12 text-green border border-green`}
      >
        <TbCircleFilled className="w-2 h-2" /> {label}
      </span>
    );

  if (warning)
    return (
      <span
        className={`${base} flex items-center gap-1 font-14 bg-[#E56B00]/12 text-[#E56B00] border border-[#E56B00]`}
      >
        <TbCircleFilled className="w-2 h-2" />
        {label}
      </span>
    );

  return null;
}
