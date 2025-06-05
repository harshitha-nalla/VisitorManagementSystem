import React, { useState } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';

interface VisitorData {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  purpose: string;
  employeeEmail: string;
  photo: string | null;
}

const VisitorRegistrationForm: React.FC = () => {
  const [visitorData, setVisitorData] = useState<VisitorData>({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    purpose: '',
    employeeEmail: '',
    photo: null,
  });

  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const webcamRef = React.useRef<Webcam>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setVisitorData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages when user starts typing
    setError(null);
    setSuccess(null);
  };

  const capturePhoto = React.useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setVisitorData(prev => ({
        ...prev,
        photo: imageSrc
      }));
      setShowCamera(false);
    }
  }, [webcamRef]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorData.photo) {
      setError('Please capture visitor\'s photo');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess('Processing registration...');

    try {
      // Convert base64 photo to blob
      const base64Data = visitorData.photo.split(',')[1];
      const photoBlob = await fetch(`data:image/jpeg;base64,${base64Data}`).then(res => res.blob());
      
      const formData = new FormData();
      formData.append('visitorName', visitorData.fullName);
      formData.append('visitorEmail', visitorData.email);
      formData.append('visitorPhone', visitorData.phone);
      formData.append('purpose', visitorData.purpose);
      formData.append('employeeEmail', visitorData.employeeEmail);
      formData.append('visitorImage', photoBlob, 'visitor-photo.jpg');

      console.log('Making request to:', `${import.meta.env.VITE_BACKEND_URL}/api/visitors/register`);
      console.log('Form data:', {
        visitorName: visitorData.fullName,
        visitorEmail: visitorData.email,
        visitorPhone: visitorData.phone,
        purpose: visitorData.purpose,
        employeeEmail: visitorData.employeeEmail
      });

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/visitors/register`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('Response:', response);

      if (response.status === 201) {
        setSuccess('✅ Registration successful! Email sent to employee. Please wait for their response.');
        // Reset form
        setVisitorData({
          fullName: '',
          email: '',
          phone: '',
          company: '',
          purpose: '',
          employeeEmail: '',
          photo: null,
        });
      }
    } catch (err: any) {
      setSuccess(null);
      if (err.response?.status === 404) {
        setError('❌ The employee email you entered is not registered in our system. Please verify the email address.');
      } else if (err.response?.data?.message) {
        setError(`❌ ${err.response.data.message}`);
      } else {
        setError('❌ An error occurred while registering the visitor. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 py-6">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          <p className="font-medium">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
          <p className="font-medium">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="space-y-2">
            <label htmlFor="fullName" className="block text-sm font-medium text-surface-700">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={visitorData.fullName}
              onChange={handleInputChange}
              className="form-control"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-surface-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={visitorData.email}
              onChange={handleInputChange}
              className="form-control"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="block text-sm font-medium text-surface-700">
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={visitorData.phone}
              onChange={handleInputChange}
              className="form-control"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="company" className="block text-sm font-medium text-surface-700">
              Company
            </label>
            <input
              type="text"
              id="company"
              name="company"
              value={visitorData.company}
              onChange={handleInputChange}
              className="form-control"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="purpose" className="block text-sm font-medium text-surface-700">
            Purpose of Visit
          </label>
          <textarea
            id="purpose"
            name="purpose"
            value={visitorData.purpose}
            onChange={handleInputChange}
            rows={3}
            className="form-control resize-none"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="employeeEmail" className="block text-sm font-medium text-surface-700">
            Employee Email
          </label>
          <input
            type="email"
            id="employeeEmail"
            name="employeeEmail"
            value={visitorData.employeeEmail}
            onChange={handleInputChange}
            className="form-control"
            required
          />
        </div>

        <div className="mt-8">
          <div className="space-y-4">
            {showCamera ? (
              <div className="space-y-4">
                <div className="relative overflow-hidden rounded-2xl shadow-elegant">
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="w-full max-w-md mx-auto"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                </div>
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="w-full px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-xl hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Capture Photo
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                {visitorData.photo ? (
                  <div className="space-y-4 w-full max-w-md">
                    <div className="relative overflow-hidden rounded-2xl shadow-elegant">
                      <img
                        src={visitorData.photo}
                        alt="Visitor"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCamera(true)}
                      className="w-full px-6 py-3 bg-surface-100 text-surface-700 font-medium rounded-xl hover:bg-surface-200 focus:outline-none focus:ring-2 focus:ring-surface-300 focus:ring-offset-2 transition-all duration-200"
                    >
                      Retake Photo
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowCamera(true)}
                    className="w-full max-w-md px-6 py-3 bg-surface-100 text-surface-700 font-medium rounded-xl hover:bg-surface-200 focus:outline-none focus:ring-2 focus:ring-surface-300 focus:ring-offset-2 transition-all duration-200"
                  >
                    Take Photo
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="pt-6">
          <button
            type="submit"
            disabled={!visitorData.photo || loading}
            className={`w-full px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              visitorData.photo && !loading
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 shadow-md hover:shadow-lg'
                : 'bg-surface-100 text-surface-400 cursor-not-allowed'
            }`}
          >
            {loading ? 'Processing...' : 'Register Visitor'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VisitorRegistrationForm; 