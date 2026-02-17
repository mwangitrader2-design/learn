import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { ChatMessage } from "@/lib/ai-chat";
export function useChatPersistence() {
  const { user } = useAuth();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  // Load latest conversation on mount
  useEffect(() => {
    if (!user) return;
    setLoadingHistory(true);
    (async () => {
      // Get most recent conversation
      const { data: convos } = await supabase
        .from("conversations")
        .select("id")
        .eq("user_id", user.id)
        .eq("mode", "tutor")
        .order("updated_at", { ascending: false })
        .limit(1);
      if (convos && convos.length > 0) {
        const convoId = convos[0].id;
        setConversationId(convoId);
        // Load messages
        const { data: msgs } = await supabase
          .from("chat_messages")
          .select("role, content")
          .eq("conversation_id", convoId)
          .order("created_at", { ascending: true });
        if (msgs) {
          setMessages(msgs.map(m => ({ role: m.role as "user" | "assistant", content: m.content })));
        }
      }
      setLoadingHistory(false);
    })();
  }, [user]);
  const ensureConversation = useCallback(async (): Promise<string> => {
    if (conversationId) return conversationId;
    if (!user) throw new Error("Not authenticated");
    const { data, error } = await supabase
      .from("conversations")
      .insert({ user_id: user.id, title: "English Practice", mode: "tutor" })
      .select("id")
      .single();
    if (error) throw error;
    setConversationId(data.id);
    return data.id;
  }, [conversationId, user]);
  const persistMessage = useCallback(async (convoId: string, msg: ChatMessage) => {
    if (!user) return;
    await supabase.from("chat_messages").insert({
      conversation_id: convoId,
      user_id: user.id,
      role: msg.role,
      content: msg.content,
    });
  }, [user]);
  const startNewConversation = useCallback(() => {
    setConversationId(null);
    setMessages([]);
  }, []);
  return {
    conversationId,
    messages,
    setMessages,
    loadingHistory,
    ensureConversation,
    persistMessage,
    startNewConversation,
  };
}
