import { Pyramid } from "lucide-react";

interface LogoProps {
  className?: string;
  iconClassName?: string;
  onClick?: () => void;
}

export function Logo({ className = "", iconClassName = "", onClick }: LogoProps) {
  const content = (
    <>
      <Pyramid className={`h-4 w-4 animate-spin-y ${iconClassName}`} />
      <span className="font-semibold">TextPrism</span>
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
