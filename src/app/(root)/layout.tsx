import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 p-4">{children}</main>
      <Footer />
    </div>
  );
}
