import { SectionCards } from "@/features/dashboard/components/section-cards";
import { WelcomeSection } from "@/features/dashboard/components/welcome-section";

export default async function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <WelcomeSection />
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards />
          {/* <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div> */}
          {/* <DataTable data={data} /> */}
        </div>
      </div>
    </div>
  );
}
