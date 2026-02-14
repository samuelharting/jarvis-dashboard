import React from 'react';

interface ResponsiveGridProps {
  children: React.ReactNode[];
  gap?: string;
  minColumnWidth?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({ 
  children, 
  gap = '1.5rem',
  minColumnWidth = '350px'
}) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(${minColumnWidth}, 1fr))`,
        gap: gap,
        width: '100%',
      }}
    >
      {children.map((child, index) => (
        <div key={index} style={{ minWidth: 0 }}> {/* minWidth: 0 prevents overflow */}
          {child}
        </div>
      ))}
    </div>
  );
};