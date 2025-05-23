import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../stores/authStore';
import { Camera, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { User } from '../types';

interface ProfileFormData {
  name: string;
  email: string;
  bio?: string;
}

const Profile = () => {
  const { user, updateProfile, loading } = useAuthStore();
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isDirty } 
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      bio: user?.bio ?? ''
    }
  });
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };
  
  const handleAvatarUpload = async () => {
    if (!avatar || !user?._id) return;
    
    setUploadingAvatar(true);
    
    try {
      const formData = new FormData();
      formData.append('avatar', avatar);
      
      const response = await fetch('/api/users/avatar', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload avatar');
      }
      
      const data = await response.json();
      
      toast.success('Avatar updated successfully');
      // Update user state with new avatar URL
      updateProfile({ ...user, avatar: data.avatarUrl });
      
      setAvatar(null);
    } catch (error) {
      toast.error('Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };
  
  const onSubmit = async (data: ProfileFormData) => {
    if (!user?._id) {
      toast.error('User ID is missing');
      return;
    }

    try {
      const updatedUser: User = {
        ...user,
        name: data.name,
        bio: data.bio ?? ''
      };
      
      await updateProfile(updatedUser);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-5 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">Profile Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Update your personal information and profile picture
          </p>
        </div>
        
        <div className="p-6">
          {/* Avatar section */}
          <div className="flex flex-col sm:flex-row items-center mb-8">
            <div className="relative mb-4 sm:mb-0 sm:mr-6">
              <img
                src={avatarPreview || user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=3B82F6&color=fff&size=128`}
                alt={user.name}
                className="h-32 w-32 rounded-full object-cover"
              />
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 bg-primary-600 p-2 rounded-full text-white cursor-pointer hover:bg-primary-700"
              >
                <Camera className="h-5 w-5" />
              </label>
              <input
                id="avatar-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </div>
            
            <div className="text-center sm:text-left">
              <h2 className="text-lg font-medium text-gray-900">{user.name}</h2>
              <p className="text-gray-500">{user.email}</p>
              
              {avatar && (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={handleAvatarUpload}
                    disabled={uploadingAvatar}
                    className="btn btn-primary text-sm"
                  >
                    {uploadingAvatar ? (
                      <div className="flex items-center">
                        <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full mr-2"></div>
                        Uploading...
                      </div>
                    ) : (
                      'Upload New Avatar'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAvatar(null);
                      setAvatarPreview(null);
                    }}
                    className="ml-2 text-sm text-gray-500 hover:text-gray-700"
                    disabled={uploadingAvatar}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Profile form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                className="input w-full"
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-error-500">{errors.name.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className="input w-full bg-gray-50"
                disabled
                {...register('email')}
              />
              <p className="mt-1 text-xs text-gray-500">
                Email address cannot be changed
              </p>
            </div>
            
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                id="bio"
                rows={4}
                className="input w-full"
                placeholder="Tell us about yourself"
                {...register('bio')}
              />
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !isDirty}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Account security section */}
      <div className="bg-white rounded-lg shadow mt-6">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Account Security</h2>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-success-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">Email Verification</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Your email has been verified
                </p>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-warning-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Enhance your account security with two-factor authentication
                </p>
                <button className="mt-2 text-sm font-medium text-primary-600 hover:text-primary-500">
                  Enable 2FA
                </button>
              </div>
            </div>
          </div>
          
          <div>
            <button className="text-sm font-medium text-error-600 hover:text-error-700">
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;