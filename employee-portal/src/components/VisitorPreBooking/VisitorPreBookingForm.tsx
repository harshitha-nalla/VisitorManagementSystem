import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

interface VisitorFormData {
  name: string;
  email: string;
  phone: string;
  purpose: string;
  visitDate: string;
  visitTime: string;
  additionalNotes: string;
}

const VisitorPreBookingForm: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<VisitorFormData>({
    name: '',
    email: '',
    phone: '',
    purpose: '',
    visitDate: new Date().toISOString().split('T')[0],
    visitTime: new Date().toTimeString().slice(0, 5),
    additionalNotes: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/employee/visitors`,
        {
          ...formData,
          employeeEmail: user?.email
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('employeeToken')}`
          }
        }
      );

      setSuccess(response.data.message);
      // Reset form after successful submission
      setFormData({
        name: '',
        email: '',
        phone: '',
        purpose: '',
        visitDate: new Date().toISOString().split('T')[0],
        visitTime: new Date().toTimeString().slice(0, 5),
        additionalNotes: ''
      });
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to process visitor pre-booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-8 border-b border-blue-200/50">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Pre-book a Visitor</h2>
            <p className="text-slate-600 text-lg">Fill in the details to pre-register a visitor and send them a QR code.</p>
          </div>

          {error && (
            <div className="mx-8 mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="mx-8 mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            <div className="space-y-6">
              <div className="group">
                <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                  Visitor Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50/50 text-slate-800 placeholder-slate-400 transition-all duration-200 focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 hover:border-slate-300"
                  placeholder="Enter visitor's full name"
                />
              </div>

              <div className="group">
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                  Visitor Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50/50 text-slate-800 placeholder-slate-400 transition-all duration-200 focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 hover:border-slate-300"
                  placeholder="Enter visitor's email address"
                />
              </div>

              <div className="group">
                <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-2">
                  Visitor Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50/50 text-slate-800 placeholder-slate-400 transition-all duration-200 focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 hover:border-slate-300"
                  placeholder="Enter visitor's phone number"
                />
              </div>

              <div className="group">
                <label htmlFor="purpose" className="block text-sm font-semibold text-slate-700 mb-2">
                  Purpose of Visit
                </label>
                <select
                  id="purpose"
                  name="purpose"
                  required
                  value={formData.purpose}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50/50 text-slate-800 transition-all duration-200 focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 hover:border-slate-300 cursor-pointer"
                >
                  <option value="">Select purpose</option>
                  <option value="meeting">Meeting</option>
                  <option value="interview">Interview</option>
                  <option value="delivery">Delivery</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label htmlFor="visitDate" className="block text-sm font-semibold text-slate-700 mb-2">
                    Visit Date
                  </label>
                  <input
                    type="date"
                    id="visitDate"
                    name="visitDate"
                    required
                    value={formData.visitDate}
                    onChange={handleChange}
                    disabled={loading}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50/50 text-slate-800 transition-all duration-200 focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 hover:border-slate-300 cursor-pointer"
                  />
                </div>

                <div className="group">
                  <label htmlFor="visitTime" className="block text-sm font-semibold text-slate-700 mb-2">
                    Visit Time
                  </label>
                  <input
                    type="time"
                    id="visitTime"
                    name="visitTime"
                    required
                    value={formData.visitTime}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50/50 text-slate-800 transition-all duration-200 focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 hover:border-slate-300 cursor-pointer"
                  />
                </div>
              </div>

              <div className="group">
                <label htmlFor="additionalNotes" className="block text-sm font-semibold text-slate-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  id="additionalNotes"
                  name="additionalNotes"
                  rows={4}
                  value={formData.additionalNotes}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-slate-50/50 text-slate-800 placeholder-slate-400 transition-all duration-200 focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 hover:border-slate-300 resize-none"
                  placeholder="Any additional information or special requirements..."
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`group relative px-8 py-3 ${
                  loading 
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 hover:shadow-xl hover:-translate-y-0.5'
                } text-white font-semibold rounded-xl shadow-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-200 active:translate-y-0`}
              >
                <span className="relative z-10">{loading ? 'Processing...' : 'Pre-book Visitor'}</span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VisitorPreBookingForm;