import { Pyramid } from "lucide-react";

interface LogoProps {
  className?: string;
  iconClassName?: string;
  onClick?: () => void;
}

export function Logo({ className = "", iconClassName = "", onClick }: LogoProps) {
  const content = (
    <>
      <Pyramid className={`h-5 w-5 animate-spin-y ${iconClassName}`} />
      <span className="font-semibold text-base tracking-tight">TextPrism</span>
    </>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`flex items-center gap-1.5 hover:opacity-70 transition-opacity cursor-pointer ${className}`}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {content}
    </div>
  );
}
