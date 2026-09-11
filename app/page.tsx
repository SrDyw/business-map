import { BusinessMap } from "@/components/business/BusinessMap";
import { RapidToast } from "@/components/systemui/rapid-toast";
import { listBusinesses } from "@/lib/services/business.service";

export const dynamic = "force-dynamic";

export default async function Page() {
  let businesses:any = []
  let error
  try {
    businesses = await listBusinesses({});
  }
  catch(err) {
    error = {
      "message": err
    }
  }

  return (
    <div className="h-dvh w-full">
      {error && <RapidToast title="Error" description="Error al cargar los datos" type="error"/>}
      <BusinessMap initialBusinesses={businesses} />
    </div>
  );
}
