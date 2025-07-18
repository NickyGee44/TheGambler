import LoadingSpinner from "./LoadingSpinner";

interface LoadingPageProps {
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

export default function LoadingPage({ 
  message = "Loading tournament data...", 
  fullScreen = false,
  className = ""
}: LoadingPageProps) {
  const containerClasses = fullScreen 
    ? "min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800"
    : "flex items-center justify-center p-8";

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
            {message}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Please wait while we load the latest information...
          </p>
        </div>
      </div>
    </div>
  );
}