// Using the logo from public directory
const gamblerLogoImg = "/gambler-logo.png";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function LoadingSpinner({ size = "md", className = "" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16"
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} relative`}>
        <img
          src={gamblerLogoImg}
          alt="Loading..."
          className="w-full h-full object-contain animate-spin"
          style={{
            animationDuration: '2s',
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite'
          }}
        />
      </div>
    </div>
  );
}