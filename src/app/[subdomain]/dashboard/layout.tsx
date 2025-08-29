"use client";

import dynamic from "next/dynamic";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

// Lazy load modals so they're not in first bundle
const CreateDocumentModal = dynamic(
  () =>
    import(
      "@/features/ai-assistant/components/create-document-modal"
    ).then((mod) => mod.CreateDocumentModal),
  { ssr: false }
);

const GenerateQuizModal = dynamic(
  () =>
    import("@/features/quiz/components/generate-quiz-modal").then(
      (mod) => mod.GenerateQuizModal
    ),
  { ssr: false }
);

const CreateDeckModal = dynamic(
  () =>
    import("@/features/decks/components/create-deck-modal").then(
      (mod) => mod.CreateDeckModal
    ),
  { ssr: false }
);

const UpdateDeckModal = dynamic(
  () =>
    import("@/features/decks/components/update-deck-modal").then(
      (mod) => mod.UpdateDeckModal
    ),
  { ssr: false }
);

const UpdateFlashCardModal = dynamic(
  () =>
    import("@/features/flash-cards/components/update-flash-card-modal").then(
      (mod) => mod.UpdateFlashCardModal
    ),
  { ssr: false }
);

const CreateFlashCardModal = dynamic(
  () =>
    import("@/features/flash-cards/components/create-flash-card-modal").then(
      (mod) => mod.CreateFlashCardModal
    ),
  { ssr: false }
);

const CreateAIGeneratedFlashCardModal = dynamic(
  () =>
    import("@/features/flash-cards/components/create-ai-generated-flash-card-modal").then(
      (mod) => mod.CreateAIGeneratedFlashCardModal
    ),
  { ssr: false }
);

// Sidebar and header can be lazily loaded too if they're heavy
const AppSidebar = dynamic(
  () =>
    import("@/features/dashboard/components/app-sidebar").then(
      (mod) => mod.AppSidebar
    ),
  { ssr: false }
);

const SiteHeader = dynamic(
  () =>
    import("@/features/dashboard/components/site-header").then(
      (mod) => mod.SiteHeader
    ),
  { ssr: false }
);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      {/* Modals will load only if triggered */}
      <CreateDocumentModal />
      <GenerateQuizModal />
      <CreateDeckModal />
      <UpdateDeckModal />
      <UpdateFlashCardModal />
      <CreateFlashCardModal />
      <CreateAIGeneratedFlashCardModal />

      <AppSidebar variant="inset" />

      <SidebarInset>
        <SiteHeader />
        <div className="flex-1">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
