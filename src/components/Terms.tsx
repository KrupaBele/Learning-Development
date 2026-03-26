import React, { useState } from 'react';
import { FileCheck } from 'lucide-react';

interface TermsProps {
  data: boolean;
  updateData: (data: boolean) => void;
  onBack: () => void;
  onSubmit: () => void;
}

const Terms: React.FC<TermsProps> = ({ data, updateData, onBack, onSubmit }) => {
  const [agreed, setAgreed] = useState(data);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (agreed) {
      updateData(agreed);
      onSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-blue-50 rounded-lg">
          <FileCheck className="w-6 h-6 text-blue-500" />
        </div>
        <div>
          <h2 className="text-2xl font-light text-gray-900">Terms & Conditions</h2>
          <p className="text-gray-500">Please review and accept our terms</p>
        </div>
      </div>

      <div className="prose prose-blue max-w-none">
        <h3>Terms of Service</h3>
        <p>
          By using our L&D services, you agree to these terms. We provide learning and development
          services as described in your selected package. We maintain the right to modify
          course content and delivery methods to ensure the best learning experience.
        </p>

        <h3>Privacy Policy</h3>
        <p>
          We collect and process personal data as necessary to provide our services. This includes
          contact information, learning progress, and assessment results. We implement appropriate
          security measures to protect your data.
        </p>

        <h3>Data Usage</h3>
        <p>
          Your data will be used to:
        </p>
        <ul>
          <li>Deliver and improve our training programs</li>
          <li>Track learning progress and completion</li>
          <li>Generate analytics and reports</li>
          <li>Provide support and communication</li>
        </ul>

        <div className="mt-8">
          <label className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
              required
            />
            <span className="text-sm text-gray-700">
              I have read and agree to the Terms of Service and Privacy Policy. I understand how
              my data will be used and processed.
            </span>
          </label>
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
          disabled={!agreed}
        >
          Submit Application
        </button>
      </div>
    </form>
  );
};

export default Terms;