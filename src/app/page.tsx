import { Button } from "@/components/ui/button";
import { createAdminClient } from "@/lib/appwrite";
export default function Home() {
  console.log(createAdminClient);
  return (
    <div>
      <Button variant="primary">Ok</Button>
      <Button variant="destructive">Ok</Button>
      <Button variant="ghost">Ok</Button>
      <Button variant="link">Ok</Button>
      <Button variant="muted">Ok</Button>
      <Button variant="outline">Ok</Button>
      <Button variant="secondary">Ok</Button>
      <Button variant="teritary">Ok</Button>
    </div>
  );
}
