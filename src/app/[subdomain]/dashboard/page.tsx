import { ActivitiesSection } from "@/features/dashboard/components/activities-section";
import { SectionCards } from "@/features/dashboard/components/section-cards";
import { StreakTracker } from "@/features/dashboard/components/streak-section";
import { WelcomeSection } from "@/features/dashboard/components/welcome-section";

export default async function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <WelcomeSection />
        <div className="flex flex-col gap-4 md:gap-6">
          <SectionCards />
          <div className="grid grid-cols-1 lg:grid-cols-3 px-4 lg:px-6 gap-4">
            <div className="lg:col-span-2">
              <ActivitiesSection />
            </div>
              <StreakTracker />
          </div>
          {/* <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div> */}
          {/* <DataTable data={data} /> */}
        </div>
      </div>
    </div>
  );
}
