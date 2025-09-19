import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../../application/redux/hooks';
import { selectNotifications, removeNotification } from '../../../application/redux';
import './NotificationContainer.css';

const NotificationContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(selectNotifications);

  useEffect(() => {
    notifications.forEach(notification => {
      if (notification.duration !== 0) {
        const timer = setTimeout(() => {
          dispatch(removeNotification(notification.id));
        }, notification.duration || 5000);

        return () => clearTimeout(timer);
      }
    });
  }, [notifications, dispatch]);

  if (notifications.length === 0) return null;

  return (
    <div className="notification-container">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`notification notification--${notification.type}`}
          onClick={() => dispatch(removeNotification(notification.id))}
        >
          <div className="notification__content">
            <div className="notification__title">{notification.title}</div>
            {notification.message && (
              <div className="notification__message">{notification.message}</div>
            )}
          </div>
          <button
            className="notification__close"
            onClick={(e) => {
              e.stopPropagation();
              dispatch(removeNotification(notification.id));
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;