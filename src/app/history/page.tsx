import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import HistoryList from "@/components/HistoryList";

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/");
  }

  const debugs = await prisma.debug.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-gray-950 text-white px-4 py-12">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Debug History</h1>
          <p className="text-gray-400 mt-1">Your past error explanations</p>
        </div>

        {debugs.length === 0 ? (
          <div className="text-center py-16 text-gray-600">
            No debugs yet. Go paste an error!
          </div>
        ) : (
          <HistoryList debugs={debugs} />
        )}
      </div>
    </main>
  );
}