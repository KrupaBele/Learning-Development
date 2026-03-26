import React, { useState } from "react";
import {
  Bell,
  Shield,
  Globe,
  Mail,
  Users,
  Database,
  Save,
  AlertCircle,
  CheckCircle,
  Sliders,
  BookOpen,
  Layout,
} from "lucide-react";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  const [settings, setSettings] = useState({
    general: {
      siteName: "Elevatics360",
      siteDescription: "Learning & Development Excellence Platform",
      timezone: "UTC-8",
      dateFormat: "MM/DD/YYYY",
      language: "en",
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      courseUpdates: true,
      systemAlerts: true,
      weeklyDigest: false,
    },
    security: {
      twoFactorAuth: false,
      passwordExpiry: "90",
      sessionTimeout: "30",
      loginAttempts: "5",
    },
    appearance: {
      primaryColor: "#3B82F6",
      sidebarCollapsed: false,
      denseMode: false,
      showBreadcrumbs: true,
    },
    course: {
      defaultLanguage: "en",
      autoEnroll: false,
      requireApproval: true,
      maxFileSize: "50",
      allowedFileTypes: ".pdf,.doc,.docx,.ppt,.pptx,.mp4",
    },
  });

  const handleSettingChange = (category, setting, value) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value,
      },
    }));
  };

  const handleSave = () => {
    // Save settings logic here
    setShowSaveNotification(true);
    setTimeout(() => setShowSaveNotification(false), 3000);
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Site Name
        </label>
        <input
          type="text"
          value={settings.general.siteName}
          onChange={(e) =>
            handleSettingChange("general", "siteName", e.target.value)
          }
          className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark:bg-dark-800 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Site Description
        </label>
        <textarea
          value={settings.general.siteDescription}
          onChange={(e) =>
            handleSettingChange("general", "siteDescription", e.target.value)
          }
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark:bg-dark-800 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Timezone
          </label>
          <select
            value={settings.general.timezone}
            onChange={(e) =>
              handleSettingChange("general", "timezone", e.target.value)
            }
            className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark:bg-dark-800 dark:text-white"
          >
            <option value="UTC-8">Pacific Time (UTC-8)</option>
            <option value="UTC-5">Eastern Time (UTC-5)</option>
            <option value="UTC+0">UTC</option>
            <option value="UTC+1">Central European Time (UTC+1)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date Format
          </label>
          <select
            value={settings.general.dateFormat}
            onChange={(e) =>
              handleSettingChange("general", "dateFormat", e.target.value)
            }
            className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark:bg-dark-800 dark:text-white"
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={settings.notifications.emailNotifications}
            onChange={(e) =>
              handleSettingChange(
                "notifications",
                "emailNotifications",
                e.target.checked
              )
            }
            className="w-4 h-4 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-dark-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Email Notifications
          </span>
        </label>

        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={settings.notifications.pushNotifications}
            onChange={(e) =>
              handleSettingChange(
                "notifications",
                "pushNotifications",
                e.target.checked
              )
            }
            className="w-4 h-4 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-dark-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Push Notifications
          </span>
        </label>

        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={settings.notifications.courseUpdates}
            onChange={(e) =>
              handleSettingChange(
                "notifications",
                "courseUpdates",
                e.target.checked
              )
            }
            className="w-4 h-4 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-dark-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Course Updates
          </span>
        </label>

        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={settings.notifications.systemAlerts}
            onChange={(e) =>
              handleSettingChange(
                "notifications",
                "systemAlerts",
                e.target.checked
              )
            }
            className="w-4 h-4 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-dark-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            System Alerts
          </span>
        </label>

        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={settings.notifications.weeklyDigest}
            onChange={(e) =>
              handleSettingChange(
                "notifications",
                "weeklyDigest",
                e.target.checked
              )
            }
            className="w-4 h-4 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-dark-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Weekly Digest
          </span>
        </label>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            Two-Factor Authentication
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Add an extra layer of security to your account
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.security.twoFactorAuth}
            onChange={(e) =>
              handleSettingChange("security", "twoFactorAuth", e.target.checked)
            }
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Password Expiry (days)
        </label>
        <input
          type="number"
          value={settings.security.passwordExpiry}
          onChange={(e) =>
            handleSettingChange("security", "passwordExpiry", e.target.value)
          }
          className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark:bg-dark-800 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Session Timeout (minutes)
        </label>
        <input
          type="number"
          value={settings.security.sessionTimeout}
          onChange={(e) =>
            handleSettingChange("security", "sessionTimeout", e.target.value)
          }
          className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark:bg-dark-800 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Maximum Login Attempts
        </label>
        <input
          type="number"
          value={settings.security.loginAttempts}
          onChange={(e) =>
            handleSettingChange("security", "loginAttempts", e.target.value)
          }
          className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark:bg-dark-800 dark:text-white"
        />
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Primary Color
        </label>
        <input
          type="color"
          value={settings.appearance.primaryColor}
          onChange={(e) =>
            handleSettingChange("appearance", "primaryColor", e.target.value)
          }
          className="w-full h-10 p-1 rounded-lg border border-gray-300 dark:border-dark-600"
        />
      </div>

      <div className="space-y-4">
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={settings.appearance.sidebarCollapsed}
            onChange={(e) =>
              handleSettingChange(
                "appearance",
                "sidebarCollapsed",
                e.target.checked
              )
            }
            className="w-4 h-4 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-dark-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Collapsed Sidebar by Default
          </span>
        </label>

        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={settings.appearance.denseMode}
            onChange={(e) =>
              handleSettingChange("appearance", "denseMode", e.target.checked)
            }
            className="w-4 h-4 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-dark-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Dense Mode
          </span>
        </label>

        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={settings.appearance.showBreadcrumbs}
            onChange={(e) =>
              handleSettingChange(
                "appearance",
                "showBreadcrumbs",
                e.target.checked
              )
            }
            className="w-4 h-4 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-dark-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Show Breadcrumbs
          </span>
        </label>
      </div>
    </div>
  );

  const renderCourseSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Default Course Language
        </label>
        <select
          value={settings.course.defaultLanguage}
          onChange={(e) =>
            handleSettingChange("course", "defaultLanguage", e.target.value)
          }
          className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark:bg-dark-800 dark:text-white"
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
        </select>
      </div>

      <div className="space-y-4">
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={settings.course.autoEnroll}
            onChange={(e) =>
              handleSettingChange("course", "autoEnroll", e.target.checked)
            }
            className="w-4 h-4 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-dark-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Auto-enroll Users in New Courses
          </span>
        </label>

        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={settings.course.requireApproval}
            onChange={(e) =>
              handleSettingChange("course", "requireApproval", e.target.checked)
            }
            className="w-4 h-4 text-blue-600 dark:text-blue-400 border-gray-300 dark:border-dark-600 rounded focus:ring-blue-500 dark:focus:ring-blue-400"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Require Approval for Course Creation
          </span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Maximum File Upload Size (MB)
        </label>
        <input
          type="number"
          value={settings.course.maxFileSize}
          onChange={(e) =>
            handleSettingChange("course", "maxFileSize", e.target.value)
          }
          className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark:bg-dark-800 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Allowed File Types
        </label>
        <input
          type="text"
          value={settings.course.allowedFileTypes}
          onChange={(e) =>
            handleSettingChange("course", "allowedFileTypes", e.target.value)
          }
          className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark:bg-dark-800 dark:text-white"
          placeholder=".pdf,.doc,.docx,.mp4"
        />
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Comma-separated list of file extensions
        </p>
      </div>
    </div>
  );

  const tabs = [
    { id: "general", label: "General", icon: Sliders },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Layout },
    { id: "course", label: "Course", icon: BookOpen },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your application preferences and configurations
          </p>
        </div>

        {/* Settings Content */}
        <div className="bg-white dark:bg-dark-800 shadow rounded-lg">
          <div className="border-b border-gray-200 dark:border-dark-700">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "general" && renderGeneralSettings()}
            {activeTab === "notifications" && renderNotificationSettings()}
            {activeTab === "security" && renderSecuritySettings()}
            {activeTab === "appearance" && renderAppearanceSettings()}
            {activeTab === "course" && renderCourseSettings()}

            <div className="mt-6 flex items-center justify-end space-x-4">
              <button
                onClick={handleSave}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-dark-800"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Notification */}
      {showSaveNotification && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          Settings saved successfully
        </div>
      )}
    </div>
  );
};

export default Settings;
