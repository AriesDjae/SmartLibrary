import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  User as UserIcon, 
  Mail, 
  Camera, 
  Edit2, 
  Save, 
  X,
  BookOpen,
  BookOpenText,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { mockUserActivity } from '../data/mockData';
import { Message } from '../types/auth';

const ProfilePage: React.FC = () => {
  const { currentUser, signOut, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<Message | null>(null);
  const [name, setName] = useState<string>(currentUser?.full_name || '');
  const [email, setEmail] = useState<string>(currentUser?.email || '');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>(currentUser?.profile_picture || '');
  
  if (!currentUser) {
    navigate('/sign-in');
    return null;
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    
    console.log('🔄 Submitting profile update:', {
      full_name: name,
      email: email,
      hasProfilePicture: !!profilePicture,
      currentUserId: currentUser?._id
    });
    
    // Validate that user is logged in and has an ID
    if (!currentUser?._id) {
      console.error('❌ No current user ID found');
      setMessage({ type: 'error', text: 'User not found. Please log in again.' });
      setIsLoading(false);
      return;
    }
    
    try {
      // Prepare update data
      const updateData: any = {
        full_name: name,
        email: email
      };

      // If there's a new profile picture, convert to base64
      if (profilePicture) {
        const base64Image = await convertFileToBase64(profilePicture);
        updateData.profile_picture = base64Image;
        console.log('📸 Profile picture converted to base64');
      }

      const result = await updateUserProfile(updateData);
      
      if (result.success) {
        console.log('✅ Profile updated successfully');
        setMessage({ type: 'success', text: result.message || 'Profile updated successfully!' });
        setIsEditing(false);
        // Clear the profile picture state after successful update
        setProfilePicture(null);
      } else {
        console.error('❌ Profile update failed:', result.message);
        setMessage({ type: 'error', text: result.message || 'Failed to update profile' });
      }
    } catch (error: any) {
      console.error('❌ Error updating profile:', error);
      setMessage({ type: 'error', text: error.message || 'An error occurred while updating profile' });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to convert file to base64
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle profile picture change
  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('📸 Profile picture selected:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Please select an image file' });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image size must be less than 5MB' });
        return;
      }
      
      setProfilePicture(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const cancelEdit = () => {
    setName(currentUser.full_name || '');
    setEmail(currentUser.email || '');
    setProfilePicture(null);
    setPreviewImage(currentUser.profile_picture || '');
    setIsEditing(false);
    setMessage(null);
    console.log('❌ Profile edit cancelled');
  };

  // Auto-hide message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Log current user data when component mounts or user changes
  useEffect(() => {
    console.log('👤 ProfilePage: Current user data:', {
      id: currentUser?._id,
      full_name: currentUser?.full_name,
      email: currentUser?.email,
      hasProfilePicture: !!currentUser?.profile_picture
    });
  }, [currentUser]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="px-0 md:px-0 py-0 w-full">
        <h1 className="text-3xl font-bold mb-8">Profile</h1>
        
        {/* Message Alert */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
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
        
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 mb-8">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-primary-800 to-primary-700 p-6 md:p-8 text-white">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="relative">
                {(previewImage || currentUser.profile_picture) ? (
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
          
          {/* Profile Content */}
          <div className="p-6 md:p-8">
            {isEditing ? (
              <form onSubmit={handleSubmit}>
                <div className="space-y-6 max-w-lg">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
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
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
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
            ) : (
              <div>
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">Reading Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center text-primary-600 mb-2">
                        <BookOpen className="h-5 w-5 mr-2" />
                        <span className="font-medium">Books Completed</span>
                      </div>
                      <p className="text-2xl font-bold">{mockUserActivity.readingStats.booksCompleted}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center text-accent-600 mb-2">
                        <BookOpenText className="h-5 w-5 mr-2" />
                        <span className="font-medium">Pages Read</span>
                      </div>
                      <p className="text-2xl font-bold">{mockUserActivity.readingStats.pagesRead}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center text-highlight-500 mb-2">
                        <Mail className="h-5 w-5 mr-2" />
                        <span className="font-medium">Top Genre</span>
                      </div>
                      <p className="text-2xl font-bold">
                        {mockUserActivity.readingStats.favoriteGenres[0].genre}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">Account Settings</h3>
                  
                  <div className="space-y-4 max-w-lg">
                    <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium">Email Notifications</h4>
                        <p className="text-sm text-gray-600">Receive updates about new books and recommendations</p>
                      </div>
                      <div className="relative inline-block w-12 h-6">
                        <input 
                          type="checkbox" 
                          id="toggle-notifications" 
                          className="sr-only" 
                          defaultChecked 
                        />
                        <label 
                          htmlFor="toggle-notifications"
                          className="block w-12 h-6 rounded-full bg-gray-300 cursor-pointer transition-colors duration-200 ease-in-out"
                        >
                          <span className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out transform translate-x-0 peer-checked:translate-x-6"></span>
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium">Reading History</h4>
                        <p className="text-sm text-gray-600">Track and save your reading activity</p>
                      </div>
                      <div className="relative inline-block w-12 h-6">
                        <input 
                          type="checkbox" 
                          id="toggle-history" 
                          className="sr-only" 
                          defaultChecked 
                        />
                        <label 
                          htmlFor="toggle-history"
                          className="block w-12 h-6 rounded-full bg-gray-300 cursor-pointer transition-colors duration-200 ease-in-out"
                        >
                          <span className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out transform translate-x-0 peer-checked:translate-x-6"></span>
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium">Dark Mode</h4>
                        <p className="text-sm text-gray-600">Switch between light and dark theme</p>
                      </div>
                      <div className="relative inline-block w-12 h-6">
                        <input 
                          type="checkbox" 
                          id="toggle-theme" 
                          className="sr-only" 
                        />
                        <label 
                          htmlFor="toggle-theme"
                          className="block w-12 h-6 rounded-full bg-gray-300 cursor-pointer transition-colors duration-200 ease-in-out"
                        >
                          <span className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out transform translate-x-0 peer-checked:translate-x-6"></span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Reading Preferences</h3>
                  <p className="text-gray-600 mb-4">Select your favorite genres to get personalized recommendations</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {['Fiction', 'Science Fiction', 'Fantasy', 'Mystery', 'Thriller', 'Biography', 'History', 'Self-Help', 'Romance', 'Science', 'Philosophy'].map(genre => (
                      <button 
                        key={genre}
                        className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                          ['Fiction', 'Fantasy', 'Science Fiction'].includes(genre)
                            ? 'bg-primary-100 text-primary-800'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                        }`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;