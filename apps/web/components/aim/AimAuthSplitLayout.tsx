import { useLocale } from "@calcom/lib/hooks/useLocale";
import { AimBrandScope } from "@components/aim/AimBrandScope";
import { AimLogo } from "@components/aim/AimLogo";
import type { ReactNode } from "react";

/**
 * Shared frame for the advisor auth screens (login, logout): the olive rail advisors meet inside
 * the app, beside the content side. From lg the rail is a 40% column with a serif statement and the
 * help line at its foot; below lg it collapses to a compact band so the content stays in the first
 * screen, and the help line moves under the content.
 *
 * Neither screen scrolls: from lg the shell is exactly one viewport tall (`lg:h-dvh`) and the rail
 * pins its own height so it can never push the page past the first screen. The rail's spacing is
 * the tight budget that buys that: at 1024x640 (the shortest desktop window we see) the stacked
 * rail measures ~640px, so the vertical rhythm here is not decorative — the heading margins, the
 * rail padding and the help line's padding-top are the numbers that keep the form and the help
 * line on the same screen. Only the 2fr/3fr split, the logo and the route gap can grow freely.
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
    <div className="bg-default grid min-h-dvh grid-rows-[auto_1fr] lg:h-dvh lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:grid-rows-1">
      <AimBrandScope />

      <aside className="aim-rail bg-cal-muted flex flex-col gap-6 px-5 pt-6 pb-5 sm:px-8 lg:h-dvh lg:min-h-0 lg:gap-0 lg:overflow-y-auto lg:px-12 lg:py-10 xl:px-16">
        <AimLogo variant="light" className="h-6 w-auto self-start lg:h-7" />
        <h2 className="font-cal text-emphasis hidden max-w-[28rem] leading-[1.08] text-balance lg:mt-10 lg:mb-8 lg:block lg:text-4xl xl:text-5xl">
          {railHeading}
        </h2>
        {rail}
        <p className="text-muted mt-auto hidden pt-12 text-sm lg:block lg:pt-5">{t("aim_login_help")}</p>
      </aside>

      <main className="flex items-start justify-center px-5 pt-9 pb-10 sm:px-8 sm:pt-12 lg:items-center lg:px-12 lg:py-10 xl:px-16">
        <div className="w-full max-w-[440px]">
          {children}
          <p className="text-subtle mt-8 text-sm lg:hidden">{t("aim_login_help")}</p>
        </div>
      </main>
    </div>
  );
}
