import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Alert, 
  Avatar, 
  Badge, 
  Button, 
  Card, 
  Checkbox, 
  Input, 
  Loader, 
  Modal, 
  Select, 
  TextArea, 
  Toast 
} from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { userService } from '../../services/userService';

const UserSettings = () => {
  const { user, updateUserProfile, signOut } = useAuth();
  const { toast } = useUI();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  // User profile states
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [timeZone, setTimeZone] = useState('UTC');
  
  // Notification settings states
  const [emailNotifications, setEmailNotifications] = useState({
    taskAssigned: true,
    taskStatusChanged: true,
    commentsMentions: true,
    projectInvites: true,
    dailyDigest: false,
    weeklyReport: true
  });

  // App preferences states
  const [preferences, setPreferences] = useState({
    darkMode: false,
    compactView: false,
    autoAssignDueDate: true,
    defaultProjectView: 'kanban',
    language: 'en'
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // We'd typically fetch this from the backend
        // For now, we'll simulate the fetch and use what we have in auth context
        const userData = await userService.getUserProfile(user.uid);
        
        // Set profile data
        setDisplayName(userData.displayName || user.displayName || '');
        setBio(userData.bio || '');
        setJobTitle(userData.jobTitle || '');
        setPhone(userData.phone || '');
        setTimeZone(userData.timeZone || 'UTC');
        
        // Set notification preferences
        if (userData.notifications) {
          setEmailNotifications({
            ...emailNotifications,
            ...userData.notifications
          });
        }
        
        // Set app preferences
        if (userData.preferences) {
          setPreferences({
            ...preferences,
            ...userData.preferences
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load user settings');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user, toast]);

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      
      // Update profile in Firebase Auth
      await updateUserProfile({
        displayName
      });
      
      // Update extended profile in our database
      await userService.updateUserProfile(user.uid, {
        displayName,
        bio,
        jobTitle,
        phone,
        timeZone
      });
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setSaving(true);
      
      await userService.updateUserSettings(user.uid, {
        notifications: emailNotifications
      });
      
      toast.success('Notification preferences updated');
    } catch (error) {
      console.error('Error updating notifications:', error);
      toast.error('Failed to update notification preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setSaving(true);
      
      await userService.updateUserSettings(user.uid, {
        preferences
      });
      
      toast.success('App preferences updated');
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update app preferences');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (currentPassword, newPassword) => {
    try {
      setSaving(true);
      
      // This would be handled differently with Google Auth
      // For email/password auth, we'd do:
      // await updatePassword(currentPassword, newPassword);
      
      toast.success('Password updated successfully');
      setShowPasswordModal(false);
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your account settings and preferences</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <Card>
            <div className="p-4">
              <div className="flex flex-col items-center mb-6">
                <Avatar
                  src={user?.photoURL}
                  alt={user?.displayName}
                  size="lg"
                  className="mb-3"
                />
                <h3 className="font-medium text-gray-900">{user?.displayName || 'User'}</h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'profile'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Profile Information
                </button>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'notifications'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Notification Settings
                </button>
                <button
                  onClick={() => setActiveTab('preferences')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'preferences'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  App Preferences
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'security'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Security
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <Button variant="outline" color="danger" fullWidth onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Main content */}
        <div className="flex-1">
          <Card>
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                      Display Name
                    </label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your name"
                      fullWidth
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      value={user?.email}
                      disabled
                      fullWidth
                      helperText="Email cannot be changed directly when using Google authentication"
                    />
                  </div>

                  <div>
                    <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-1">
                      Job Title
                    </label>
                    <Input
                      id="jobTitle"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g. Product Manager"
                      fullWidth
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +1 (123) 456-7890"
                      fullWidth
                    />
                  </div>

                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    <TextArea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell your team a bit about yourself"
                      rows={3}
                      fullWidth
                    />
                  </div>

                  <div>
                    <label htmlFor="timeZone" className="block text-sm font-medium text-gray-700 mb-1">
                      Time Zone
                    </label>
                    <Select
                      id="timeZone"
                      value={timeZone}
                      onChange={(e) => setTimeZone(e.target.value)}
                      fullWidth
                    >
                      <option value="UTC">UTC (Coordinated Universal Time)</option>
                      <option value="America/New_York">Eastern Time (ET)</option>
                      <option value="America/Chicago">Central Time (CT)</option>
                      <option value="America/Denver">Mountain Time (MT)</option>
                      <option value="America/Los_Angeles">Pacific Time (PT)</option>
                      <option value="Europe/London">Greenwich Mean Time (GMT)</option>
                      <option value="Europe/Paris">Central European Time (CET)</option>
                      <option value="Asia/Tokyo">Japan Standard Time (JST)</option>
                    </Select>
                  </div>

                  <div className="pt-4">
                    <Button onClick={handleSaveProfile} loading={saving}>
                      Save Profile
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Email Notifications</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <Checkbox
                          id="taskAssigned"
                          checked={emailNotifications.taskAssigned}
                          onChange={(e) => setEmailNotifications({
                            ...emailNotifications,
                            taskAssigned: e.target.checked
                          })}
                          className="mt-0.5"
                        />
                        <div className="ml-3">
                          <label htmlFor="taskAssigned" className="text-sm font-medium text-gray-700">
                            Task Assigned
                          </label>
                          <p className="text-xs text-gray-500">
                            Receive an email when a task is assigned to you
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <Checkbox
                          id="taskStatusChanged"
                          checked={emailNotifications.taskStatusChanged}
                          onChange={(e) => setEmailNotifications({
                            ...emailNotifications,
                            taskStatusChanged: e.target.checked
                          })}
                          className="mt-0.5"
                        />
                        <div className="ml-3">
                          <label htmlFor="taskStatusChanged" className="text-sm font-medium text-gray-700">
                            Task Status Changes
                          </label>
                          <p className="text-xs text-gray-500">
                            Receive an email when the status of a task you're assigned to changes
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <Checkbox
                          id="commentsMentions"
                          checked={emailNotifications.commentsMentions}
                          onChange={(e) => setEmailNotifications({
                            ...emailNotifications,
                            commentsMentions: e.target.checked
                          })}
                          className="mt-0.5"
                        />
                        <div className="ml-3">
                          <label htmlFor="commentsMentions" className="text-sm font-medium text-gray-700">
                            Comments & Mentions
                          </label>
                          <p className="text-xs text-gray-500">
                            Receive an email when someone comments on your task or mentions you
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <Checkbox
                          id="projectInvites"
                          checked={emailNotifications.projectInvites}
                          onChange={(e) => setEmailNotifications({
                            ...emailNotifications,
                            projectInvites: e.target.checked
                          })}
                          className="mt-0.5"
                        />
                        <div className="ml-3">
                          <label htmlFor="projectInvites" className="text-sm font-medium text-gray-700">
                            Project Invitations
                          </label>
                          <p className="text-xs text-gray-500">
                            Receive an email when you're invited to join a project
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <Checkbox
                          id="dailyDigest"
                          checked={emailNotifications.dailyDigest}
                          onChange={(e) => setEmailNotifications({
                            ...emailNotifications,
                            dailyDigest: e.target.checked
                          })}
                          className="mt-0.5"
                        />
                        <div className="ml-3">
                          <label htmlFor="dailyDigest" className="text-sm font-medium text-gray-700">
                            Daily Digest
                          </label>
                          <p className="text-xs text-gray-500">
                            Receive a daily summary of your tasks and activities
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <Checkbox
                          id="weeklyReport"
                          checked={emailNotifications.weeklyReport}
                          onChange={(e) => setEmailNotifications({
                            ...emailNotifications,
                            weeklyReport: e.target.checked
                          })}
                          className="mt-0.5"
                        />
                        <div className="ml-3">
                          <label htmlFor="weeklyReport" className="text-sm font-medium text-gray-700">
                            Weekly Report
                          </label>
                          <p className="text-xs text-gray-500">
                            Receive a weekly report of your completed tasks and project progress
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button onClick={handleSaveNotifications} loading={saving}>
                      Save Notification Settings
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">App Preferences</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Checkbox
                      id="darkMode"
                      checked={preferences.darkMode}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        darkMode: e.target.checked
                      })}
                      className="mt-0.5"
                    />
                    <div className="ml-3">
                      <label htmlFor="darkMode" className="text-sm font-medium text-gray-700">
                        Dark Mode
                      </label>
                      <p className="text-xs text-gray-500">
                        Use dark theme for the application
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Checkbox
                      id="compactView"
                      checked={preferences.compactView}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        compactView: e.target.checked
                      })}
                      className="mt-0.5"
                    />
                    <div className="ml-3">
                      <label htmlFor="compactView" className="text-sm font-medium text-gray-700">
                        Compact View
                      </label>
                      <p className="text-xs text-gray-500">
                        Display content in a more compact layout
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Checkbox
                      id="autoAssignDueDate"
                      checked={preferences.autoAssignDueDate}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        autoAssignDueDate: e.target.checked
                      })}
                      className="mt-0.5"
                    />
                    <div className="ml-3">
                      <label htmlFor="autoAssignDueDate" className="text-sm font-medium text-gray-700">
                        Auto-assign Due Date
                      </label>
                      <p className="text-xs text-gray-500">
                        Automatically suggest due dates for new tasks based on project timelines
                      </p>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="defaultProjectView" className="block text-sm font-medium text-gray-700 mb-1">
                      Default Project View
                    </label>
                    <Select
                      id="defaultProjectView"
                      value={preferences.defaultProjectView}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        defaultProjectView: e.target.value
                      })}
                      fullWidth
                    >
                      <option value="kanban">Kanban Board</option>
                      <option value="list">List View</option>
                      <option value="calendar">Calendar View</option>
                      <option value="gantt">Gantt Chart</option>
                    </Select>
                  </div>

                  <div>
                    <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                      Language
                    </label>
                    <Select
                      id="language"
                      value={preferences.language}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        language: e.target.value
                      })}
                      fullWidth
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="pt">Portuguese</option>
                      <option value="ja">Japanese</option>
                      <option value="zh">Chinese (Simplified)</option>
                    </Select>
                  </div>

                  <div className="pt-4">
                    <Button onClick={handleSavePreferences} loading={saving}>
                      Save Preferences
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h2>
                
                <Alert 
                  title="Google Sign-in Account" 
                  variant="info" 
                  className="mb-6"
                >
                  <p>You're signed in with Google. Password management is handled through your Google account.</p>
                </Alert>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Account Security</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
                          <p className="text-xs text-gray-500">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <Badge variant="warning" size="sm">Managed by Google</Badge>
                      </div>

                      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Active Sessions</h4>
                          <p className="text-xs text-gray-500">
                            View and manage your active sessions
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          View Sessions
                        </Button>
                      </div>

                      <div className="flex items-center justify-between pb-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Account Deletion</h4>
                          <p className="text-xs text-gray-500">
                            Permanently delete your account and all data
                          </p>
                        </div>
                        <Button variant="outline" color="danger" size="sm">
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Password Change Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <Input
              id="currentPassword"
              type="password"
              placeholder="Enter your current password"
              fullWidth
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <Input
              id="newPassword"
              type="password"
              placeholder="Enter your new password"
              fullWidth
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your new password"
              fullWidth
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <Button variant="outline" onClick={() => setShowPasswordModal(false)}>
            Cancel
          </Button>
          <Button onClick={() => handlePasswordUpdate('current', 'new')} loading={saving}>
            Update Password
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default UserSettings;