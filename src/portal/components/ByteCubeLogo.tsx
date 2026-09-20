import React from 'react';

interface ByteCubeLogoProps {
  size?: number;
  className?: string;
}

export const ByteCubeLogo: React.FC<ByteCubeLogoProps> = ({ size = 36, className = '' }) => {
  return (
    <span
      className={`mark ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: `${size}px`,
        height: `${size}px`,
        flexShrink: 0
      }}
    >
      <img
        src="/icon.png"
        alt="Byte Logo"
        width={size}
        height={size}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          objectFit: 'contain'
        }}
      />
    </span>
  );
};
