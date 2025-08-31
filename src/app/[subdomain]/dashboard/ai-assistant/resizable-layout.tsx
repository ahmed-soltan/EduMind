"use client";

import { useMedia } from "react-use";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ChatWidget } from "@/features/ai-assistant/components/chat-widget";

const ResizableLayout = ({ children }: { children: React.ReactNode }) => {
  const isDesktop = useMedia("(min-width:1024px)", true);

  if (isDesktop) {
    return (
      <ResizablePanelGroup
        direction="horizontal"
        className="min-h-[200px] w-full rounded-lg"
      >
        <ResizablePanel defaultSize={50} minSize={50}>
          <div className="hidden lg:flex h-full items-start justify-start w-full">
            {children}
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50}>
          <div className="flex h-full items-center justify-center w-full">
            <ChatWidget />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    );
  }
};

export default ResizableLayout;
