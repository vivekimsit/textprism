import { Pyramid } from "lucide-react";

interface LogoProps {
  className?: string;
  iconClassName?: string;
}

export function Logo({ className = "", iconClassName = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <Pyramid
        className={`h-4 w-4 animate-spin-y ${iconClassName}`}
      />
      <span className="font-semibold">TextPrism</span>
    </div>
  );
}
