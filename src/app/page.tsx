import { TimeTrackerWrapper } from "@/components/tracking/time-tracker-wrapper";
import { UserProfile } from "@/components/user-profile";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8">
      <div className="grid grid-cols-3 items-center mb-8">
        <div /> {/* Empty left column */}
        <h1 className="text-2xl font-bold text-center">Tracer</h1>
        <div className="flex justify-end">
          <UserProfile />
        </div>
      </div>
      <TimeTrackerWrapper />
    </main>
  );
}
