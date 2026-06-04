import { useRef, useState } from 'react';
import { resolveAvatarUrl } from '../utils/avatarUrl';

const ProfileAvatar = ({
  name,
  avatarUrl,
  size = 'lg',
  editable = false,
  onUpload,
  onRemove,
  uploadLabel,
  removeLabel,
  uploading = false,
}) => {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const initial = name?.charAt(0)?.toUpperCase() || 'B';
  const src = preview || resolveAvatarUrl(avatarUrl);
  const sizeClass = size === 'sm' ? 'profile-avatar-sm' : size === 'md' ? 'profile-avatar-md' : 'profile-avatar-lg';

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !onUpload) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    try {
      await onUpload(file);
    } finally {
      URL.revokeObjectURL(url);
      setPreview(null);
      e.target.value = '';
    }
  };

  const handleRemove = async () => {
    if (onRemove) await onRemove();
    setPreview(null);
  };

  const inner = src ? (
    <img src={src} alt="" className="profile-avatar-img" />
  ) : (
    <span className="profile-avatar-initial">{initial}</span>
  );

  if (!editable) {
    return (
      <div className={`profile-avatar ${sizeClass}`} aria-hidden>
        {inner}
      </div>
    );
  }

  return (
    <div className={`profile-avatar profile-avatar-editable ${sizeClass} ${uploading ? 'is-uploading' : ''}`}>
      {inner}
      <button
        type="button"
        className="profile-avatar-overlay"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        title={uploadLabel}
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="sr-only"
        onChange={handleFile}
      />
      {avatarUrl && onRemove && (
        <button
          type="button"
          className="profile-avatar-remove"
          onClick={handleRemove}
          disabled={uploading}
        >
          {removeLabel}
        </button>
      )}
    </div>
  );
};

export default ProfileAvatar;
