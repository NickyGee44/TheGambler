import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import nickGrossiImg from "@/assets/nick-grossi.jpeg";
import christianHauckImg from "@/assets/christian-hauck.png";
import johnnyMagnattaImg from "@/assets/johnny-magnatta.jpeg";
import erikBoudreauImg from "@/assets/erik-boudreau.jpeg";
import connorPattersonImg from "@/assets/connor-patterson.jpeg";
import austinHassaniImg from "@/assets/austin-hassani.jpeg";
import jeffreyReinerImg from "@/assets/jeffrey-reiner.png";
import kevinDurcoImg from "@/assets/kevin-durco.jpeg";
import syeEllardImg from "@/assets/sye-ellard.jpeg";
import willBibbingsImg from "@/assets/will-bibbings.jpeg";

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
    "Connor Patterson": connorPattersonImg,
    "Austin Hassani": austinHassaniImg,
    "Jeffrey Reiner": jeffreyReinerImg,
    "Kevin Durco": kevinDurcoImg,
    "Sye Ellard": syeEllardImg,
    "Will Bibbings": willBibbingsImg,
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