type BrandMarkProps = {
  className?: string;
};

export function BrandMark({ className = 'h-9 w-9' }: BrandMarkProps) {
  return <span className={`flex items-center justify-center rounded-md bg-primary text-primary-foreground ${className}`} aria-hidden="true">
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path d="M5 5h14v3h-5.5v11h-3V8H5V5Z" fill="currentColor" />
      <path d="M7 16h10v2H7v-2Z" fill="#1f467d" />
    </svg>
  </span>;
}
