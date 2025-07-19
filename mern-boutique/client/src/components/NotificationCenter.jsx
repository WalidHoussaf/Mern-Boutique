import { useNotifications } from '../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import useTranslation from '../utils/useTranslation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircleIcon, 
  ExclamationCircleIcon, 
  InformationCircleIcon, 
  ExclamationTriangleIcon,
  BellIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import './navbar.css';

const typeConfig = {
  success: {
    icon: CheckCircleIcon,
    bgColor: 'bg-green-50',
    textColor: 'text-green-800',
    iconColor: 'text-green-500',
    borderColor: 'border-green-100',
    gradientFrom: 'from-green-50',
    gradientTo: 'to-green-100/50'
  },
  error: {
    icon: ExclamationCircleIcon,
    bgColor: 'bg-red-50',
    textColor: 'text-red-800',
    iconColor: 'text-red-500',
    borderColor: 'border-red-100',
    gradientFrom: 'from-red-50',
    gradientTo: 'to-red-100/50'
  },
  warning: {
    icon: ExclamationTriangleIcon,
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-800',
    iconColor: 'text-yellow-500',
    borderColor: 'border-yellow-100',
    gradientFrom: 'from-yellow-50',
    gradientTo: 'to-yellow-100/50'
  },
  info: {
    icon: InformationCircleIcon,
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-800',
    iconColor: 'text-blue-500',
    borderColor: 'border-blue-100',
    gradientFrom: 'from-blue-50',
    gradientTo: 'to-blue-100/50'
  }
};

const NotificationCenter = ({ onClose }) => {
  const { t } = useTranslation();
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    unreadCount,
    isSoundEnabled,
    toggleSound
  } = useNotifications();

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.3, ease: 'easeOut' }
    },
    exit: { 
      opacity: 0, 
      y: -10, 
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  const notificationVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={dropdownVariants}
      className="absolute right-0 mt-2 w-96 rounded-xl overflow-hidden z-50 glass-effect"
    >
      <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 py-4 px-6">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <BellIcon className="w-5 h-5 text-primary animate-pulse" />
            <h3 className="font-semibold text-primary">
              {t('notifications')}
              {unreadCount > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-primary text-white rounded-full animate-fade-in">
                  {unreadCount}
                </span>
              )}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSound}
              className={`text-gray-400 hover:text-gray-600 transition-colors ${isSoundEnabled ? 'text-primary' : ''}`}
              title={isSoundEnabled ? t('mute_notifications') : t('unmute_notifications')}
            >
              {isSoundEnabled ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
        {notifications.length > 0 && (
          <div className="flex gap-3 text-xs">
            <button
              onClick={markAllAsRead}
              className="text-primary hover:text-primary-dark transition-colors font-medium"
            >
              {t('mark_all_read')}
            </button>
            <button
              onClick={clearAll}
              className="text-gray-500 hover:text-gray-700 transition-colors font-medium"
            >
              {t('clear_all')}
            </button>
          </div>
        )}
      </div>

      <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
        <AnimatePresence>
          {notifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6 text-center"
            >
              <BellIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">{t('no_notifications')}</p>
            </motion.div>
          ) : (
            <div className="divide-y divide-gray-50">
              {notifications.map(notification => {
                const config = typeConfig[notification.type] || typeConfig.info;
                const Icon = config.icon;

                return (
                  <motion.div
                    key={notification.id}
                    layout
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={notificationVariants}
                    className={`p-4 hover:bg-gray-50/80 transition-all ${
                      !notification.read ? `bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo}` : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${config.textColor} break-words`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(notification.timestamp), {
                              addSuffix: true
                            })}
                          </p>
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs text-primary hover:text-primary-dark transition-colors font-medium"
                            >
                              {t('mark_read')}
                            </button>
                          )}
                          <button
                            onClick={() => removeNotification(notification.id)}
                            className="text-xs text-red-500 hover:text-red-600 transition-colors font-medium ml-auto"
                          >
                            {t('delete')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default NotificationCenter; 