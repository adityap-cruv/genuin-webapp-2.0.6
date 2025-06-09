import { Button } from "@genuin/ui/button";
import { useBaseContext } from "@genuin/components/context/base";

export function CtaButtons() {
  const { web_cta } = useBaseContext().brandDetails;
  return (
    // <div className="gencl:flex gencl:justify-between gencl:gap-2.5">
    //   <div className="gencl:w-72 gencl:h-2"></div>
    <div className="gencl:flex gencl:gap-2.5 gencl:justify-between gencl:items-center">
      {(web_cta === "app" || web_cta == "both") && (
        <Button
          theme="outline"
          className="gencl:min-w-[80px] gencl:h-9 gencl:px-4 gencl:py-1.5 gencl:flex-shrink-0 gencl:text-body-1-semi-bold"
        >
          Get app
        </Button>
      )}
      {(web_cta === "login" || web_cta == "both") && (
        <Button
          theme="primary"
          className="gencl:min-w-[80px] gencl:h-9 gencl:px-4 gencl:py-1.5 gencl:flex-shrink-0 gencl:text-body-1-bold"
        >
          Log in
        </Button>
      )}
    </div>
    // </div>
  );
}
