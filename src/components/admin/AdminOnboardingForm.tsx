import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Building2, UserCircle, CheckCircle2 } from 'lucide-react';

const steps = [
  { id: 1, title: 'Company', icon: Building2 },
  { id: 2, title: 'Contact', icon: UserCircle },
  { id: 3, title: 'Done', icon: CheckCircle2 },
];

const AdminOnboardingForm = () => {
  const navigate = useNavigate();
  const token = useSelector((state: any) => state.auth.token);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [companyData, setCompanyData] = useState({
    companyName: '',
    numberOfEmployees: '',
    gstNumber: '',
  });

  const [contactData, setContactData] = useState({
    contactName: '',
    contactEmail: '',
    contactPhone: '',
  });

  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCompanyData(prev => ({ ...prev, [name]: value }));
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContactData(prev => ({ ...prev, [name]: value }));
  };

  const handleCompanyNext = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(2);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/onboarding`,
        {
          ...companyData,
          numberOfEmployees: Number(companyData.numberOfEmployees),
          ...contactData,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCurrentStep(3);
      toast.success('Client onboarded successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to onboard client');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCompanyData({ companyName: '', numberOfEmployees: '', gstNumber: '' });
    setContactData({ contactName: '', contactEmail: '', contactPhone: '' });
    setCurrentStep(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light text-gray-900 mb-4">Onboard New Client</h1>
          <p className="text-lg text-gray-600">Add a new company to the L&amp;D Excellence platform</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Progress Steps */}
          <div className="border-b border-gray-100">
            <div className="max-w-4xl mx-auto px-8 py-6">
              <div className="flex justify-around">
                {steps.map(step => {
                  const StepIcon = step.icon;
                  return (
                    <div key={step.id} className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        step.id === currentStep ? 'bg-blue-500 text-white' :
                        step.id < currentStep  ? 'bg-green-500 text-white' :
                        'bg-gray-100 text-gray-400'
                      }`}>
                        <StepIcon size={20} />
                      </div>
                      <span className={`mt-2 text-sm ${
                        step.id === currentStep ? 'text-blue-500 font-medium' :
                        step.id < currentStep  ? 'text-green-500' :
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

            {/* Step 1: Company Details */}
            {currentStep === 1 && (
              <form onSubmit={handleCompanyNext} className="space-y-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Building2 className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-light text-gray-900">Company Information</h2>
                    <p className="text-gray-500">Tell us about the organisation</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={companyData.companyName}
                      onChange={handleCompanyChange}
                      placeholder="e.g. Acme Corporation"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Employees
                    </label>
                    <input
                      type="number"
                      name="numberOfEmployees"
                      value={companyData.numberOfEmployees}
                      onChange={handleCompanyChange}
                      placeholder="e.g. 200"
                      min="1"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GST Number
                    </label>
                    <input
                      type="text"
                      name="gstNumber"
                      value={companyData.gstNumber}
                      onChange={handleCompanyChange}
                      placeholder="e.g. 22AAAAA0000A1Z5"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition uppercase"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-6">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-4 focus:ring-blue-200 transition"
                  >
                    Continue
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Contact Person */}
            {currentStep === 2 && (
              <form onSubmit={handleContactSubmit} className="space-y-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <UserCircle className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-light text-gray-900">Contact Information</h2>
                    <p className="text-gray-500">Point of contact who will manage employee training</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="contactName"
                      value={contactData.contactName}
                      onChange={handleContactChange}
                      placeholder="e.g. John Doe"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email ID
                    </label>
                    <input
                      type="email"
                      name="contactEmail"
                      value={contactData.contactEmail}
                      onChange={handleContactChange}
                      placeholder="e.g. john.doe@acme.com"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Number
                    </label>
                    <input
                      type="tel"
                      name="contactPhone"
                      value={contactData.contactPhone}
                      onChange={handleContactChange}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-6">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-6 py-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 focus:ring-4 focus:ring-gray-100 transition"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-4 focus:ring-blue-200 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit'
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Success */}
            {currentStep === 3 && (
              <div className="text-center py-8">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                  </div>
                </div>
                <h2 className="text-3xl font-light text-gray-900 mb-3">Client Onboarded!</h2>
                <p className="text-gray-500 mb-2">
                  <span className="font-medium text-gray-700">{companyData.companyName}</span> has been successfully added to the platform.
                </p>
                <p className="text-gray-500 mb-10">
                  You can now assign courses to this client from the Client Details page.
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => navigate('/admin/client-details')}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-4 focus:ring-blue-200 transition"
                  >
                    View Client Details
                  </button>
                  <button
                    onClick={resetForm}
                    className="px-6 py-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 focus:ring-4 focus:ring-gray-100 transition"
                  >
                    Add Another Client
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOnboardingForm;
