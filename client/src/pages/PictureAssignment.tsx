import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Import all the current images
import austinHassaniImg from "@/assets/austin-hassani.png";
import baileyCarlsonImg from "@/assets/bailey-carlson.jpeg";
import benBraunImg from "@/assets/ben-braun.jpeg";
import christianHauckImg from "@/assets/christian-hauck.png";
import connorPattersonImg from "@/assets/connor-patterson.jpeg";
import erikBoudreauImg from "@/assets/erik-boudreau.jpeg";
import jeffreyReinerImg from "@/assets/jeffrey-reiner.jpeg";
import johnnyMagnattaImg from "@/assets/johnny-magnatta.jpeg";
import jordanKrellerImg from "@/assets/jordan-kreller.jpeg";
import kevinDurcoImg from "@/assets/kevin-durco.jpeg";
import nicHuxleyImg from "@/assets/nic-huxley.jpeg";
import nickCookImg from "@/assets/nick-cook.jpeg";
import nickGrossiImg from "@/assets/nick-grossi.jpeg";
import spencerReidImg from "@/assets/spencer-reid.jpeg";
import syeEllardImg from "@/assets/sye-ellard.jpeg";
import willBibbingsImg from "@/assets/will-bibbings.jpeg";

const playerNames = [
  "Austin Hassani",
  "Bailey Carlson", 
  "Ben Braun",
  "Christian Hauck",
  "Connor Patterson",
  "Erik Boudreau", 
  "Jeffrey Reiner",
  "Johnny Magnatta",
  "Jordan Kreller",
  "Kevin Durco",
  "Nic Huxley",
  "Nick Cook",
  "Nick Grossi",
  "Spencer Reid",
  "Sye Ellard",
  "Will Bibbings"
];

interface ImageAssignment {
  filename: string;
  currentName: string;
  image: string;
}

export default function PictureAssignment() {
  const { toast } = useToast();
  
  const [assignments, setAssignments] = useState<ImageAssignment[]>([
    { filename: "austin-hassani.png", currentName: "Austin Hassani", image: austinHassaniImg },
    { filename: "bailey-carlson.jpeg", currentName: "Bailey Carlson", image: baileyCarlsonImg },
    { filename: "ben-braun.jpeg", currentName: "Ben Braun", image: benBraunImg },
    { filename: "christian-hauck.png", currentName: "Christian Hauck", image: christianHauckImg },
    { filename: "connor-patterson.jpeg", currentName: "Connor Patterson", image: connorPattersonImg },
    { filename: "erik-boudreau.jpeg", currentName: "Erik Boudreau", image: erikBoudreauImg },
    { filename: "jeffrey-reiner.jpeg", currentName: "Jeffrey Reiner", image: jeffreyReinerImg },
    { filename: "johnny-magnatta.jpeg", currentName: "Johnny Magnatta", image: johnnyMagnattaImg },
    { filename: "jordan-kreller.jpeg", currentName: "Jordan Kreller", image: jordanKrellerImg },
    { filename: "kevin-durco.jpeg", currentName: "Kevin Durco", image: kevinDurcoImg },
    { filename: "nic-huxley.jpeg", currentName: "Nic Huxley", image: nicHuxleyImg },
    { filename: "nick-cook.jpeg", currentName: "Nick Cook", image: nickCookImg },
    { filename: "nick-grossi.jpeg", currentName: "Nick Grossi", image: nickGrossiImg },
    { filename: "spencer-reid.jpeg", currentName: "Spencer Reid", image: spencerReidImg },
    { filename: "sye-ellard.jpeg", currentName: "Sye Ellard", image: syeEllardImg },
    { filename: "will-bibbings.jpeg", currentName: "Will Bibbings", image: willBibbingsImg }
  ]);

  const handleAssignmentChange = (index: number, newName: string) => {
    setAssignments(prev => prev.map((assignment, i) => 
      i === index ? { ...assignment, currentName: newName } : assignment
    ));
  };

  const generateUpdatedComponent = () => {
    const importStatements = assignments.map(assignment => {
      const varName = assignment.currentName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z]/g, '') + 'Img';
      const extension = assignment.filename.split('.').pop();
      return `import ${varName} from "@/assets/${assignment.filename}";`;
    }).join('\n');

    const mappingEntries = assignments.map(assignment => {
      const varName = assignment.currentName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z]/g, '') + 'Img';
      return `    "${assignment.currentName}": ${varName},`;
    }).join('\n');

    const componentCode = `import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
${importStatements}

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
  // Define profile picture mappings with consistent names
  const profilePictures: Record<string, string> = {
${mappingEntries}
  };

  const fullName = \`\${firstName} \${lastName}\`;
  const profilePicture = profilePictures[fullName];
  
  const initials = \`\${firstName.charAt(0)}\${lastName.charAt(0)}\`;
  
  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-10 h-10 text-base",
    xl: "w-12 h-12 text-lg"
  };

  return (
    <Avatar className={\`\${sizeClasses[size]} \${className}\`}>
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
}`;

    return componentCode;
  };

  const saveAssignments = useMutation({
    mutationFn: async (assignments: ImageAssignment[]) => {
      const code = generateUpdatedComponent();
      return apiRequest("/api/admin/update-profile-component", {
        method: "POST",
        body: { code, assignments }
      });
    },
    onSuccess: () => {
      toast({
        title: "Assignments saved!",
        description: "Profile picture assignments have been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Failed to save assignments",
        variant: "destructive",
      });
    }
  });

  const copyToClipboard = () => {
    const code = generateUpdatedComponent();
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied to clipboard",
      description: "The updated ProfilePicture component code has been copied to your clipboard.",
    });
  };

  const handleSaveAssignments = () => {
    saveAssignments.mutate(assignments);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <Card className="bg-gray-900 border-gray-800 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Picture Assignment Tool</CardTitle>
            <CardDescription className="text-gray-400">
              Review each picture and assign it to the correct player name. 
              Once you're satisfied with the assignments, copy the generated code to update the ProfilePicture component.
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
          {assignments.map((assignment, index) => (
            <Card key={assignment.filename} className="bg-gray-900 border-gray-800">
              <CardHeader>
                <div className="flex flex-col items-center space-y-3">
                  <img 
                    src={assignment.image} 
                    alt={assignment.filename}
                    className="w-24 h-24 object-cover rounded-full border-2 border-gray-700"
                  />
                  <div className="text-xs text-gray-500 text-center">
                    {assignment.filename}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Select 
                  value={assignment.currentName} 
                  onValueChange={(value) => handleAssignmentChange(index, value)}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {playerNames.map(name => (
                      <SelectItem key={name} value={name} className="text-white hover:bg-gray-700">
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Generated Component Code</CardTitle>
            <CardDescription className="text-gray-400">
              Copy this code and replace the content of client/src/components/ProfilePicture.tsx
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center mb-4">
              <Button 
                onClick={handleSaveAssignments} 
                className="bg-golf-green-600 hover:bg-golf-green-700"
                disabled={saveAssignments.isPending}
              >
                {saveAssignments.isPending ? "Saving..." : "Save Assignments"}
              </Button>
              <Button 
                onClick={copyToClipboard} 
                variant="outline" 
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                Copy to Clipboard
              </Button>
            </div>
            <pre className="bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm text-gray-300 max-h-96 overflow-y-auto">
              {generateUpdatedComponent()}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}