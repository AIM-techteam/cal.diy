"use client";

import type { ParsedUrlQuery } from "node:querystring";
import { WEBSITE_URL } from "@calcom/lib/constants";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Button } from "@calcom/ui/components/button";
import { AimAuthSplitLayout } from "@components/aim/AimAuthSplitLayout";
import { CheckIcon } from "@coss/ui/icons";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export type PageProps = {
  query: ParsedUrlQuery;
};

export function Logout(props: PageProps) {
  const [btnLoading, setBtnLoading] = useState<boolean>(false);
  const { status } = useSession();
  if (status === "authenticated") signOut({ redirect: false });
  const router = useRouter();
  useEffect(() => {
    if (props.query?.survey === "true") {
      router.push(`${WEBSITE_URL}/cancellation`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.query?.survey]);
  const { t } = useLocale();

  const message = () => {
    if (props.query?.passReset === "true") return "reset_your_password";
    if (props.query?.emailChange === "true") return "email_change";
    return "hope_to_see_you_soon";
  };

  const navigateToLogin = () => {
    setBtnLoading(true);
    router.push("/auth/login");
  };

  return (
    <AimAuthSplitLayout railHeading={t("aim_logout_rail_heading")}>
      <span
        aria-hidden="true"
        className="aim-login-dot-current flex size-11 items-center justify-center rounded-full">
        <CheckIcon className="size-5" />
      </span>
      <h1 className="font-cal text-emphasis mt-6 text-4xl leading-[1.05] sm:text-5xl" id="modal-title">
        {t("youve_been_logged_out")}
      </h1>
      <p className="text-subtle mt-3 mb-8 text-base">{t(message())}</p>
      <Button
        data-testid="logout-btn"
        onClick={navigateToLogin}
        className="flex h-11 w-full justify-center"
        loading={btnLoading}>
        {t("go_back_login")}
      </Button>
    </AimAuthSplitLayout>
  );
}

export default Logout;
