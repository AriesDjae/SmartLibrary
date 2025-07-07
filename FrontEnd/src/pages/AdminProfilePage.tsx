// import React from 'react';
// import { AdminProfile } from '../components/dashboard-admin/AdminProfile';

// const AdminProfilePage: React.FC = () => {
//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
//       <AdminProfile />
//     </div>
//   );
// };

// export default AdminProfilePage; 

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, Camera, Edit2, Save, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Message } from '../types/auth';

const AdminProfilePage: React.FC = () => {
  const { currentUser, updateUserProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const [name, setName] = useState(currentUser?.full_name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState(currentUser?.profile_picture || '');

  // Jika belum login, redirect
  useEffect(() => {
    if (!currentUser) {
      navigate('/sign-in');
    }
  }, [currentUser, navigate]);

  // Auto-hide message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const updateData: any = {
        full_name: name,
        email: email,
      };

      if (profilePicture) {
        const base64Image = await convertFileToBase64(profilePicture);
        updateData.profile_picture = base64Image;
      }

      const result = await updateUserProfile(updateData);

      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'Profile updated successfully!' });
        setIsEditing(false);
        setProfilePicture(null);
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to update profile' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'An error occurred while updating profile' });
    } finally {
      setIsLoading(false);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Please select an image file' });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image size must be less than 5MB' });
        return;
      }
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const cancelEdit = () => {
    setName(currentUser?.full_name || '');
    setEmail(currentUser?.email || '');
    setProfilePicture(null);
    setPreviewImage(currentUser?.profile_picture || '');
    setIsEditing(false);
    setMessage(null);
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-8">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-800 to-primary-700 p-8 text-white">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
              {previewImage || currentUser.profile_picture ? (
                <img
                  src={previewImage || currentUser.profile_picture}
                  alt={currentUser.full_name}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white"
                />
              ) : (
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white/20 flex items-center justify-center">
                  <UserIcon className="h-12 w-12 text-white" />
                </div>
              )}
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-white text-primary-600 p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors cursor-pointer">
                  <Camera className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold">{currentUser.full_name}</h2>
              <p className="text-blue-100 mt-1">{currentUser.email}</p>
              <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn bg-white/10 hover:bg-white/20 text-white flex items-center"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </button>
                ) : (
                  <button
                    onClick={cancelEdit}
                    className="btn bg-white/10 hover:bg-white/20 text-white flex items-center"
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                )}
                <button
                  onClick={() => {
                    signOut();
                    navigate('/');
                  }}
                  className="btn border border-white/30 text-white hover:bg-white/10"
                  disabled={isLoading}
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Message Alert */}
        {message && (
          <div className={`m-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        )}
        {/* Form */}
        <div className="p-8">
          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <div className="space-y-6 max-w-lg mx-auto">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    className="btn-primary flex items-center"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default AdminProfilePage;