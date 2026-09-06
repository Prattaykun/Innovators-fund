import LoadingSwapScreen from '@/components/LoadingSwapScreen';

export default function Loading() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingSwapScreen message="Loading Team Innovators Treasury platform..." />
      </main>
    </div>
  );
}
