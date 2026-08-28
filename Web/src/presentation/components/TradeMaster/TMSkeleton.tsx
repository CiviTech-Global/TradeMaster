import React from 'react';

interface TMSkeletonProps {
  width: string | number;
  height: string | number;
  borderRadius?: string | number;
  style?: React.CSSProperties;
}

const TMSkeleton: React.FC<TMSkeletonProps> = ({
  width,
  height,
  borderRadius = 'var(--radius-sm)',
  style,
}) => {
  return (
    <div
      className="tm-skeleton"
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, var(--color-border) 0%, var(--color-surface) 50%, var(--color-border) 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s ease-in-out infinite',
        ...style,
      }}
    >
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        html[dir="rtl"] .tm-skeleton {
          animation-name: shimmer-rtl;
        }
        @keyframes shimmer-rtl {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
};

export default TMSkeleton;
