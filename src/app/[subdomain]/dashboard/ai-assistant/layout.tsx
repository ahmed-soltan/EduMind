"use client";

import dynamic from "next/dynamic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Lazy load big components
const DocumentsSidebar = dynamic(
  () =>
    import(
      "@/features/ai-assistant/components/documents-sidebar"
    ).then((mod) => mod.DocumentsSidebar),
  { ssr: false, loading: () => <div>Loading documents...</div> }
);

const ChatWidget = dynamic(
  () =>
    import(
      "@/features/ai-assistant/components/chat-widget"
    ).then((mod) => mod.ChatWidget),
  { ssr: false, loading: () => <div>Loading chat...</div> }
);

const ResizableLayout = dynamic(
  () => import("./resizable-layout"),
  { ssr: false, loading: () => <div>Loading layout...</div> }
);

export default function AIAssistantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 relative h-full py-3 lg:p-0" id="ai-assistant">
      <DocumentsSidebar />

      {/* Mobile Tabs */}
      <Tabs defaultValue="document" className="lg:hidden w-full h-full">
        <TabsList className="w-full gap-2 space-y-2">
          <TabsTrigger value="document">Document</TabsTrigger>
          <TabsTrigger value="chat">AI Assistant</TabsTrigger>
        </TabsList>

        <TabsContent value="document">
          <div className="flex-1">{children}</div>
        </TabsContent>

        <TabsContent value="chat">
          {/* ChatWidget loads only when chat tab is opened */}
          <ChatWidget />
        </TabsContent>
      </Tabs>

      {/* Desktop layout */}
      <ResizableLayout>{children}</ResizableLayout>
    </div>
  );
}
