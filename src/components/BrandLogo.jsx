/**
 * Speak English with AI — brand mark.
 * A friendly "talking cookie" with the letters A · B · C,
 * rendered as an inline SVG so it scales and themes cleanly.
 */
export default function BrandLogo({ size = 64, className = '' }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Speech-bubble tail */}
      <path
        d="M22 78 C 18 84, 14 88, 10 90 C 18 90, 26 86, 32 80 Z"
        fill="#d7a574"
        stroke="#7a4a1f"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Cookie body */}
      <circle cx="50" cy="46" r="36" fill="#e0b07a" stroke="#7a4a1f" strokeWidth="3" />
      {/* Cookie highlight */}
      <path
        d="M26 28 Q 38 18, 58 22"
        stroke="#f2cc9a"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />
      {/* Chocolate chips / sprinkles */}
      <circle cx="72" cy="34" r="3" fill="#6b3813" />
      <circle cx="28" cy="54" r="2.5" fill="#6b3813" />
      <circle cx="68" cy="66" r="2.5" fill="#6b3813" />
      <circle cx="40" cy="20" r="2" fill="#6b3813" />
      {/* Letters A B C */}
      <text
        x="30" y="54"
        fontFamily="Fredoka, Nunito, system-ui, sans-serif"
        fontWeight="700" fontSize="14"
        fill="#3a2310"
      >A</text>
      <text
        x="46" y="58"
        fontFamily="Fredoka, Nunito, system-ui, sans-serif"
        fontWeight="700" fontSize="16"
        fill="#3a2310"
      >B</text>
      <text
        x="62" y="54"
        fontFamily="Fredoka, Nunito, system-ui, sans-serif"
        fontWeight="700" fontSize="14"
        fill="#3a2310"
      >C</text>
      {/* Dots between letters */}
      <circle cx="42" cy="48" r="1.4" fill="#3a2310" />
      <circle cx="60" cy="48" r="1.4" fill="#3a2310" />
    </svg>
  );
}
