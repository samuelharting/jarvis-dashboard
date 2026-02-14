import React from 'react';

export type StatusType = 'online' | 'offline' | 'warning' | 'error' | 'idle';

interface StatusChipProps {
  type: StatusType;
  label: string;
  showDot?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusChip: React.FC<StatusChipProps> = ({ 
  type, 
  label, 
  showDot = true,
  size = 'md'
}) => {
  const getColor = () => {
    switch (type) {
      case 'online': return '#10b981'; // green
      case 'offline': return '#6b7280'; // gray
      case 'warning': return '#f59e0b'; // amber
      case 'error': return '#ef4444'; // red
      case 'idle': return '#8b5cf6'; // purple
      default: return '#6b7280';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm': return { padding: '0.25rem 0.5rem', fontSize: '0.75rem' };
      case 'md': return { padding: '0.375rem 0.75rem', fontSize: '0.875rem' };
      case 'lg': return { padding: '0.5rem 1rem', fontSize: '1rem' };
      default: return { padding: '0.375rem 0.75rem', fontSize: '0.875rem' };
    }
  };

  const color = getColor();
  const sizeStyles = getSizeStyles();

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375rem',
        padding: sizeStyles.padding,
        backgroundColor: `${color}15`, // 15% opacity
        color: color,
        border: `1px solid ${color}30`, // 30% opacity
        borderRadius: '9999px',
        fontSize: sizeStyles.fontSize,
        fontWeight: 500,
        lineHeight: 1,
      }}
    >
      {showDot && (
        <div
          style={{
            width: '0.5rem',
            height: '0.5rem',
            backgroundColor: color,
            borderRadius: '50%',
            flexShrink: 0,
          }}
        />
      )}
      <span>{label}</span>
    </div>
  );
};