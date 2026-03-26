import React from 'react';
import { Package } from 'lucide-react';

interface PackageSelectionProps {
  data: string;
  updateData: (data: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const packages = [
  {
    id: 'silver',
    name: 'Silver',
    price: '$499/month',
    features: [
      'Up to 50 users',
      'Basic content library',
      'Standard reporting',
      'Email support',
      'Monthly analytics'
    ]
  },
  {
    id: 'gold',
    name: 'Gold',
    price: '$999/month',
    features: [
      'Up to 200 users',
      'Extended content library',
      'Advanced reporting',
      'Priority support',
      'Weekly analytics',
      'Custom learning paths'
    ]
  },
  {
    id: 'platinum',
    name: 'Platinum',
    price: '$1,999/month',
    features: [
      'Unlimited users',
      'Full content library',
      'Custom content creation',
      '24/7 premium support',
      'Real-time analytics',
      'Custom learning paths',
      'Dedicated success manager'
    ]
  }
];

const PackageSelection: React.FC<PackageSelectionProps> = ({ data, updateData, onNext, onBack }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (data) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-blue-50 rounded-lg">
          <Package className="w-6 h-6 text-blue-500" />
        </div>
        <div>
          <h2 className="text-2xl font-light text-gray-900">Select Your Package</h2>
          <p className="text-gray-500">Choose the plan that best fits your needs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className={`relative p-6 rounded-xl border-2 transition-all cursor-pointer ${
              data === pkg.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-200'
            }`}
            onClick={() => updateData(pkg.id)}
          >
            <div className="absolute top-4 right-4">
              <input
                type="radio"
                name="package"
                value={pkg.id}
                checked={data === pkg.id}
                onChange={() => updateData(pkg.id)}
                className="w-4 h-4 text-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{pkg.name}</h3>
            <p className="text-2xl font-bold text-blue-600 mb-4">{pkg.price}</p>
            <ul className="space-y-3">
              {pkg.features.map((feature, index) => (
                <li key={index} className="flex items-center text-gray-600">
                  <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
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
          disabled={!data}
        >
          Continue
        </button>
      </div>
    </form>
  );
};

export default PackageSelection;