"use client";
import { ErrorState } from "@genuin/components/molecules/error-state";
import { Button } from "@genuin/ui/components/button";
import { useRouter } from "next/navigation";

export default function Error() {
  const router = useRouter();
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-3">
      <ErrorState className="gencl:h-fit gencl:w-full" type="GLOBAL_ERROR" />
      <Button theme="primary" onClick={() => window.location.reload()}>
        Reload
      </Button>
    </div>
  );
}
