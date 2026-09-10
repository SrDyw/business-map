import { BusinessMap } from "@/components/business/BusinessMap";
import { listBusinesses } from "@/lib/services/business.service";

export const dynamic = "force-dynamic";

export default async function Page() {
  const businesses = await listBusinesses({});

  return (
    <div className="h-dvh w-full">
      <BusinessMap initialBusinesses={businesses} />
    </div>
  );
}
