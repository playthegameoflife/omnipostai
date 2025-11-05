
import React from 'react';

interface PlatformCardProps {
  name: string;
  color: string;
  icon: React.ReactNode;
  onConnect: () => void;
  children?: React.ReactNode;
}

const PlatformCard: React.FC<PlatformCardProps> = ({ name, color, icon, onConnect, children }) => (
  <button
    className={`flex flex-col items-center justify-center p-6 rounded-lg shadow hover:shadow-lg transition ${color} text-white`}
    onClick={onConnect}
  >
    {icon}
    <span className="mt-3 font-semibold">{name}</span>
    <span className="text-xs mt-1 opacity-80">Connect</span>
    {children}
  </button>
);

export default PlatformCard;
