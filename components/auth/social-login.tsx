// ============================================= Server side way start =======================================
import { doSocialLogin } from "@/app/actions";
import { useLoading } from "@/contexts/LoadingContext";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";
import { Button } from "../ui/button";

const SocialLogin = () => {
  const { loading, setLoading } = useLoading();

  const [loadingButtonProvider, setLoadingButtonProvider] = useState<
    null | "keycloak"
  >(null);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    setLoadingButtonProvider("keycloak");

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
      {/* Keycloak Button */}
      <Button
        className="font-bold text-white py-6 w-full rounded-xl text-lg flex items-center justify-center gap-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-80"
        variant="default"
        type="submit"
        name="action"
        value="keycloak"
        disabled={loadingButtonProvider === "keycloak" || loading}
      >
        {loadingButtonProvider === "keycloak" ? (
          <>
            <Loader2 className="animate-spin h-6 w-6" />
            Connecting to Keycloak...
          </>
        ) : (
          <>
            Sign In with Keycloak
          </>
        )}
      </Button>
    </form>
  );
};

export default SocialLogin;
// ============================================= Server side way end =======================================
