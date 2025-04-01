import { TimeTrackerWrapper } from "@/components/tracking/time-tracker-wrapper";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-8 text-center">Tracer</h1>
      <TimeTrackerWrapper />
    </main>
  );
}
