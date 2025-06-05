import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import ErrorBoundary from '../ErrorBoundary';
import VisitDetails from '../VisitDetails/VisitDetails';

interface QRScannerProps {
  onScan: (data: string) => void;
}

interface VisitData {
  visitorId: string;
  visitorName: string;
  purpose: string;
  employeeEmail: string;
  visitDate: string;
  visitTime: string;
  status: string;
  actualVisitTime?: string;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan }) => {
  const qrRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [visitData, setVisitData] = useState<VisitData | null>(null);
  const [isValidQR, setIsValidQR] = useState(false);
  const [scanStatus, setScanStatus] = useState<string>('Initializing...');

  const handleSuccess = useCallback(async (decodedText: string) => {
    console.log('QR Code detected, processing...', decodedText);
    try {
      // Parse the QR data
      const parsedData = JSON.parse(decodedText);
      
      console.log('Verifying QR code with backend...', parsedData);
      // Verify QR code with backend
      const response = await fetch('/api/visitors/verify-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: parsedData.data.token
        }),
      });

      if (!response.ok) {
        console.log('QR code verification failed');
        setIsValidQR(false);
        setShowDetails(true);
        return;
      }

      console.log('QR code verified successfully');
      const verificationData = await response.json();
      setVisitData(verificationData.visitor);
      setIsValidQR(true);
      setShowDetails(true);

      // Pause scanning while showing details
      if (qrRef.current) {
        try {
          console.log('Pausing scanner to show details');
          qrRef.current.pause();
        } catch (err) {
          console.log('Scanner already paused');
        }
      }
    } catch (err) {
      console.error('QR verification error:', err);
      setIsValidQR(false);
      setShowDetails(true);
    }
  }, []);

  const stopScanner = useCallback(() => {
    if (qrRef.current) {
      try {
        qrRef.current.stop().catch(() => {
          console.log('Scanner already stopped');
        });
      } catch (err) {
        console.log('Error stopping scanner:', err);
      }
      qrRef.current = null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initializeScanner = async () => {
      try {
        setScanStatus('Starting camera...');
        
        // Check if browser supports getUserMedia
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Your browser does not support camera access. Please use Chrome, Firefox, or Safari.');
        }

        console.log('Initializing QR scanner...');
        const qrScanner = new Html5Qrcode('qr-reader', {
          verbose: true,
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
        });
        qrRef.current = qrScanner;

        if (!mounted) {
          stopScanner();
          return;
        }

        console.log('Starting QR scanner with configuration...');
        setScanStatus('Scanner active');
        setIsScanning(true);

        try {
          await qrScanner.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0,
              disableFlip: false
            },
            (decodedText: string, decodedResult: any) => {
              console.log('=== QR Code Detected ===');
              console.log('Raw QR Data:', decodedText);
              console.log('Decoded Result:', decodedResult);
              console.log('Timestamp:', new Date().toISOString());
              console.log('=====================');
              handleSuccess(decodedText);
            },
            (errorMessage) => {
              // Log all errors for debugging
              console.log('Scanner status:', errorMessage);
              // Only show non-standard errors to user
              if (!errorMessage.includes('No MultiFormat Readers were able to detect the code')) {
                setScanStatus('Scanner error: ' + errorMessage);
              } else {
                // Update status to show we're actively scanning
                setScanStatus('Scanning...');
              }
            }
          );
          console.log('QR scanner started successfully');
          
          // Log camera capabilities
          const capabilities = qrScanner.getRunningTrackCapabilities();
          console.log('Camera capabilities:', capabilities);
          
        } catch (err) {
          console.error('Error starting scanner:', err);
          setScanStatus('Failed to start scanner: ' + (err instanceof Error ? err.message : 'Unknown error'));
          setIsScanning(false);
          stopScanner();
        }
      } catch (err) {
        console.error('Scanner initialization error:', err);
        setScanStatus('Failed to start scanner: ' + (err instanceof Error ? err.message : 'Unknown error'));
        setIsScanning(false);
        stopScanner();
      }
    };

    initializeScanner();

    return () => {
      console.log('Cleaning up QR scanner...');
      mounted = false;
      stopScanner();
      setIsScanning(false);
    };
  }, [handleSuccess, stopScanner]);

  const handleCloseDetails = () => {
    console.log('Resuming scanner...');
    setShowDetails(false);
    if (qrRef.current) {
      try {
        qrRef.current.resume();
        setScanStatus('Scanner active');
      } catch (err) {
        console.log('Error resuming scanner:', err);
        // If resume fails, try to restart the scanner
        window.location.reload();
      }
    }
  };

  return (
    <ErrorBoundary>
      <div className="w-full px-4 sm:px-6 py-6">
        <div className="w-full space-y-6">
          <div className="relative">
            <div className="aspect-[4/3] relative rounded-2xl overflow-hidden shadow-elegant">
              <div id="qr-reader" className="w-full h-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
              
              {/* Scanning animation */}
              {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-64 border-2 border-white rounded-lg relative">
                    <div className="absolute top-0 left-0 w-full animate-scan bg-white/20 h-0.5" />
                  </div>
                </div>
              )}
            </div>
            
            <div className="absolute top-4 left-4 right-4">
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-md">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm text-surface-700">
                      {isScanning ? 'Position the QR code within the frame to scan' : 'Starting camera...'}
                    </p>
                    <p className="text-xs text-surface-500">{scanStatus}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDetails && (
        <VisitDetails
          visitData={visitData || {
            visitorId: '',
            visitorName: '',
            purpose: '',
            employeeEmail: '',
            visitDate: '',
            visitTime: '',
            status: '',
          }}
          isValid={isValidQR}
          onClose={handleCloseDetails}
        />
      )}
    </ErrorBoundary>
  );
};

export default QRScanner; 