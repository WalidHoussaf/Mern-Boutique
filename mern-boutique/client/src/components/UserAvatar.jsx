import React from 'react';

const UserAvatar = ({ user, size = 'md', isEditing, onEdit, t }) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-32 h-32',
    lg: 'w-40 h-40'
  };

  const getInitials = (name) => {
    if (!name) return '';
    return name.split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`relative inline-block ${sizeClasses[size]}`}>
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden border-4 border-primary/20`}>
        {user?.profileImage ? (
          <img
            src={user.profileImage}
            alt={user.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/10 via-primary/15 to-primary/20 flex items-center justify-center">
            <span className="text-4xl font-semibold text-primary">
              {getInitials(user?.name)}
            </span>
          </div>
        )}
      </div>
      {isEditing && onEdit && (
        <button
          onClick={onEdit}
          className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-lg hover:bg-primary-dark transition-colors"
          title={t?.('change_photo') || 'Change Photo'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default UserAvatar; 