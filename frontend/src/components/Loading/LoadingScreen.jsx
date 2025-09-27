import React from 'react';
import { Car, Loader2 } from 'lucide-react';

export const LoadingScreen = ({ message = "Загрузка...", fullscreen = true }) => {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-6">
      <div className="relative">
        <div className="w-20 h-20 rounded-full border-4 border-amber-500/20"></div>
        <div className="absolute inset-0 rounded-full border-4 border-t-amber-500 animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Car className="h-8 w-8 text-amber-500" />
        </div>
      </div>
      
      <div className="text-center">
        <h3 className="text-xl font-semibold text-white mb-2">VELES DRIVE</h3>
        <p className="text-gray-400">{message}</p>
      </div>
      
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return (
    <div className="py-12">
      {content}
    </div>
  );
};