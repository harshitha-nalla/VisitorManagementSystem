import React, { useState } from 'react';
import VisitorRegistrationForm from '../VisitorRegistration/VisitorRegistrationForm';
import QRScanner from '../QRScanner/QRScanner';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface ScannedVisitorData {
  fullName?: string;
  email?: string;
  phone?: string;
  company?: string;
  purpose?: string;
  checkInTime?: string;
  status?: 'CHECKED_IN' | 'CHECKED_OUT';
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
      className="w-full"
    >
      {value === index && children}
    </div>
  );
};

const SecurityDashboard: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [scannedData, setScannedData] = useState<ScannedVisitorData | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const handleTabChange = (tabIndex: number) => {
    setCurrentTab(tabIndex);
    // Reset scan data when switching tabs
    setScannedData(null);
    setScanError(null);
  };

  const handleQRScan = (data: string) => {
    console.log('SecurityDashboard received data:', data); // Debug log
    
    // First check if the data is empty or undefined
    if (!data) {
      console.log('Received empty data');
      return;
    }

    try {
      // Try to parse the QR code data as JSON
      const parsedData = JSON.parse(data);
      console.log('SecurityDashboard parsed JSON:', parsedData); // Debug log
      
      // Validate if it's a visitor QR code
      if (parsedData.type === 'visitor') {
        console.log('Valid visitor QR code detected:', parsedData.data); // Debug log
        setScannedData(parsedData.data);
        setScanError(null);
      } else {
        console.log('Invalid QR code type:', parsedData.type); // Debug log
        setScanError('Invalid QR code type. Please scan a valid visitor QR code.');
      }
    } catch (error) {
      console.log('Failed to parse as JSON, checking for URL or plain text'); // Debug log
      // If it's not JSON, check if it's a URL
      if (data.startsWith('http://') || data.startsWith('https://')) {
        console.log('URL QR code detected:', data); // Debug log
        // Handle URL QR codes
        window.open(data, '_blank');
      } else {
        console.log('Plain text QR code detected:', data); // Debug log
        // Handle plain text QR codes
        const now = new Date();
        setScannedData({
          fullName: 'Unknown',
          status: 'CHECKED_IN',
          checkInTime: now.toISOString(),
          purpose: data
        });
        setScanError(null);
      }
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-primary-50 to-accent-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="w-full bg-white/80 backdrop-blur-lg rounded-3xl shadow-elegant overflow-hidden">
          <div className="w-full px-6 sm:px-8 py-6 border-b border-surface-200">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-r from-primary-400 to-primary-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                Security Guard Portal
              </h1>
            </div>
          </div>

          <div className="flex w-full px-6 sm:px-8">
            <button
              className={`relative px-4 sm:px-6 py-4 text-sm font-medium transition-all duration-200 ease-in-out focus:outline-none ${
                currentTab === 0
                  ? 'text-primary-600'
                  : 'text-surface-500 hover:text-surface-700'
              }`}
              onClick={() => handleTabChange(0)}
            >
              <span className="relative z-10">Register Visitor</span>
              {currentTab === 0 && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary-400 to-primary-600 transform scale-x-100 transition-transform duration-300" />
              )}
            </button>
            <button
              className={`relative px-4 sm:px-6 py-4 text-sm font-medium transition-all duration-200 ease-in-out focus:outline-none ${
                currentTab === 1
                  ? 'text-primary-600'
                  : 'text-surface-500 hover:text-surface-700'
              }`}
              onClick={() => handleTabChange(1)}
            >
              <span className="relative z-10">Scan QR Code</span>
              {currentTab === 1 && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary-400 to-primary-600 transform scale-x-100 transition-transform duration-300" />
              )}
            </button>
          </div>

          <div className="w-full bg-surface-50/50">
            <TabPanel value={currentTab} index={0}>
              <VisitorRegistrationForm />
            </TabPanel>

            <TabPanel value={currentTab} index={1}>
              <div className="w-full space-y-6">
                <QRScanner onScan={handleQRScan} />
                
                {scanError && (
                  <div className="mx-4 sm:mx-6 p-4 bg-red-50 border border-red-100 rounded-xl">
                    <p className="text-sm text-red-600">{scanError}</p>
                  </div>
                )}

                {scannedData && (
                  <div className="mx-4 sm:mx-6 p-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-elegant">
                    <h3 className="text-lg font-semibold text-surface-900 mb-4">Scanned Visitor Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-surface-500">Name:</span>
                        <span className="font-medium text-surface-900">{scannedData.fullName}</span>
                      </div>
                      {scannedData.email && (
                        <div className="flex justify-between">
                          <span className="text-surface-500">Email:</span>
                          <span className="font-medium text-surface-900">{scannedData.email}</span>
                        </div>
                      )}
                      {scannedData.phone && (
                        <div className="flex justify-between">
                          <span className="text-surface-500">Phone:</span>
                          <span className="font-medium text-surface-900">{scannedData.phone}</span>
                        </div>
                      )}
                      {scannedData.company && (
                        <div className="flex justify-between">
                          <span className="text-surface-500">Company:</span>
                          <span className="font-medium text-surface-900">{scannedData.company}</span>
                        </div>
                      )}
                      {scannedData.purpose && (
                        <div className="flex justify-between">
                          <span className="text-surface-500">Purpose:</span>
                          <span className="font-medium text-surface-900">{scannedData.purpose}</span>
                        </div>
                      )}
                      {scannedData.checkInTime && (
                        <div className="flex justify-between">
                          <span className="text-surface-500">Check-in Time:</span>
                          <span className="font-medium text-surface-900">
                            {new Date(scannedData.checkInTime).toLocaleString()}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-surface-500">Status:</span>
                        <span className={`font-medium ${
                          scannedData.status === 'CHECKED_IN' 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {scannedData.status || 'CHECKED_IN'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabPanel>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard; 