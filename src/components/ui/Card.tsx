import React from 'react';

const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={`bg-black/20 border border-gray-700 rounded-2xl p-4 transition-all duration-300 hover:border-primary/50 hover:-translate-y-1 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
