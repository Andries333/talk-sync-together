import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface ChatMessage {
  id: string;
  user_id: string;
  name: string;
  text: string;
  timestamp: string;
}

const ChatRoom: React.FC = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineCount, setOnlineCount] = useState<number>(0);
  const [input, setInput] = useState("");
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const [me, setMe] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch profile for display name
      let displayName = user.email?.split("@")[0] || "Gebruiker";
      try {
        const { data } = await supabase
          .from("profiles")
          .select("first_name,last_name")
          .eq("user_id", user.id)
          .single();
        if (data?.first_name || data?.last_name) {
          displayName = `${data?.first_name ?? ""} ${data?.last_name ?? ""}`.trim();
        }
      } catch {}

      setMe({ id: user.id, name: displayName });

      const channel = supabase.channel("global_chat", {
        config: {
          presence: { key: user.id },
          broadcast: { ack: true },
        },
      });

      channel
        .on("presence", { event: "sync" }, () => {
          const state = channel.presenceState();
          // presenceState returns an object keyed by user ids
          setOnlineCount(Object.keys(state).length);
        })
        .on("broadcast", { event: "message" }, ({ payload }) => {
          const msg = payload as ChatMessage;
          setMessages((prev) => [...prev, msg]);
        });

      channel.subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ user_id: user.id, name: displayName, online_at: new Date().toISOString() });
        }
      });

      channelRef.current = channel;
    };

    init();

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || !channelRef.current || !me) return;

    const message: ChatMessage = {
      id: crypto.randomUUID(),
      user_id: me.id,
      name: me.name,
      text: input.trim(),
      timestamp: new Date().toISOString(),
    };

    const status = await channelRef.current.send({
      type: "broadcast",
      event: "message",
      payload: message,
    });

    if (status !== "ok") {
      toast({ title: "Kon nie stuur nie", description: String(status), variant: "destructive" });
    } else {
      setInput("");
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Geselshoekie</span>
          <span className="text-sm text-muted-foreground">Aanlyn: {onlineCount}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80 border rounded-md p-3 mb-4 overflow-y-auto bg-muted/30">
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center mt-8">Nog geen boodskappe nie. Sê hallo! 👋</p>
          ) : (
            <ul className="space-y-3">
              {messages.map((m) => (
                <li key={m.id} className="text-sm">
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium text-foreground">{m.name}</span>
                    <span className="text-xs text-muted-foreground">{new Date(m.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-foreground/90 break-words">{m.text}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Skryf jou boodskap..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button onClick={sendMessage} disabled={!input.trim()}>Stuur</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatRoom;
