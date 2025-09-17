import React from 'react';

const AuthIllustration: React.FC = () => {
  return (
    <svg
      width="400"
      height="300"
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="400" height="300" fill="transparent"/>

      {/* Computer Screen */}
      <rect x="120" y="80" width="160" height="100" rx="8" fill="#e5e7eb" stroke="#d1d5db" strokeWidth="2"/>
      <rect x="130" y="90" width="140" height="80" rx="4" fill="#f9fafb"/>

      {/* Screen Content - Charts */}
      <rect x="140" y="100" width="30" height="20" rx="2" fill="#6366f1" opacity="0.7"/>
      <rect x="175" y="110" width="30" height="30" rx="2" fill="#10b981" opacity="0.7"/>
      <rect x="210" y="105" width="30" height="25" rx="2" fill="#f59e0b" opacity="0.7"/>
      <rect x="245" y="95" width="15" height="35" rx="2" fill="#ef4444" opacity="0.7"/>

      {/* Computer Stand */}
      <rect x="185" y="180" width="30" height="20" rx="4" fill="#9ca3af"/>
      <rect x="160" y="200" width="80" height="8" rx="4" fill="#6b7280"/>

      {/* Person 1 - Male */}
      <circle cx="80" cy="120" r="15" fill="#fbbf24"/>
      <path d="M80 135 Q75 140 70 150 Q80 155 80 155 Q80 155 90 150 Q85 140 80 135 Z" fill="#1f2937"/>
      <rect x="75" y="150" width="10" height="25" rx="5" fill="#dc2626"/>
      <rect x="70" y="175" width="8" height="15" rx="4" fill="#1f2937"/>
      <rect x="82" y="175" width="8" height="15" rx="4" fill="#1f2937"/>

      {/* Person 2 - Female */}
      <circle cx="320" cy="120" r="15" fill="#fbbf24"/>
      <path d="M320 135 Q315 140 310 150 Q320 155 320 155 Q320 155 330 150 Q325 140 320 135 Z" fill="#7c2d12"/>
      <rect x="315" y="150" width="10" height="25" rx="5" fill="#f472b6"/>
      <rect x="310" y="175" width="8" height="15" rx="4" fill="#1f2937"/>
      <rect x="322" y="175" width="8" height="15" rx="4" fill="#1f2937"/>

      {/* Plant */}
      <ellipse cx="60" cy="200" rx="12" ry="8" fill="#65a30d"/>
      <rect x="58" y="200" width="4" height="15" rx="2" fill="#166534"/>
      <path d="M52 195 Q60 185 68 195" stroke="#22c55e" strokeWidth="3" fill="none"/>
      <path d="M50 200 Q60 190 70 200" stroke="#16a34a" strokeWidth="2" fill="none"/>

      {/* Trading Charts Background */}
      <rect x="280" y="50" width="80" height="50" rx="6" fill="#f3f4f6" opacity="0.5"/>
      <path d="M285 75 L295 65 L305 70 L315 60 L325 65 L335 55 L345 60 L355 50" stroke="#6366f1" strokeWidth="2" fill="none"/>
      <circle cx="295" cy="65" r="2" fill="#6366f1"/>
      <circle cx="315" cy="60" r="2" fill="#6366f1"/>
      <circle cx="335" cy="55" r="2" fill="#6366f1"/>

      {/* Decorative Elements */}
      <circle cx="350" cy="180" r="3" fill="#f59e0b" opacity="0.6"/>
      <circle cx="40" cy="100" r="2" fill="#10b981" opacity="0.7"/>
      <circle cx="370" cy="120" r="4" fill="#ef4444" opacity="0.5"/>
    </svg>
  );
};

export default AuthIllustration;