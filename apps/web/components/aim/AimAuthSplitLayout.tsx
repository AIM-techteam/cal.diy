import { useLocale } from "@calcom/lib/hooks/useLocale";
import { AimBrandScope } from "@components/aim/AimBrandScope";
import { AimLogo } from "@components/aim/AimLogo";
import type { ReactNode } from "react";

/**
 * Shared frame for the advisor auth screens (login, logout): the olive rail advisors meet inside
 * the app, beside the content side. From lg the rail is a 40% column with a serif statement and the
 * help line at its foot; below lg it collapses to a compact band so the content stays in the first
 * screen, and the help line moves under the content.
 */
export function AimAuthSplitLayout({
  railHeading,
  rail,
  children,
}: {
  railHeading: string;
  rail?: ReactNode;
  children: ReactNode;
}) {
  const { t } = useLocale();

  return (
    <div className="bg-default grid min-h-dvh grid-rows-[auto_1fr] lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:grid-rows-1">
      <AimBrandScope />

      <aside className="aim-rail bg-cal-muted flex flex-col gap-6 px-5 pt-6 pb-5 sm:px-8 lg:min-h-dvh lg:gap-0 lg:px-14 lg:py-14 xl:px-16">
        <AimLogo variant="light" className="h-6 w-auto self-start lg:h-7" />
        <h2 className="font-cal text-emphasis mt-16 mb-12 hidden max-w-[28rem] text-5xl leading-[1.08] text-balance lg:block">
          {railHeading}
        </h2>
        {rail}
        <p className="text-muted mt-auto hidden pt-12 text-sm lg:block">{t("aim_login_help")}</p>
      </aside>

      <main className="flex items-start justify-center px-5 pt-10 pb-12 sm:px-8 sm:pt-14 lg:items-center lg:px-12 lg:py-14">
        <div className="w-full max-w-[440px]">
          {children}
          <p className="text-subtle mt-10 text-sm lg:hidden">{t("aim_login_help")}</p>
        </div>
      </main>
    </div>
  );
}
