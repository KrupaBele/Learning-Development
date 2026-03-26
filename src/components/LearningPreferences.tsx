import React, { useState } from 'react';
import { Settings } from 'lucide-react';

interface LearningPreferencesProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const deliveryMethods = [
  { id: 'onsite', label: 'Onsite Training' },
  { id: 'virtual', label: 'Virtual Learning' },
  { id: 'hybrid', label: 'Hybrid Approach' }
];

const frequencies = [
  { id: 'weekly', label: 'Weekly Sessions' },
  { id: 'biweekly', label: 'Bi-weekly Sessions' },
  { id: 'monthly', label: 'Monthly Sessions' },
  { id: 'quarterly', label: 'Quarterly Sessions' }
];

const collaborationMethods = [
  { id: 'teams', label: 'Microsoft Teams' },
  { id: 'zoom', label: 'Zoom' },
  { id: 'slack', label: 'Slack' },
  { id: 'lms', label: 'Learning Management System' }
];

const assessmentTypes = [
  { id: 'quizzes', label: 'Regular Quizzes' },
  { id: 'projects', label: 'Project-based Assessments' },
  { id: 'peer', label: 'Peer Reviews' },
  { id: 'certification', label: 'Certification Exams' }
];

const LearningPreferences: React.FC<LearningPreferencesProps> = ({ data, updateData, onNext, onBack }) => {
  const [formData, setFormData] = useState({
    deliveryMethod: data.deliveryMethod || '',
    frequency: data.frequency || '',
    collaboration: data.collaboration || [],
    assessments: data.assessments || [],
    systems: data.systems || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (category: string, id: string) => {
    setFormData(prev => ({
      ...prev,
      [category]: prev[category].includes(id)
        ? prev[category].filter((item: string) => item !== id)
        : [...prev[category], id]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateData(formData);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-blue-50 rounded-lg">
          <Settings className="w-6 h-6 text-blue-500" />
        </div>
        <div>
          <h2 className="text-2xl font-light text-gray-900">Learning Preferences</h2>
          <p className="text-gray-500">Customize your learning experience</p>
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Preferred Delivery Method
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {deliveryMethods.map(method => (
              <label key={method.id} className="relative flex items-center justify-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition">
                <input
                  type="radio"
                  name="deliveryMethod"
                  value={method.id}
                  checked={formData.deliveryMethod === method.id}
                  onChange={handleChange}
                  className="absolute top-4 right-4"
                  required
                />
                <span className="text-gray-700">{method.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Session Frequency
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {frequencies.map(freq => (
              <label key={freq.id} className="relative flex items-center justify-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition">
                <input
                  type="radio"
                  name="frequency"
                  value={freq.id}
                  checked={formData.frequency === freq.id}
                  onChange={handleChange}
                  className="absolute top-4 right-4"
                  required
                />
                <span className="text-gray-700">{freq.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Preferred Collaboration Methods
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {collaborationMethods.map(method => (
              <label key={method.id} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={formData.collaboration.includes(method.id)}
                  onChange={() => handleCheckboxChange('collaboration', method.id)}
                  className="w-4 h-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-gray-700">{method.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Assessment Types
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assessmentTypes.map(type => (
              <label key={type.id} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={formData.assessments.includes(type.id)}
                  onChange={() => handleCheckboxChange('assessments', type.id)}
                  className="w-4 h-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-gray-700">{type.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Existing Systems Integration
          </label>
          <textarea
            name="systems"
            value={formData.systems}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            placeholder="List any existing learning systems or tools you'd like to integrate with..."
          />
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 focus:ring-4 focus:ring-gray-100 transition"
        >
          Back
        </button>
        <button
          type="submit"
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-4 focus:ring-blue-200 transition"
        >
          Continue
        </button>
      </div>
    </form>
  );
};

export default LearningPreferences;