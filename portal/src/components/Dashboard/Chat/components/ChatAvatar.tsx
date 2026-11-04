interface ChatAvatarProps {
  src: string | null | undefined;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const getInitials = (name?: string) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getColor = (name?: string) => {
  if (!name) return 'bg-blue-500';
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-indigo-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-red-500',
    'bg-teal-500',
    'bg-orange-500',
  ];
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  return colors[sum % colors.length];
};

export default function ChatAvatar({
  src,
  name,
  size = 'md',
  className = '',
}: ChatAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-14 h-14 text-lg',
  };

  if (src && src.startsWith('http') && !src.includes('f-avatar.svg')) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={`${sizeClasses[size]} rounded-full object-cover bg-gray-200 shrink-0 ${className}`}
      />
    );
  }

  const initials = getInitials(name);
  const colorClass = getColor(name);

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-black font-bold shrink-0 ${colorClass} ${className}`}
      title={name}
    >
      {initials}
    </div>
  );
}
