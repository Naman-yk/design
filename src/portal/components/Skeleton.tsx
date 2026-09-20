import React from 'react';

interface SkeletonProps {
  height?: string | number;
  width?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  height = '1rem',
  width = '100%',
  borderRadius = '6px',
  className = '',
  style = {}
}) => {
  return (
    <div
      className={className}
      style={{
        height,
        width,
        borderRadius,
        background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 100%)',
        backgroundSize: '200% 100%',
        animation: 'skeletonShimmer 1.8s infinite ease-in-out',
        ...style
      }}
    />
  );
};
