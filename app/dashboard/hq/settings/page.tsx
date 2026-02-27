'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { ToastContainer } from '@/app/_components/ui/ToastContainer';
import { useToast } from '@/app/hooks/useToast';

import FileUpload from '@/app/_components/ui/FileUpload';
import {
  useUserProfile,
  useUpdateUserProfile,
  useChangePassword,
  useUpdateProfilePicture,
  useSystemSettings,
  useUpdateSystemSettings
} from '@/app/dashboard/hq/queries/useSettingsQueries';
import {
  SystemSettings
} from '@/lib/api/types';
import {
  UpdateProfileData,
  ChangePasswordData
} from '@/lib/services/userProfile';

type SettingsTab = 'account-information' | 'security-login';

import { API_CONFIG } from '@/lib/api/config';

interface SecuritySettings {
  smsAuthentication: boolean;
  emailAuthentication: boolean;
}

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function SettingsPage() {
  const { toasts, removeToast, success, error } = useToast();
  const [activeTab, setActiveTab] = useState<SettingsTab>('account-information');
  const [isMounted, setIsMounted] = useState(false);

  // Helper for profile picture URLs
  const resolveImageUrl = useCallback((path: string | null | undefined) => {
    if (!path) return undefined;
    if (path.startsWith('http') || path.startsWith('data:')) {
      return path;
    }
    return `${API_CONFIG.BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  }, []);

  // Prevent hydration mismatches by ensuring client-side rendering
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // React Query hooks for real backend data
  const { data: userProfile, isLoading: profileLoading, error: profileError } = useUserProfile();
  const { data: systemSettings, isLoading: settingsLoading, error: settingsError } = useSystemSettings();
  const updateProfileMutation = useUpdateUserProfile();
  const changePasswordMutation = useChangePassword();
  const updateProfilePictureMutation = useUpdateProfilePicture();
  const updateSystemSettingsMutation = useUpdateSystemSettings();

  // Security settings derived from system settings
  const securitySettings: SecuritySettings = {
    smsAuthentication: (systemSettings as any)?.security?.twoFactorAuth?.methods?.includes('sms') || false,
    emailAuthentication: (systemSettings as any)?.security?.twoFactorAuth?.methods?.includes('email') || false,
  };

  // Password change modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Profile Picture Upload Modal state
  const [showProfilePictureModal, setShowProfilePictureModal] = useState(false);

  // Profile form state for editing
  const [profileFormData, setProfileFormData] = useState<UpdateProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
  });

  // Update form data when user profile loads
  useEffect(() => {
    if (userProfile) {
      setProfileFormData({
        firstName: (userProfile as any).firstName || '',
        lastName: (userProfile as any).lastName || '',
        email: (userProfile as any).email || '',
        mobileNumber: (userProfile as any).mobileNumber || '',
      });
    }
  }, [userProfile]);


  const tabs = [
    { id: 'account-information', label: 'Account Information' },
    { id: 'security-login', label: 'Security & Login' },
  ];

  const handleTabChange = (tabId: SettingsTab) => {
    setActiveTab(tabId);
  };

  const handleProfileUpdate = async () => {
    if (!userProfile) return;

    try {
      await updateProfileMutation.mutateAsync(profileFormData);
      success('Profile updated successfully!');
    } catch (err) {
      error('Failed to update profile. Please try again.');
    }
  };

  const handleInputChange = (field: keyof UpdateProfileData, value: string) => {
    setProfileFormData((prev: UpdateProfileData) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProfilePictureChange = () => {
    setShowProfilePictureModal(true);
  };

  const handleProfilePictureUpload = async (files: File[]) => {
    if (files.length > 0) {
      try {
        const file = files[0];
        await updateProfilePictureMutation.mutateAsync(file);
        success('Profile picture updated successfully!');
        setShowProfilePictureModal(false);
      } catch (err) {
        error('Failed to upload profile picture. Please try again.');
      }
    }
  };

  const handleProfilePictureError = (errorMessage: string) => {
    error(`Failed to upload profile picture: ${errorMessage}`);
  };

  // Security, Password, Activity Log, and Admin handlers
  const handleSecurityToggle = async (setting: keyof SecuritySettings) => {
    if (!systemSettings) return;

    try {
      const currentMethods = (systemSettings as any).security.twoFactorAuth.methods || [];
      let newMethods: ('sms' | 'email')[];

      if (setting === 'smsAuthentication') {
        newMethods = securitySettings.smsAuthentication
          ? ((currentMethods as any[])).filter(m => m !== 'sms')
          : [...currentMethods, 'sms'] as any;
      } else {
        newMethods = securitySettings.emailAuthentication
          ? ((currentMethods as any[])).filter(m => m !== 'email')
          : [...currentMethods, 'email'] as any;
      }

      const updatedSettings: Partial<SystemSettings> = {
        security: {
          ...(systemSettings as any).security,
          twoFactorAuth: {
            ...(systemSettings as any).security.twoFactorAuth,
            methods: newMethods,
          },
        },
      };

      await updateSystemSettingsMutation.mutateAsync(updatedSettings);
      success(`${setting === 'smsAuthentication' ? 'SMS' : 'Email'} authentication ${securitySettings[setting] ? 'disabled' : 'enabled'}`);
    } catch (err) {
      error('Failed to update security settings. Please try again.');
    }
  };

  const handlePasswordChange = (field: keyof PasswordChangeData, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      error('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      error('Password must be at least 8 characters long');
      return;
    }
    try {
      const changeData: ChangePasswordData = {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmNewPassword: passwordData.confirmPassword,
      };
      await changePasswordMutation.mutateAsync(changeData);
      success('Password changed successfully!');
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      error('Failed to change password. Please try again.');
    }
  };

  const openPasswordModal = () => setShowPasswordModal(true);
  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowPasswords({ current: false, new: false, confirm: false });
  };

  const isLoading = profileLoading || settingsLoading ||
    updateProfileMutation.isPending || changePasswordMutation.isPending ||
    updateProfilePictureMutation.isPending || updateSystemSettingsMutation.isPending;

  if (!isMounted) {
    return (
      <div className="drawer-content flex flex-col">
        <main className="flex-1 px-4 sm:px-6 md:pl-[58px] md:pr-6" style={{ paddingTop: '40px' }}>
          <div className="max-w-[1150px]">
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#7F56D9]"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="drawer-content flex flex-col">
      <main className="flex-1 px-4 sm:px-6 md:pl-[58px] md:pr-6" style={{ paddingTop: '40px' }}>
        <div className="max-w-[1150px]">
          {/* Tab Navigation */}
          <div className="mb-12">
            <nav className="relative" role="tablist" aria-label="Settings tabs">
              <div className="flex items-center gap-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id as SettingsTab)}
                    className={`
                      relative font-medium transition-colors duration-200 whitespace-nowrap pb-3
                      focus:outline-none
                      ${activeTab === tab.id
                        ? 'text-[#7A62EB]'
                        : 'text-[#ABAFB3] hover:text-[#888F9B]'
                      }
                    `}
                    style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      lineHeight: '16px',
                      fontFamily: 'Open Sauce Sans, sans-serif',
                    }}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    aria-controls={`${tab.id}-panel`}
                    id={`${tab.id}-tab`}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <span
                        className="absolute left-0 right-0 bottom-0 mx-auto"
                        style={{
                          width: '99px',
                          height: '2px',
                          backgroundColor: '#7A62EB',
                          borderRadius: '20px',
                          display: 'block',
                        }}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                ))}
              </div>
            </nav>
          </div>

          <div className="relative">
            <div
              className="bg-white rounded-[5px]"
              style={{
                width: '941px',
                minHeight: '611px',
              }}
            >
              {activeTab === 'account-information' && (
                <div className="p-8">
                  {/* Header */}
                  <h1
                    className="font-bold mb-8"
                    style={{
                      fontSize: '24px',
                      fontWeight: 700,
                      lineHeight: '32px',
                      letterSpacing: '0.011em',
                      color: '#021C3E',
                      fontFamily: 'Open Sauce Sans, sans-serif',
                    }}
                  >
                    Account Information
                  </h1>

                  {/* Profile Picture Section */}
                  <div className="mb-8">
                    <div
                      className="bg-gray-300 rounded-full mb-4"
                      style={{
                        width: '60px',
                        height: '60px',
                        backgroundImage: userProfile?.profilePicture ? `url(${userProfile.profilePicture})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                    {isMounted && (
                      <button
                        onClick={handleProfilePictureChange}
                        className="text-[#7A62EB] hover:text-[#6941C6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:ring-offset-2 rounded-md"
                        style={{
                          fontSize: '14px',
                          fontWeight: 500,
                          lineHeight: '16px',
                          fontFamily: 'Open Sauce Sans, sans-serif',
                        }}
                      >
                        Change Picture
                      </button>
                    )}
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-8">
                    {/* Name Field */}
                    <div>
                      <label
                        className="block mb-2"
                        style={{
                          fontSize: '14px',
                          fontWeight: 500,
                          lineHeight: '16px',
                          color: '#01112C',
                          fontFamily: 'Open Sauce Sans, sans-serif',
                        }}
                      >
                        Name
                      </label>
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={`${profileFormData.firstName} ${profileFormData.lastName}`}
                          onChange={(e) => {
                            const [firstName, ...lastNameParts] = e.target.value.split(' ');
                            handleInputChange('firstName', firstName || '');
                            handleInputChange('lastName', lastNameParts.join(' ') || '');
                          }}
                          className="flex-1 bg-transparent border-none outline-none"
                          style={{
                            fontSize: '16px',
                            fontWeight: 400,
                            lineHeight: '16px',
                            color: '#767D94',
                            fontFamily: 'Open Sauce Sans, sans-serif',
                          }}
                        />
                        <button
                          className="ml-4 opacity-80 hover:opacity-100 transition-opacity"
                          aria-label="Edit name"
                        >
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path
                              d="M7.5 12.5L12.5 7.5M12.5 7.5L10 5L15 10L12.5 12.5M12.5 7.5L10 10"
                              stroke="#000000"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>
                      <div
                        className="mt-4 opacity-10"
                        style={{
                          width: '100%',
                          height: '0.8px',
                          backgroundColor: '#000000',
                        }}
                      />
                    </div>

                    {/* Phone Number Field */}
                    <div>
                      <label
                        className="block mb-2"
                        style={{
                          fontSize: '14px',
                          fontWeight: 500,
                          lineHeight: '16px',
                          color: '#01112C',
                          fontFamily: 'Open Sauce Sans, sans-serif',
                        }}
                      >
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={profileFormData.mobileNumber}
                        onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                        className="w-full bg-transparent border-none outline-none"
                        style={{
                          fontSize: '16px',
                          fontWeight: 400,
                          lineHeight: '16px',
                          color: '#767D94',
                          fontFamily: 'Open Sauce Sans, sans-serif',
                        }}
                      />
                      <div
                        className="mt-4 opacity-10"
                        style={{
                          width: '100%',
                          height: '0.8px',
                          backgroundColor: '#000000',
                        }}
                      />
                    </div>

                    {/* Email Field */}
                    <div>
                      <label
                        className="block mb-2"
                        style={{
                          fontSize: '14px',
                          fontWeight: 500,
                          lineHeight: '16px',
                          color: '#01112C',
                          fontFamily: 'Open Sauce Sans, sans-serif',
                        }}
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        value={profileFormData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full bg-transparent border-none outline-none"
                        style={{
                          fontSize: '16px',
                          fontWeight: 400,
                          lineHeight: '16px',
                          color: '#767D94',
                          fontFamily: 'Open Sauce Sans, sans-serif',
                        }}
                      />
                    </div>
                  </div>

                  {/* Update Button */}
                  <div className="mt-16">
                    <button
                      onClick={handleProfileUpdate}
                      disabled={isLoading}
                      className="w-full bg-[#7F56D9] hover:bg-[#6941C6] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:ring-offset-2 shadow-sm"
                      style={{
                        height: '44px',
                        fontSize: '16px',
                        fontWeight: 600,
                        lineHeight: '24px',
                        fontFamily: 'Open Sauce Sans, sans-serif',
                        border: '1px solid #7F56D9',
                        boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05)',
                      }}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Updating...
                        </div>
                      ) : (
                        'Update'
                      )}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'security-login' && (
                <div className="p-8">
                  {/* Header */}
                  <h1
                    className="font-bold mb-8"
                    style={{
                      fontSize: '24px',
                      fontWeight: 700,
                      lineHeight: '32px',
                      letterSpacing: '0.011em',
                      color: '#021C3E',
                      fontFamily: 'Open Sauce Sans, sans-serif',
                    }}
                  >
                    Security
                  </h1>

                  {/* Change Password Section - Always Available */}
                  <div className="mb-8">
                    <button
                      onClick={openPasswordModal}
                      className="flex items-center justify-between w-full group hover:bg-gray-50 transition-colors rounded-md p-2 -m-2"
                    >
                      <div>
                        <h3
                          className="text-left mb-2"
                          style={{
                            fontSize: '14px',
                            fontWeight: 500,
                            lineHeight: '16px',
                            color: '#01112C',
                            fontFamily: 'Open Sauce Sans, sans-serif',
                          }}
                        >
                          Change password
                        </h3>
                        <p
                          className="text-left"
                          style={{
                            fontSize: '16px',
                            fontWeight: 400,
                            lineHeight: '16px',
                            color: '#767D94',
                            fontFamily: 'Open Sauce Sans, sans-serif',
                          }}
                        >
                          Is your password compromised, change it here
                        </p>
                      </div>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        className="opacity-80 group-hover:opacity-100 transition-opacity"
                      >
                        <path
                          d="M7.5 15L12.5 10L7.5 5"
                          stroke="#000000"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>

                    {/* Divider */}
                    <div
                      className="mt-6 opacity-10"
                      style={{
                        width: '100%',
                        height: '0.8px',
                        backgroundColor: '#000000',
                      }}
                    />
                  </div>

                  {/* Two Factor Authentication Section - Conditional on System Settings */}
                  {settingsError ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <div className="text-yellow-600 mr-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        </div>
                        <div className="text-yellow-800 font-medium text-sm">Two-Factor Authentication Unavailable</div>
                      </div>
                      <div className="text-yellow-700 text-sm">
                        Security settings could not be loaded. Two-factor authentication options are temporarily unavailable.
                      </div>
                    </div>
                  ) : settingsLoading ? (
                    <div>
                      <h3
                        className="mb-6"
                        style={{
                          fontSize: '16px',
                          fontWeight: 400,
                          lineHeight: '16px',
                          color: '#01112C',
                          fontFamily: 'Open Sauce Sans, sans-serif',
                        }}
                      >
                        Two Factor Authentication
                      </h3>
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#7F56D9]"></div>
                        <span className="ml-2 text-sm text-gray-600">Loading security settings...</span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3
                          style={{
                            fontSize: '16px',
                            fontWeight: 400,
                            lineHeight: '16px',
                            color: '#01112C',
                            fontFamily: 'Open Sauce Sans, sans-serif',
                          }}
                        >
                          Two Factor Authentication
                        </h3>
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: 500,
                            color: '#F04438',
                            backgroundColor: '#FEE4E2',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontFamily: 'Open Sauce Sans, sans-serif',
                          }}
                        >
                          Coming Soon
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: '12px',
                          color: '#767D94',
                          marginBottom: '20px',
                          marginTop: '-8px',
                          fontFamily: 'Open Sauce Sans, sans-serif',
                        }}
                      >
                        Note: This feature has not been implemented on the backend yet.
                      </p>

                      {/* SMS Authentication */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                          {/* SMS Icon */}
                          <div className="w-8 h-8 flex items-center justify-center">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                              <rect x="5" y="4" width="14" height="16" rx="2" stroke="#767D94" strokeWidth="2" />
                              <path d="M9 9h6M9 13h6" stroke="#767D94" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                          </div>
                          <span
                            style={{
                              fontSize: '18px',
                              fontWeight: 700,
                              lineHeight: '22px',
                              color: '#767D94',
                              fontFamily: 'Open Sauce Sans, sans-serif',
                            }}
                          >
                            SMS Authentication
                          </span>
                        </div>

                        {/* Toggle Switch */}
                        <button
                          disabled
                          className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-not-allowed bg-[#DDDFE1] opacity-60"
                          aria-label="SMS Authentication (Not yet implemented)"
                        >
                          <span
                            className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1"
                          />
                        </button>
                      </div>

                      {/* Email Authentication */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {/* Email Icon */}
                          <div className="w-8 h-8 flex items-center justify-center">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#767D94" strokeWidth="2" />
                              <polyline points="22,6 12,13 2,6" stroke="#767D94" strokeWidth="2" />
                            </svg>
                          </div>
                          <span
                            style={{
                              fontSize: '18px',
                              fontWeight: 700,
                              lineHeight: '22px',
                              color: '#767D94',
                              fontFamily: 'Open Sauce Sans, sans-serif',
                            }}
                          >
                            Email Authentication
                          </span>
                        </div>

                        {/* Toggle Switch */}
                        <button
                          disabled
                          className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-not-allowed bg-[#DDDFE1] opacity-60"
                          aria-label="Email Authentication (Not yet implemented)"
                        >
                          <span
                            className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1"
                          />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-[rgba(52,64,84,0.7)] backdrop-blur-[16px] flex items-center justify-center z-50">
          <div
            className="bg-white rounded-lg shadow-lg"
            style={{
              width: '480px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={closePasswordModal}
                  className="flex items-center gap-2 text-[#858D96] hover:text-[#6B7280] transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      lineHeight: '17px',
                      fontFamily: 'Open Sauce Sans, sans-serif',
                    }}
                  >
                    Back
                  </span>
                </button>
              </div>

              <h2
                className="mb-2"
                style={{
                  fontSize: '20px',
                  fontWeight: 500,
                  lineHeight: '32px',
                  color: '#021C3E',
                  fontFamily: 'Open Sauce Sans, sans-serif',
                }}
              >
                Password Information
              </h2>
              <p
                style={{
                  fontSize: '16px',
                  fontWeight: 400,
                  lineHeight: '24px',
                  color: '#021C3E',
                  opacity: 0.5,
                  fontFamily: 'Open Sauce Sans, sans-serif',
                }}
              >
                Change your password below
              </p>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="space-y-6">
                {/* Current Password */}
                <div>
                  <label
                    className="block mb-2"
                    style={{
                      fontSize: '14px',
                      fontWeight: 400,
                      lineHeight: '22px',
                      color: '#01112C',
                      opacity: 0.5,
                      fontFamily: 'Open Sauce Sans, sans-serif',
                    }}
                  >
                    Current password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                      className="w-full px-4 py-4 bg-[#F9FAFC] border border-[#BCC7D3] rounded-md focus:outline-none focus:ring-2 focus:ring-[#7A62EB] focus:border-transparent"
                      style={{
                        fontSize: '16px',
                        fontWeight: 400,
                        lineHeight: '16px',
                        fontFamily: 'Open Sauce Sans, sans-serif',
                      }}
                      placeholder="••••••••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#9097A5] hover:text-[#6B7280] transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.5" />
                        <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label
                    className="block mb-2"
                    style={{
                      fontSize: '14px',
                      fontWeight: 400,
                      lineHeight: '22px',
                      color: '#01112C',
                      opacity: 0.5,
                      fontFamily: 'Open Sauce Sans, sans-serif',
                    }}
                  >
                    New password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                      className="w-full px-4 py-4 bg-[#F9FAFC] border border-[#BCC7D3] rounded-md focus:outline-none focus:ring-2 focus:ring-[#7A62EB] focus:border-transparent"
                      style={{
                        fontSize: '16px',
                        fontWeight: 400,
                        lineHeight: '16px',
                        fontFamily: 'Open Sauce Sans, sans-serif',
                      }}
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#9097A5] hover:text-[#6B7280] transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.5" />
                        <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label
                    className="block mb-2"
                    style={{
                      fontSize: '14px',
                      fontWeight: 400,
                      lineHeight: '22px',
                      color: '#01112C',
                      opacity: 0.5,
                      fontFamily: 'Open Sauce Sans, sans-serif',
                    }}
                  >
                    Confirm New password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      className="w-full px-4 py-4 bg-[#F9FAFC] border border-[#BCC7D3] rounded-md focus:outline-none focus:ring-2 focus:ring-[#7A62EB] focus:border-transparent"
                      style={{
                        fontSize: '16px',
                        fontWeight: 400,
                        lineHeight: '16px',
                        fontFamily: 'Open Sauce Sans, sans-serif',
                      }}
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#9097A5] hover:text-[#6B7280] transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.5" />
                        <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between mt-8">
                <button
                  onClick={closePasswordModal}
                  className="text-[#7A62EB] hover:text-[#6941C6] transition-colors focus:outline-none"
                  style={{
                    fontSize: '14px',
                    fontWeight: 400,
                    lineHeight: '17px',
                    fontFamily: 'Open Sauce Sans, sans-serif',
                  }}
                >
                  Cancel
                </button>

                <button
                  onClick={handleChangePassword}
                  disabled={isLoading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                  className="bg-[#7F56D9] hover:bg-[#6941C6] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#7F56D9] focus:ring-offset-2 shadow-sm px-6 py-3"
                  style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    lineHeight: '24px',
                    fontFamily: 'Open Sauce Sans, sans-serif',
                    border: '1px solid #7F56D9',
                    boxShadow: '0px 1px 2px rgba(16, 24, 40, 0.05)',
                  }}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Changing Password...
                    </div>
                  ) : (
                    'Change Password'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Other Modals */}

      {/* Profile Picture Upload Modal */}
      {showProfilePictureModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{
            backgroundColor: 'rgba(52, 64, 84, 0.7)',
            backdropFilter: 'blur(16px)'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowProfilePictureModal(false);
            }
          }}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#021C3E]">
                Upload Profile Picture
              </h3>
              <button
                onClick={() => setShowProfilePictureModal(false)}
                className="text-[#667085] hover:text-[#344054] transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <FileUpload
              accept="image/*"
              maxSize={5 * 1024 * 1024} // 5MB
              maxFiles={1}
              onFileSelect={handleProfilePictureUpload}
              onError={handleProfilePictureError}
              showPreview={true}
              placeholder="Click to upload or drag and drop your profile picture"
              className="mb-4"
            />

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowProfilePictureModal(false)}
                className="px-4 py-2 text-[#344054] border border-[#D0D5DD] rounded-lg hover:bg-[#F9FAFB] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
