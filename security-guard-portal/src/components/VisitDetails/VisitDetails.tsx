import React from 'react';

interface VisitDetailsProps {
  visitData: {
    visitorId: string;
    visitorName: string;
    purpose: string;
    employeeEmail: string;
    visitDate: string;
    visitTime: string;
    status: string;
    actualVisitTime?: string;
    isFuture?: boolean;
    scheduledTime?: string;
    isExpired?: boolean;
  };
  isValid: boolean;
  onClose: () => void;
}

const VisitDetails: React.FC<VisitDetailsProps> = ({ visitData, isValid, onClose }) => {
  if (!isValid) {
    let title = 'Invalid QR Code';
    let message = 'This QR code is not valid or has expired.';
    let iconColor = 'red';

    if (visitData.isFuture) {
      title = 'Visit Time Not Arrived';
      message = `This visit is scheduled for ${new Date(visitData.scheduledTime!).toLocaleString()}. Please come back closer to the scheduled time.`;
      iconColor = 'blue';
    } else if (visitData.isExpired) {
      title = 'Visit Expired';
      message = 'This visit was scheduled for a past date.';
      iconColor = 'red';
    }

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4">
          <div className="text-center">
            <div className={`w-16 h-16 bg-${iconColor}-100 rounded-full flex items-center justify-center mx-auto mb-4`}>
              {visitData.isFuture ? (
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 text-${iconColor}-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 text-${iconColor}-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
            <p className="text-gray-600">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="w-full bg-gray-100 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (visitData.status === 'visited') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Already Visited</h2>
            <p className="text-gray-600">This visitor has already checked in at {new Date(visitData.actualVisitTime!).toLocaleString()}</p>
          </div>
          <button
            onClick={onClose}
            className="w-full bg-gray-100 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Valid Visit</h2>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Visitor Name</p>
                <p className="font-semibold text-gray-900">{visitData.visitorName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Purpose</p>
                <p className="font-semibold text-gray-900">{visitData.purpose}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Visit Date</p>
                <p className="font-semibold text-gray-900">{new Date(visitData.visitDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Visit Time</p>
                <p className="font-semibold text-gray-900">{visitData.visitTime}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Employee Email</p>
                <p className="font-semibold text-gray-900">{visitData.employeeEmail}</p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // Call API to mark visit as completed
                fetch('/api/visitors/mark-visited', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    visitorId: visitData.visitorId,
                  }),
                }).then(() => {
                  onClose();
                });
              }}
              className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Mark as Visited
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitDetails; 