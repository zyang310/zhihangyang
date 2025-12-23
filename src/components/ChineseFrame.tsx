import { ReactNode } from 'react';

interface ChineseFrameProps {
  children: ReactNode;
  variant?: 'light' | 'dark';
  className?: string;
}

export function ChineseFrame({ children, variant = 'light', className = '' }: ChineseFrameProps) {
  const baseClasses = 'relative border-3 p-12 px-16';
  const variantClasses = variant === 'light'
    ? 'border-chinese-red bg-white/70 backdrop-blur-sm'
    : 'border-gold bg-black/30';

  return (
    <div className={`${baseClasses} ${variantClasses} ${className}`}>
      {/* Top-left corner decoration */}
      <div className="absolute w-5 h-5 border-[3px] border-gold top-[-5px] left-[-5px] border-r-0 border-b-0" />
      {/* Bottom-right corner decoration */}
      <div className="absolute w-5 h-5 border-[3px] border-gold bottom-[-5px] right-[-5px] border-l-0 border-t-0" />
      {children}
    </div>
  );
}
