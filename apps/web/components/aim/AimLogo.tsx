import classNames from "classnames";

/**
 * Annuity Gator logo (assets copied from the Annuity Evaluation 4.0 funnel, used as-is per the
 * brand commitment in apps/web/PRODUCT.md). `light` is the cream-ink version for the olive
 * sidebar; `mark` is the arrow "A" alone, for the collapsed sidebar.
 */
export function AimLogo({
  variant = "dark",
  mark = false,
  className,
}: {
  variant?: "dark" | "light";
  mark?: boolean;
  className?: string;
}) {
  const suffix = variant === "light" ? "-light" : "";
  const src = mark ? `/aim/annuitygator-mark${suffix}.png` : `/aim/annuitygator-logo${suffix}.png`;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="Annuity Gator"
      width={mark ? 80 : 499}
      height={mark ? 80 : 86}
      className={classNames(mark ? "h-7 w-7" : "h-6 w-auto", className)}
    />
  );
}
