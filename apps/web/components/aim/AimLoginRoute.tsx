import { useLocale } from "@calcom/lib/hooks/useLocale";
import classNames from "classnames";

const STOPS = [
  { title: "aim_login_step_sign_in", description: "aim_login_step_sign_in_description" },
  { title: "aim_login_step_calendar", description: "aim_login_step_calendar_description" },
  { title: "aim_login_step_meetings", description: "aim_login_step_meetings_description" },
] as const;

/**
 * The route an advisor follows on first login (sign in, calendar, video meetings with Zoom or
 * Google Meet), drawn on the olive rail.
 * Vertical with descriptions from lg up; a compact horizontal strip on smaller screens so the
 * sign-in form stays in the first screen.
 */
export function AimLoginRoute({ currentIndex = 0 }: { currentIndex?: number }) {
  const { t } = useLocale();

  return (
    <ol
      aria-label={t("aim_login_route_label")}
      className="aim-login-route grid grid-cols-3 gap-2 lg:grid-cols-1 lg:gap-10">
      {STOPS.map((stop, index) => {
        const isCurrent = index === currentIndex;
        return (
          <li
            key={stop.title}
            aria-current={isCurrent ? "step" : undefined}
            className="aim-login-stop relative flex flex-col items-center gap-2 text-center lg:items-start lg:pl-12 lg:text-left">
            <span
              aria-hidden="true"
              className={classNames(
                "aim-login-dot relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold lg:absolute lg:top-0 lg:left-0",
                isCurrent ? "aim-login-dot-current" : "aim-login-dot-upcoming"
              )}>
              {index + 1}
            </span>
            <span className="text-emphasis text-xs font-semibold leading-tight sm:text-sm lg:flex lg:items-center lg:gap-2.5 lg:text-base">
              {t(stop.title)}
              {isCurrent && (
                <span className="aim-login-here hidden rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.08em] lg:inline-block">
                  {t("aim_login_you_are_here")}
                </span>
              )}
            </span>
            <span className="text-subtle hidden max-w-[22rem] text-sm leading-snug lg:block">
              {t(stop.description)}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
