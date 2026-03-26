import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';

interface TrainingNeedsProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const trainingTopics = [
  { id: 'leadership', label: 'Leadership Development' },
  { id: 'compliance', label: 'Compliance Training' },
  { id: 'techSkills', label: 'Technical Skills' },
  { id: 'softSkills', label: 'Soft Skills' },
  { id: 'projectManagement', label: 'Project Management' },
  { id: 'communication', label: 'Communication Skills' },
  { id: 'sales', label: 'Sales Training' },
  { id: 'customerService', label: 'Customer Service' }
];

const desiredOutcomes = [
  { id: 'skillDevelopment', label: 'Skill Development' },
  { id: 'complianceAdherence', label: 'Compliance Adherence' },
  { id: 'productivity', label: 'Increased Productivity' },
  { id: 'retention', label: 'Employee Retention' },
  { id: 'engagement', label: 'Employee Engagement' },
  { id: 'leadership', label: 'Leadership Pipeline' }
];

const contentFormats = [
  { id: 'video', label: 'Video Lessons' },
  { id: 'articles', label: 'Articles & Reading Materials' },
  { id: 'interactive', label: 'Interactive Modules' },
  { id: 'workshops', label: 'Live Workshops' },
  { id: 'simulations', label: 'Simulations' },
  { id: 'assessments', label: 'Quizzes & Assessments' }
];

const TrainingNeeds: React.FC<TrainingNeedsProps> = ({ data, updateData, onNext, onBack }) => {
  const [formData, setFormData] = useState({
    challenges: data.challenges || '',
    topics: data.topics || [],
    outcomes: data.outcomes || [],
    formats: data.formats || []
  });

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
          <BookOpen className="w-6 h-6 text-blue-500" />
        </div>
        <div>
          <h2 className="text-2xl font-light text-gray-900">Training Needs Assessment</h2>
          <p className="text-gray-500">Help us understand your learning and development goals</p>
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current L&D Focus and Challenges
          </label>
          <textarea
            name="challenges"
            value={formData.challenges}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            placeholder="Describe your current L&D challenges and focus areas..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Priority Topics
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trainingTopics.map(topic => (
              <label key={topic.id} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={formData.topics.includes(topic.id)}
                  onChange={() => handleCheckboxChange('topics', topic.id)}
                  className="w-4 h-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-gray-700">{topic.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Desired Outcomes
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {desiredOutcomes.map(outcome => (
              <label key={outcome.id} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={formData.outcomes.includes(outcome.id)}
                  onChange={() => handleCheckboxChange('outcomes', outcome.id)}
                  className="w-4 h-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-gray-700">{outcome.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Learning Content Formats
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contentFormats.map(format => (
              <label key={format.id} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={formData.formats.includes(format.id)}
                  onChange={() => handleCheckboxChange('formats', format.id)}
                  className="w-4 h-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-gray-700">{format.label}</span>
              </label>
            ))}
          </div>
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

export default TrainingNeeds;