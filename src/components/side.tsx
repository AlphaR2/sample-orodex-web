// Notification/Toast Component
export const Toast = ({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) => {
  return (
    <div
      className={`fixed top-4 right-4 z-50 rounded-md shadow-lg p-4 min-w-[300px] ${
        type === "success" ? "bg-green-600" : "bg-red-600"
      } text-white flex items-center justify-between`}
    >
      <div className="flex items-center">
        {type === "success" ? (
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
        ) : (
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        )}
        <p>{message}</p>
      </div>
      <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          ></path>
        </svg>
      </button>
    </div>
  );
};

// Confirmation Modal Component
export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-[#060e16] border border-gray-700 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <h3 className="text-xl font-bold mb-4 text-white">Before You Begin</h3>
        <p className="mb-6 text-gray-300">
          To use the trading engine, make sure you have the backend server
          running locally. Clone the repository and follow these steps:
        </p>
        <ol className="list-decimal list-inside mb-6 space-y-2 text-gray-300 text-sm">
          <li>
            Clone the repo:{" "}
            <code className="bg-gray-800 px-1 rounded">
              git clone https://github.com/AlphaR2/sample_orodex.git
            </code>
          </li>
          <li>
            Navigate to the project:{" "}
            <code className="bg-gray-800 px-1 rounded">cd trading-engine</code>
          </li>
          <li>
            Install dependencies:{" "}
            <code className="bg-gray-800 px-1 rounded">npm install</code>
          </li>
          <li>
            Start the server:{" "}
            <code className="bg-gray-800 px-1 rounded">npm run dev</code>
          </li>
        </ol>
        <p className="mb-6 text-gray-300">
          The server should be running on http://localhost:3001
        </p>
        <div className="flex justify-end space-x-3">
          <button
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-[#fb8500] hover:bg-[#7e4300] text-white rounded transition-colors"
            onClick={onConfirm}
          >
            Yes, I'm Ready
          </button>
        </div>
      </div>
    </div>
  );
};
