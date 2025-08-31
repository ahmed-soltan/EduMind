"use client";

import { Bot, Loader2, User } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";

import { ChatInput } from "./chat-input";

import { useDocumentId } from "../hooks/use-document-id";
import { useGetChatMessage } from "../api/use-get-chat-message";

export const ChatWidget = () => {
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const { data, isLoading } = useGetChatMessage();
  const documentId = useDocumentId();

  useEffect(() => {
    if (data) {
      // Normalize API data into your frontend message format
      const mappedMessages = data.map((msg: any) => ({
        id: msg.id,
        content: msg.message,
        type: msg.role, // fallback if API doesn’t return type
        timestamp: new Date(msg.createdAt),
      }));
      setMessages(mappedMessages);
    }
  }, [data]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  }, [inputValue]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <div className="border-b border-border p-4 bg-card">
        <h2 className="text-lg font-semibold">AI Assistant</h2>
        <p className="text-sm text-muted-foreground">
          {documentId
            ? "Ask questions about your uploaded documents"
            : "Upload documents to start chatting"}
        </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 h-full max-h-[810px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">
                Welcome to Document Assistant
              </p>
              <p className="text-muted-foreground">
                {documentId
                  ? "Start by asking a question about your documents"
                  : "Upload some documents to begin"}
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message: any) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.type === "ai" && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.type === "user"
                      ? "bg-primary text-primary-foreground ml-12"
                      : "bg-accent/50 mr-12"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <p
                    className={`text-xs mt-1 opacity-70 ${
                      message.type === "user"
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                </div>

                {message.type === "user" && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
                      <User className="h-4 w-4 text-secondary" />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="bg-accent/50 rounded-lg px-4 py-2 mr-12">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"></div>
                    <div
                      className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        inputValue={inputValue}
        setMessages={setMessages}
        textareaRef={textareaRef}
        setIsTyping={setIsTyping}
        setInputValue={setInputValue}
      />
    </div>
  );
};
