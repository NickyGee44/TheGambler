import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send, User, X, Minimize2, Maximize2 } from 'lucide-react';
import ProfilePicture from '@/components/ProfilePicture';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

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

export default function TrashTalkWidget() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState('');
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [lastReadMessageId, setLastReadMessageId] = useState<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch chat messages
  const { data: messages = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: ['/api/chat/messages'],
    refetchInterval: 10000, // Refresh every 10 seconds
    enabled: isAuthenticated,
  });

  // Fetch registered players for tagging
  const { data: players = [] } = useQuery<Player[]>({
    queryKey: ['/api/registered-players'],
    enabled: isAuthenticated,
  });

  // Calculate unread messages
  const unreadCount = messages.filter(msg => msg.id > lastReadMessageId).length;

  // Mark messages as read when widget is expanded
  useEffect(() => {
    if (isExpanded && messages.length > 0) {
      const latestMessageId = Math.max(...messages.map(m => m.id));
      setLastReadMessageId(latestMessageId);
    }
  }, [isExpanded, messages]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { message: string; taggedUserIds: number[] }) => {
      const response = await apiRequest('POST', '/api/chat/messages', messageData);
      return await response.json();
    },
    onSuccess: () => {
      setNewMessage('');
      setShowTagSelector(false);
      queryClient.invalidateQueries({ queryKey: ['/api/chat/messages'] });
      
      // Force scroll to bottom when user sends a message
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (isExpanded) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isExpanded]);

  // Vercel serverless has no persistent WebSocket support; polling handles updates.

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

  const formatMessageWithTags = (message: string) => {
    if (!players.length) return message;

    let formattedMessage = message;
    
    players.forEach(player => {
      const firstName = player.name.split(' ')[0];
      const fullName = player.name;
      
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

  // Don't render if not authenticated
  if (!isAuthenticated) return null;

  return (
    <div className={cn(
      "fixed bottom-4 right-4 z-50 transition-all duration-300",
      isExpanded ? "w-96 h-[500px]" : "w-auto h-auto"
    )}>
      {!isExpanded ? (
        // Collapsed state - floating button
        <Button
          onClick={() => setIsExpanded(true)}
          className={cn(
            "relative rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-200",
            "bg-green-600 hover:bg-green-700 text-white"
          )}
        >
          <MessageSquare className="h-6 w-6" />
          {unreadCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </div>
          )}
        </Button>
      ) : (
        // Expanded state - full chat widget
        <Card className="shadow-xl border-green-200 bg-black text-white">
          <CardHeader className="pb-3 bg-black border-b border-gray-700">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm text-white">
                <MessageSquare className="h-4 w-4" />
                Trash Talk
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </CardTitle>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="h-6 w-6 p-0 text-white hover:bg-gray-800"
                >
                  {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className="h-6 w-6 p-0 text-white hover:bg-gray-800"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          {!isMinimized && (
            <CardContent className="p-0 bg-black">
              {/* Messages Area */}
              <ScrollArea className="h-72 p-3 bg-black">
                <div className="space-y-3">
                  {isLoading ? (
                    <div className="text-center text-gray-400 py-4 text-sm">Loading...</div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-gray-400 py-4 text-sm">
                      No messages yet 🗣️
                    </div>
                  ) : (
                    messages.map((message: ChatMessage) => (
                      <div key={message.id} className="flex gap-2">
                        <ProfilePicture 
                          firstName={message.user.firstName}
                          lastName={message.user.lastName}
                          size="sm"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-xs text-white">
                              {message.user.firstName} {message.user.lastName}
                            </span>
                            <span className="text-xs text-gray-400">
                              {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          <div 
                            className="text-xs leading-relaxed break-words text-gray-200"
                            dangerouslySetInnerHTML={{
                              __html: formatMessageWithTags(message.message)
                            }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Quick Tag Selector */}
              {showTagSelector && (
                <div className="p-3 border-t border-gray-700 bg-gray-900">
                  <div className="text-xs font-medium mb-2 text-white">Tag players:</div>
                  <div className="flex flex-wrap gap-1">
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
                        className="h-6 text-xs border-gray-600 text-white hover:bg-gray-800"
                      >
                        @{player.name.split(' ')[0]}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Message Input */}
              <div className="p-3 border-t border-gray-700 bg-black">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTagSelector(!showTagSelector)}
                    className="shrink-0 h-8 w-8 p-0 border-gray-600 text-white hover:bg-gray-800"
                    title="Tag players"
                  >
                    @
                  </Button>
                  <Input
                    placeholder="Type message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 h-8 text-sm bg-gray-900 border-gray-600 text-white placeholder:text-gray-400"
                    disabled={sendMessageMutation.isPending}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sendMessageMutation.isPending}
                    size="sm"
                    className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
                  >
                    <Send className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}
