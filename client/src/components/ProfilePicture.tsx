import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import jeffreyreinerImg from "@/assets/austin-hassani.png";
import baileycarlsonImg from "@/assets/bailey-carlson.jpeg";
import benbraunImg from "@/assets/ben-braun.jpeg";
import christianhauckImg from "@/assets/christian-hauck.png";
import austinhassaniImg from "@/assets/connor-patterson.jpeg";
import connorpattersonImg from "@/assets/erik-boudreau.jpeg";
import kevindurcoImg from "@/assets/jeffrey-reiner.jpeg";
import erikboudreauImg from "@/assets/IMG_5247_1752522124050.jpeg";
import jordankrellerImg from "@/assets/jordan-kreller.jpeg";
import johnnymagnattaImg from "@/assets/kevin-durco.jpeg";
import nichuxleyImg from "@/assets/nic-huxley.jpeg";
import nickcookImg from "@/assets/nick-cook.jpeg";
import nickgrossiImg from "@/assets/nick-grossi.jpeg";
import spencerreidImg from "@/assets/spencer-reid.jpeg";
import syeellardImg from "@/assets/sye-ellard.jpeg";
import willbibbingsImg from "@/assets/will-bibbings.jpeg";

interface ProfilePictureProps {
  firstName: string;
  lastName: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}

export default function ProfilePicture({ 
  firstName, 
  lastName, 
  size = "lg", 
  className = "" 
}: ProfilePictureProps) {
  // Define profile picture mappings with consistent names
  const profilePictures: Record<string, string> = {
    "Jeffrey Reiner": jeffreyreinerImg,
    "Bailey Carlson": baileycarlsonImg,
    "Ben Braun": benbraunImg,
    "Christian Hauck": christianhauckImg,
    "Austin Hassani": austinhassaniImg,
    "Connor Patterson": connorpattersonImg,
    "Kevin Durco": kevindurcoImg,
    "Erik Boudreau": erikboudreauImg,
    "Jordan Kreller": jordankrellerImg,
    "Johnny Magnatta": johnnymagnattaImg,
    "Nic Huxley": nichuxleyImg,
    "Nick Cook": nickcookImg,
    "Nick Grossi": nickgrossiImg,
    "Spencer Reid": spencerreidImg,
    "Sye Ellard": syeellardImg,
    "Will Bibbings": willbibbingsImg,
    // Add aliases for name variations
    "Jeff Reiner": jeffreyreinerImg,
    "Will Bibi": willbibbingsImg,
    "Jonathan Magnatta": johnnymagnattaImg,
  };

  const fullName = `${firstName} ${lastName}`;
  const profilePicture = profilePictures[fullName];
  
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`;
  
  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
    xl: "w-16 h-16 text-xl",
    "2xl": "w-24 h-24 text-2xl"
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