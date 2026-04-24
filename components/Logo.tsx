interface LogoProps {
  size?: number;
  className?: string;
}

export default function Logo({ size = 40, className = '' }: LogoProps) {
  const id = `logo-grad-${size}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="CAS Incubator OS"
      role="img"
    >
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="50%" stopColor="#00C2B8" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>

      {/* Hexagon outline */}
      <polygon
        points="50,4 93,27.5 93,72.5 50,96 7,72.5 7,27.5"
        stroke={`url(#${id})`}
        strokeWidth="3"
        fill="none"
        strokeLinejoin="round"
      />

      {/* Orange dot above "i" */}
      <circle cx="50" cy="32" r="5" fill="#FFB020" />

      {/* "i" stem */}
      <rect x="46" y="42" width="8" height="30" rx="4" fill={`url(#${id})`} />
    </svg>
  );
}
