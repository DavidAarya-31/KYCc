import React from 'react';

export type NotificationType = 'success' | 'error' | 'info';

interface NotificationBannerProps {
  message: string;
  type?: NotificationType;
  onClose?: () => void;
}

const typeStyles: Record<NotificationType, string> = {
  success: 'bg-green-100 border-green-500 text-green-700',
  error: 'bg-red-100 border-red-500 text-red-700',
  info: 'bg-yellow-100 border-yellow-500 text-yellow-700',
};

const NotificationBanner: React.FC<NotificationBannerProps> = ({ message, type = 'info', onClose }) => {
  return (
    <div className={`${typeStyles[type]} border-l-4 p-4 mb-4 flex items-center justify-between`} role="alert">
      <div>
        <span className="font-medium capitalize mr-2">{type === 'success' ? 'Success:' : type === 'error' ? 'Error:' : 'Info:'}</span>
        {message}
      </div>
      {onClose && (
        <button onClick={onClose} className="ml-4 text-xl font-bold text-gray-500 hover:text-gray-800 focus:outline-none">&times;</button>
      )}
    </div>
  );
};

export default NotificationBanner; 