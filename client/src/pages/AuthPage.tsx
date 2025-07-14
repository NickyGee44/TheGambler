import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, MapPin, Calendar, Users } from "lucide-react";

export default function AuthPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Get available players
  const { data: players, isLoading: playersLoading } = useQuery({
    queryKey: ["/api/players"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/players");
      return await res.json();
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { playerName: string; password: string }) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: { playerName: string; password: string }) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      return await res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/user"], user);
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    playerName: "",
    password: "",
  });

  // Redirect if already logged in
  if (user) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      loginMutation.mutate(formData);
    } else {
      registerMutation.mutate(formData);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePlayerSelect = (value: string) => {
    setFormData({
      ...formData,
      playerName: value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700 dark:from-green-950 dark:via-green-900 dark:to-green-800">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center min-h-screen">
          {/* Left Side - Hero */}
          <div className="text-center lg:text-left">
            <h1 className="text-5xl font-bold text-white mb-4">
              The Gambler Cup 2025
            </h1>
            <p className="text-xl text-green-100 mb-8">
              Join the ultimate golf tournament experience
            </p>
            
            <Card className="max-w-lg mx-auto lg:mx-0 bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Trophy className="h-6 w-6" />
                  Tournament Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-green-300" />
                  <span>August 29-31, 2025</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-green-300" />
                  <div>
                    <p>Days 1-2: Deerhurst Golf Course, Muskoka</p>
                    <p>Final Day: Muskoka Bay Golf Club</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-green-300" />
                  <span>8 Teams • 16 Players</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Auth Form */}
          <div className="flex justify-center lg:justify-end">
            <Card className="w-full max-w-md bg-white dark:bg-slate-800 shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-golf-green-600">
                  Player Access
                </CardTitle>
                <CardDescription>
                  Enter your details to join the tournament
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={isLogin ? "login" : "register"} onValueChange={(value) => setIsLogin(value === "login")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Log In</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login" className="space-y-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="playerName">Select Your Name</Label>
                        <Select value={formData.playerName} onValueChange={handlePlayerSelect}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose your name..." />
                          </SelectTrigger>
                          <SelectContent>
                            {playersLoading ? (
                              <SelectItem value="loading">Loading players...</SelectItem>
                            ) : (
                              players?.map((player: any) => (
                                <SelectItem key={player.name} value={player.name}>
                                  {player.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Enter your password"
                          required
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full bg-golf-green-600 hover:bg-golf-green-700"
                        disabled={loginMutation.isPending || !formData.playerName}
                      >
                        {loginMutation.isPending ? "Logging in..." : "Log In"}
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="register" className="space-y-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="playerName">Select Your Name</Label>
                        <Select value={formData.playerName} onValueChange={handlePlayerSelect}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose your name..." />
                          </SelectTrigger>
                          <SelectContent>
                            {playersLoading ? (
                              <SelectItem value="loading">Loading players...</SelectItem>
                            ) : (
                              players?.map((player: any) => (
                                <SelectItem key={player.name} value={player.name}>
                                  {player.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="password">Create Password</Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Create a password"
                          required
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full bg-golf-green-600 hover:bg-golf-green-700"
                        disabled={registerMutation.isPending || !formData.playerName}
                      >
                        {registerMutation.isPending ? "Creating account..." : "Create Account"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}