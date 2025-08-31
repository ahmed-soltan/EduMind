import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { useRef, useState } from "react";
import { useSendMessage } from "../api/use-send-message";
import { useDocumentId } from "../hooks/use-document-id";

interface ChatInputProps {
  inputValue: string;
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
  textareaRef: React.RefObject<HTMLTextAreaElement | null> | null;
  setIsTyping: React.Dispatch<React.SetStateAction<boolean>>;
  setInputValue: React.Dispatch<React.SetStateAction<string>>;
}

export const ChatInput = ({
  inputValue,
  setMessages,
  textareaRef,
  setIsTyping,
  setInputValue,
}: ChatInputProps) => {
  const { mutate: sendMessage, isPending } = useSendMessage();
  const documentId = useDocumentId();
  const [documentReady, setDocumentReady] = useState(!!documentId);

  const onSendMessage = (message: string) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { id: Date.now(), content: message, type: "user", timestamp: new Date() },
    ]);
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const message = inputValue.trim();

    // Optimistic update (user bubble)
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), content: message, type: "user", timestamp: new Date() },
    ]);
    setInputValue("");
    setIsTyping(true);

    sendMessage(
      { documentId, message }, // 👈 call backend
      {
        onSuccess: (res) => {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now(),
              content: res.reply,
              type: "ai",
              timestamp: new Date(),
            },
          ]);
          setIsTyping(false);
        },
        onError: () => {
          setIsTyping(false);
        },
      }
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  return (
    <div className="border-t border-border p-4 bg-card">
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              documentReady
                ? "Ask a question about your documents..."
                : "Upload documents first to start chatting"
            }
            disabled={!documentReady}
            className="min-h-[44px] max-h-[120px] resize-none"
            rows={1}
          />
        </div>
        <Button
          onClick={handleSend}
          disabled={!inputValue.trim() || !documentReady}
          size="sm"
          className="h-11 px-3"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
