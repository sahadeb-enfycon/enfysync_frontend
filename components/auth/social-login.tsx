// ============================================= Server side way start =======================================
import { doSocialLogin } from "@/app/actions";
import { useLoading } from "@/contexts/LoadingContext";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";

const SocialLogin = () => {
  const { loading, setLoading } = useLoading();

  const [loadingButtonProvider, setLoadingButtonProvider] = useState<
    null | "microsoft"
  >(null);

  const handleFormSubmit = () => {
    setLoading(true);
    setLoadingButtonProvider("microsoft");

    setTimeout(() => {
      setLoading(false);
      setLoadingButtonProvider(null);
    }, 2000);
  };

  return (
    <form
      className="mt-8 flex items-center"
      action={doSocialLogin}
      onSubmit={handleFormSubmit}
    >
      {/* Microsoft SSO Button */}
      <Button
        className="font-bold text-white py-6 w-full rounded-xl text-lg flex items-center justify-center gap-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-80"
        variant="default"
        type="submit"
        name="action"
        value="microsoft"
        disabled={loadingButtonProvider === "microsoft" || loading}
      >
        {loadingButtonProvider === "microsoft" ? (
          <>
            <Loader2 className="animate-spin h-6 w-6" />
            Connecting to Microsoft...
          </>
        ) : (
          <>
            <svg
              className="h-5 w-5"
              viewBox="0 0 23 23"
              aria-hidden="true"
              focusable="false"
            >
              <rect x="1" y="1" width="10" height="10" fill="#F25022" />
              <rect x="12" y="1" width="10" height="10" fill="#7FBA00" />
              <rect x="1" y="12" width="10" height="10" fill="#00A4EF" />
              <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
            </svg>
            Sign In with Microsoft
          </>
        )}
      </Button>
    </form>
  );
};

export default SocialLogin;
// ============================================= Server side way end =======================================
