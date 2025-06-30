import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { User, Mail, Shield, Eye, EyeOff, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProfileForm {
  username: string;
  email: string;
  password?: string;
  confirmPassword?: string;
}

const Profile: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm<ProfileForm>({
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
    }
  });

  const password = watch('password');

  const onSubmit = async (data: ProfileForm) => {
    setLoading(true);
    try {
      const updateData: any = {
        username: data.username,
        email: data.email,
      };
      
      if (data.password) {
        updateData.password = data.password;
      }
      
      await updateProfile(updateData);
      reset({
        username: data.username,
        email: data.email,
        password: '',
        confirmPassword: '',
      });
    } catch (error) {
      // Error is handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // This would need to be implemented in your backend
      toast.success('Account deletion requested. Please contact support.');
      setShowDeleteConfirm(false);
    } catch (error) {
      toast.error('Failed to delete account');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-secondary-900">Profile Settings</h1>
      </div>

      {/* Profile Info Card */}
      <div className="card">
        <div className="flex items-center mb-6">
          <div className="bg-primary-100 p-4 rounded-full">
            <User className="h-8 w-8 text-primary-600" />
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-semibold text-secondary-900">{user?.username}</h2>
            <div className="flex items-center text-secondary-600">
              <Shield className="h-4 w-4 mr-1" />
              <span className="capitalize">{user?.role}</span>
            </div>
          </div>
        </div>

        {/* Points Display for Students */}
        {user?.role === 'student' && (
          <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-secondary-50 rounded-lg">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{user.oneToOnePoints || 0}</p>
              <p className="text-sm text-secondary-600">One-to-One Points</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{user.groupPoints || 0}</p>
              <p className="text-sm text-secondary-600">Group Points</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-secondary-700 mb-1">
              Username
            </label>
            <input
              {...register('username', { 
                required: 'Username is required',
                minLength: {
                  value: 3,
                  message: 'Username must be at least 3 characters'
                }
              })}
              type="text"
              className="input-field"
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-1">
              Email address
            </label>
            <div className="relative">
              <input
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Invalid email address'
                  }
                })}
                type="email"
                className="input-field pl-10"
              />
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="border-t border-secondary-200 pt-4">
            <h3 className="text-lg font-medium text-secondary-900 mb-4">Change Password</h3>
            <p className="text-sm text-secondary-600 mb-4">
              Leave blank to keep your current password
            </p>

            <div className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-secondary-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    {...register('password', { 
                      minLength: password ? {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      } : undefined
                    })}
                    type={showPassword ? 'text' : 'password'}
                    className="input-field pr-10"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-secondary-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-secondary-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              {password && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      {...register('confirmPassword', { 
                        validate: value => !password || value === password || 'Passwords do not match'
                      })}
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="input-field pr-10"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-secondary-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-secondary-400" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center"
            >
              {loading ? (
                <div className="loading-spinner h-4 w-4 mr-2"></div>
              ) : null}
              Update Profile
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="card border-red-200">
        <h3 className="text-lg font-medium text-red-900 mb-4">Danger Zone</h3>
        <p className="text-sm text-red-700 mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="btn-danger flex items-center"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Account
          </button>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-red-800 font-medium">
              Are you sure you want to delete your account? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleDeleteAccount}
                className="btn-danger"
              >
                Yes, Delete Account
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;