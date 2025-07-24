import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send, User } from 'lucide-react';
import ProfilePicture from '@/components/ProfilePicture';
import { formatDistanceToNow } from 'date-fns';

interface ChatMessage {
  id: number;
  userId: number;
  message: string;
  taggedUserIds: number[];
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
  };
}

interface Player {
  name: string;
  userId: number;
}

export default function TrashTalk() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState('');
  const [showTagSelector, setShowTagSelector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch chat messages
  const { data: messages = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: ['/api/chat/messages'],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Fetch registered players for tagging
  const { data: players = [] } = useQuery<Player[]>({
    queryKey: ['/api/registered-players'],
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { message: string; taggedUserIds: number[] }) => {
      return await apiRequest('/api/chat/messages', 'POST', messageData);
    },
    onSuccess: () => {
      setNewMessage('');
      setShowTagSelector(false);
      queryClient.invalidateQueries({ queryKey: ['/api/chat/messages'] });
    },
    onError: (error) => {
      console.error('Error sending message:', error);
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle WebSocket messages
  useEffect(() => {
    const handleWebSocketMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'CHAT_MESSAGE') {
          queryClient.invalidateQueries({ queryKey: ['/api/chat/messages'] });
        }
      } catch (error) {
        // Ignore non-JSON messages
      }
    };

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);
    
    ws.onmessage = handleWebSocketMessage;
    
    return () => {
      ws.close();
    };
  }, [queryClient]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !isAuthenticated) return;

    // Extract tagged user IDs from the message content
    const extractedTaggedIds: number[] = [];
    players.forEach(player => {
      const firstName = player.name.split(' ')[0];
      const fullName = player.name;
      
      const firstNameRegex = new RegExp(`@${firstName}\\b`, 'i');
      const fullNameRegex = new RegExp(`@${fullName.replace(/\s+/g, '\\s+')}\\b`, 'i');
      
      if (firstNameRegex.test(newMessage) || fullNameRegex.test(newMessage)) {
        if (!extractedTaggedIds.includes(player.userId)) {
          extractedTaggedIds.push(player.userId);
        }
      }
    });

    sendMessageMutation.mutate({
      message: newMessage.trim(),
      taggedUserIds: extractedTaggedIds,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Remove the toggleUserTag function as it's no longer needed

  const formatMessageWithTags = (message: string) => {
    if (!players.length) return message;

    let formattedMessage = message;
    
    // Find all @mentions in the message and highlight them
    players.forEach(player => {
      const firstName = player.name.split(' ')[0];
      const fullName = player.name;
      
      // Replace both @FirstName and @FullName patterns
      const firstNameRegex = new RegExp(`@${firstName}\\b`, 'gi');
      const fullNameRegex = new RegExp(`@${fullName.replace(/\s+/g, '\\s+')}\\b`, 'gi');
      
      formattedMessage = formattedMessage.replace(firstNameRegex, 
        `<span class="bg-blue-600 text-white px-1 py-0.5 rounded font-bold">@${firstName}</span>`
      );
      formattedMessage = formattedMessage.replace(fullNameRegex, 
        `<span class="bg-blue-600 text-white px-1 py-0.5 rounded font-bold">@${fullName}</span>`
      );
    });
    
    return formattedMessage;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Join the Trash Talk</h2>
              <p className="text-muted-foreground">Please log in to participate in the chat room.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 p-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-6 w-6" />
              Trash Talk
              <span className="text-sm text-muted-foreground font-normal">
                Live Chat Room
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Messages Area */}
            <ScrollArea className="h-96 p-4">
              {isLoading ? (
                <div className="text-center text-muted-foreground">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-muted-foreground">
                  No messages yet. Be the first to start the trash talk! 🗣️
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message: ChatMessage) => (
                    <div key={message.id} className="flex gap-3">
                      <ProfilePicture 
                        firstName={message.user.firstName}
                        lastName={message.user.lastName}
                        size="sm"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {message.user.firstName} {message.user.lastName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <div 
                          className="text-sm leading-relaxed"
                          dangerouslySetInnerHTML={{
                            __html: formatMessageWithTags(message.message)
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Quick Tag Selector */}
            {showTagSelector && (
              <div className="p-4 border-t bg-muted/30">
                <div className="text-sm font-medium mb-2">Quick Tag Players (click to add to message):</div>
                <div className="flex flex-wrap gap-2">
                  {players
                    .filter(player => player.userId !== user?.id)
                    .map(player => (
                    <Button
                      key={player.userId}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const firstName = player.name.split(' ')[0];
                        setNewMessage(prev => prev + `@${firstName} `);
                      }}
                    >
                      <User className="h-3 w-3 mr-1" />
                      @{player.name.split(' ')[0]}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTagSelector(!showTagSelector)}
                  className="shrink-0"
                  title="Quick tag players"
                >
                  @
                </Button>
                <Input
                  placeholder="Type your message... Use @PlayerName to tag"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                  disabled={sendMessageMutation.isPending}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Message Preview with Tags */}
              {newMessage && players.some(player => {
                const firstName = player.name.split(' ')[0];
                return newMessage.includes(`@${firstName}`) || newMessage.includes(`@${player.name}`);
              }) && (
                <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                  <span className="text-muted-foreground">Preview: </span>
                  <span 
                    dangerouslySetInnerHTML={{
                      __html: formatMessageWithTags(newMessage)
                    }}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}