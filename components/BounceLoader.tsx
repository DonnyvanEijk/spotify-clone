import React from 'react';

interface BounceLoaderProps {
  color?: string;
  size?: number;
}

const BounceLoader: React.FC<BounceLoaderProps> = ({ color = '#8F00FF', size = 40 }) => {
  const dotSize = size / 3;
  
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: `${dotSize * 0.5}px`,
      }}
    >
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% {
            opacity: 0.8;
            transform: translateY(0);
          }
          40% {
            opacity: 1;
            transform: translateY(-${dotSize * 1.5}px);
          }
        }
        .bounce-dot {
          animation: bounce 1.4s infinite ease-in-out;
          border-radius: 50%;
        }
        .bounce-dot-1 {
          animation-delay: -0.32s;
        }
        .bounce-dot-2 {
          animation-delay: -0.16s;
        }
      `}</style>
      
      <div
        className="bounce-dot bounce-dot-1"
        style={{
          width: dotSize,
          height: dotSize,
          backgroundColor: color,
        }}
      />
      <div
        className="bounce-dot bounce-dot-2"
        style={{
          width: dotSize,
          height: dotSize,
          backgroundColor: color,
        }}
      />
      <div
        className="bounce-dot"
        style={{
          width: dotSize,
          height: dotSize,
          backgroundColor: color,
        }}
      />
    </div>
  );
};

export default BounceLoader;
