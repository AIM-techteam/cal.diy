import PageWrapper from "@components/PageWrapperAppDir";
import { Open_Sans } from "next/font/google";
import { headers } from "next/headers";

const openSansFont = Open_Sans({ subsets: ["latin"], display: "swap" });

export default async function BookingPageWrapperLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const nonce = h.get("x-csp-nonce") ?? undefined;

  const bookingFontStyle = {
    display: "contents",
    fontFamily: openSansFont.style.fontFamily,
    "--font-sans": openSansFont.style.fontFamily,
    "--font-cal": openSansFont.style.fontFamily,
    // OnceHub-style brand tokens for the public booking page. Set here (not on
    // :root) so they win over the brand colors useCalcomTheme writes onto
    // document.documentElement at runtime: a CSS var set on this wrapper is a
    // closer ancestor to the booker's DOM than documentElement, so it wins the
    // cascade for every descendant (see packages/config/theme/tokens.css,
    // where --color-brand-default etc. resolve through --cal-brand).
    "--cal-brand": "#F5A623",
    "--cal-brand-emphasis": "#E09610",
    "--cal-brand-text": "#ffffff",
  } as React.CSSProperties;

  return (
    <PageWrapper isBookingPage={true} requiresLicense={false} nonce={nonce}>
      <div style={bookingFontStyle}>{children}</div>
    </PageWrapper>
  );
}
