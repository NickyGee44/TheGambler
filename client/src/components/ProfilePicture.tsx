import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import nickGrossiImg from "@/assets/nick-grossi.jpeg";
import christianHauckImg from "@/assets/christian-hauck.png";
import johnnyMagnattaImg from "@/assets/johnny-magnatta.jpeg";
import erikBoudreauImg from "@/assets/erik-boudreau.jpeg";

interface ProfilePictureProps {
  firstName: string;
  lastName: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export default function ProfilePicture({ 
  firstName, 
  lastName, 
  size = "md", 
  className = "" 
}: ProfilePictureProps) {
  // Define profile picture mappings
  const profilePictures: Record<string, string> = {
    "Nick Grossi": nickGrossiImg,
    "Christian Hauck": christianHauckImg,
    "Johnny Magnatta": johnnyMagnattaImg,
    "Johnathan Magnatta": johnnyMagnattaImg,
    "Erik Boudreau": erikBoudreauImg,
    // Add more players as needed
  };

  const fullName = `${firstName} ${lastName}`;
  const profilePicture = profilePictures[fullName];
  
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`;
  
  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-10 h-10 text-base",
    xl: "w-12 h-12 text-lg"
  };

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      {profilePicture && (
        <AvatarImage 
          src={profilePicture} 
          alt={fullName}
          className="object-cover"
        />
      )}
      <AvatarFallback className="bg-golf-green-600 text-white font-semibold">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}