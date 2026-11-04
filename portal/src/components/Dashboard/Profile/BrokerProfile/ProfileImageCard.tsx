import type { User } from '@/types/userDashboard';
import { FiCamera } from 'react-icons/fi';
import ProfilePictureModal from '../UserProfile/ProfilePictureModal';
import { useState } from 'react';

export default function ProfileImageCard({ user }: { user: User }) {
  const [openModal, setOpenModal] = useState(false);

  return (
    <div className="relative group p-6">
      <div
        className="relative h-56 w-full rounded-lg overflow-hidden cursor-pointer"
        onClick={() => setOpenModal(true)}
      >
        {user.profileImage ? (
          <img
            src={user.profileImage}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1F4FE0] to-[#60a5fa] flex items-center justify-center font-bold text-5xl text-white uppercase transition-transform duration-500 group-hover:scale-105">
            {(user.firstname?.[0] || '') + (user.lastname?.[0] || '')}
          </div>
        )}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <FiCamera size={32} className="text-white drop-shadow-lg" />
        </div>
      </div>

      <ProfilePictureModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        currentImage={user.profileImage || ''}
        initials={(user.firstname?.[0] || '') + (user.lastname?.[0] || '')}
      />
    </div>
  );
}
