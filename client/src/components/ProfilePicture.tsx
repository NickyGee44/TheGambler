import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import jeffreyreinerImg from "@/assets/jeffrey-reiner.jpeg";
import baileycarlsonImg from "@/assets/bailey-carlson.jpeg";
import mysteryPlayerImg from "@/assets/mystery-player.svg";
import christianhauckImg from "@/assets/christian-hauck.jpeg";
import jamesogilvieImg from "@/assets/james-ogilvie.jpeg";
import connorpattersonImg from "@/assets/connor-patterson.jpeg";
import kevindurcoImg from "@/assets/kevin-durco.jpeg";
import erikboudreauImg from "/assets/erik-boudreau.jpeg";
import jordankrellerImg from "@/assets/jordan-kreller.jpeg";
import johnnymagnattaImg from "@/assets/johnny-magnatta.jpeg";
import nichuxleyImg from "@/assets/nic-huxley.jpeg";
import nickcookImg from "@/assets/nick-cook.jpeg";
import nickgrossiImg from "@/assets/nick-grossi.jpeg";
import spencerreidImg from "@/assets/spencer-reid.jpeg";
import syeellardImg from "@/assets/sye-ellard.jpeg";
import willbibbingsImg from "@/assets/will-bibbings.jpeg";

interface ProfilePictureProps {
  firstName: string;
  lastName: string;
  userId?: number; // Optional user ID to fetch dynamic profile picture
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}

export default function ProfilePicture({ 
  firstName, 
  lastName,
  userId,
  size = "md", 
  className = "" 
}: ProfilePictureProps) {
  // Fetch user data if userId provided to get dynamic profile picture
  const { data: user } = useQuery<{profilePicture?: string}>({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId,
  });
  // Define profile picture mappings with consistent names
  const profilePictures: Record<string, string> = {
    "Jeffrey Reiner": jeffreyreinerImg,
    "Bailey Carlson": baileycarlsonImg,
    "Mystery Player": mysteryPlayerImg,
    "Christian Hauck": christianhauckImg,
    "James Ogilvie": jamesogilvieImg,
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
    // Keep old names for backward compatibility
    "Jeff Reiner": jeffreyreinerImg,
    "Jonathan Magnatta": johnnymagnattaImg,
    "Will Bibi": willbibbingsImg,
  };

  const fullName = `${firstName || ''} ${lastName || ''}`.trim();
  
  // Priority: user.profilePicture > hardcoded mapping > fallback to initials
  const profilePicture = user?.profilePicture || profilePictures[fullName];
  
  const initials = `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`;
  
  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-10 h-10 text-base",
    xl: "w-12 h-12 text-lg",
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