import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

interface ChatMessage {
  id: number;
  userId: number;
  message: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
  };
}

export default function TrashTalk() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat/messages"],
    refetchInterval: 10000,
    enabled: isAuthenticated,
  });

  const sendMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await apiRequest("POST", "/api/chat/messages", { message, taggedUserIds: [] });
      return res.json();
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
    },
  });

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  if (!isAuthenticated) {
    return <div className="p-6 text-sm text-muted-foreground">Log in to access Trash Talk.</div>;
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="mx-auto max-w-3xl">
        <Card className="border-gambler-border bg-gambler-slate">
          <CardHeader>
            <CardTitle>Trash Talk</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div ref={listRef} className="h-[60vh] overflow-y-auto rounded-lg border border-gambler-border bg-gambler-black/60 p-3">
              {isLoading ? (
                <div className="text-sm text-muted-foreground">Loading messages...</div>
              ) : (
                <div className="space-y-2">
                  {messages.map((m) => {
                    const mine = m.userId === user?.id;
                    return (
                      <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] rounded-2xl px-3 py-2 ${mine ? "bg-gambler-green text-black" : "bg-zinc-800 text-white"}`}>
                          <div className={`mb-1 text-[11px] ${mine ? "text-black/70" : "text-zinc-400"}`}>
                            {m.user.firstName} {m.user.lastName} • {format(new Date(m.createdAt), "h:mm a")}
                          </div>
                          <div className="whitespace-pre-wrap text-sm">{m.message}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Write a message"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newMessage.trim()) {
                    sendMutation.mutate(newMessage.trim());
                  }
                }}
              />
              <Button
                onClick={() => newMessage.trim() && sendMutation.mutate(newMessage.trim())}
                disabled={sendMutation.isPending || !newMessage.trim()}
                className="bg-gambler-green text-black"
              >
                Send
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
