// Visual score indicators for golf scores
// Circle for birdie, double circle for eagle, star for albatross/hole-in-one
// Box for bogey, double box for double bogey, triple box for triple bogey, thick box for worse

interface ScoreIndicatorProps {
  strokes: number;
  par: number;
  size?: 'sm' | 'md' | 'lg';
}

export function getScoreStyle(strokes: number, par: number = 4, size: 'sm' | 'md' | 'lg' = 'md') {
  const scoreDiff = strokes - par;
  
  // Size-based dimensions
  const sizeMap = {
    sm: "w-5 h-5 text-xs",
    md: "w-6 h-6 text-xs", 
    lg: "w-8 h-8 text-sm"
  };
  
  const baseStyle = `inline-flex items-center justify-center ${sizeMap[size]} font-medium`;
  
  if (scoreDiff <= -3) {
    // Albatross or hole-in-one - star
    return `${baseStyle} bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-sm border-2 border-purple-400 relative before:content-['★'] before:absolute before:text-yellow-500 before:text-lg before:font-bold`;
  } else if (scoreDiff === -2) {
    // Eagle - double circle
    return `${baseStyle} bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full border-4 border-yellow-500 ring-2 ring-yellow-300`;
  } else if (scoreDiff === -1) {
    // Birdie - single circle
    return `${baseStyle} bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full border-2 border-green-500`;
  } else if (scoreDiff === 0) {
    // Par - no special styling
    return `${baseStyle} text-gray-700 dark:text-gray-300`;
  } else if (scoreDiff === 1) {
    // Bogey - single box
    return `${baseStyle} bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 border-2 border-orange-500`;
  } else if (scoreDiff === 2) {
    // Double bogey - double box
    return `${baseStyle} bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-4 border-red-500 ring-2 ring-red-300`;
  } else if (scoreDiff === 3) {
    // Triple bogey - triple box
    return `${baseStyle} bg-red-200 dark:bg-red-800 text-red-900 dark:text-red-100 border-4 border-red-600 ring-4 ring-red-400`;
  } else {
    // Worse than triple bogey - thick box
    return `${baseStyle} bg-black dark:bg-gray-900 text-white border-4 border-black dark:border-gray-700 ring-2 ring-gray-400`;
  }
}

export default function ScoreIndicator({ strokes, par, size = 'md' }: ScoreIndicatorProps) {
  const scoreStyle = getScoreStyle(strokes, par, size);
  
  return (
    <span className={scoreStyle}>
      {strokes}
    </span>
  );
}