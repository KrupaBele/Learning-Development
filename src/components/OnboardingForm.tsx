import React, { useState } from 'react';
import { Building2, Briefcase, Users, GraduationCap, Settings, CheckCircle2 } from 'lucide-react';
import CompanyInfo from './CompanyInfo';
import ContactInfo from './ContactInfo';
import TrainingNeeds from './TrainingNeeds';
import PackageSelection from './PackageSelection';
import LearningPreferences from './LearningPreferences';
import Terms from './Terms';

const steps = [
  { id: 1, title: 'Company', icon: Building2 },
  { id: 2, title: 'Contact', icon: Briefcase },
  { id: 3, title: 'Training', icon: Users },
  { id: 4, title: 'Package', icon: GraduationCap },
  { id: 5, title: 'Preferences', icon: Settings },
  { id: 6, title: 'Terms', icon: CheckCircle2 },
];

const OnboardingForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    company: {},
    contact: {},
    training: {},
    package: '',
    preferences: {},
    terms: false
  });

  const updateFormData = (section: string, data: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: data
    }));
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <CompanyInfo data={formData.company} updateData={(data) => updateFormData('company', data)} onNext={nextStep} />;
      case 2:
        return <ContactInfo data={formData.contact} updateData={(data) => updateFormData('contact', data)} onNext={nextStep} onBack={prevStep} />;
      case 3:
        return <TrainingNeeds data={formData.training} updateData={(data) => updateFormData('training', data)} onNext={nextStep} onBack={prevStep} />;
      case 4:
        return <PackageSelection data={formData.package} updateData={(data) => updateFormData('package', data)} onNext={nextStep} onBack={prevStep} />;
      case 5:
        return <LearningPreferences data={formData.preferences} updateData={(data) => updateFormData('preferences', data)} onNext={nextStep} onBack={prevStep} />;
      case 6:
        return <Terms data={formData.terms} updateData={(data) => updateFormData('terms', data)} onBack={prevStep} onSubmit={() => console.log('Form submitted:', formData)} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light text-gray-900 mb-4">Welcome to L&D Excellence</h1>
          <p className="text-lg text-gray-600">Transform your organization through powerful learning experiences</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Progress Steps */}
          <div className="border-b border-gray-100">
            <div className="max-w-4xl mx-auto px-8 py-6">
              <div className="flex justify-between">
                {steps.map((step) => {
                  const StepIcon = step.icon;
                  return (
                    <div key={step.id} className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        step.id === currentStep ? 'bg-blue-500 text-white' :
                        step.id < currentStep ? 'bg-green-500 text-white' :
                        'bg-gray-100 text-gray-400'
                      }`}>
                        <StepIcon size={20} />
                      </div>
                      <span className={`mt-2 text-sm ${
                        step.id === currentStep ? 'text-blue-500 font-medium' :
                        step.id < currentStep ? 'text-green-500' :
                        'text-gray-400'
                      }`}>
                        {step.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="max-w-4xl mx-auto px-8 py-12">
            {renderStep()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingForm;