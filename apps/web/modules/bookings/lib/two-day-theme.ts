/**
 * Funnel v3 mockup palette for the two-day view, as CSS variables with a dark-mode set.
 * Applied on the two-day view's wrapper (Booker.tsx); its components read the variables
 * (e.g. `text-(--td-ink)`), so they follow the `.dark` class next-themes sets on <html>
 * from the visitor's system appearance.
 *
 * Light values are the mockup's (#s_cal). Dark values keep the same warm, olive/green feel:
 * light text on near-black surfaces, a lighter green for links and borders so they keep
 * contrast, and a mid green fill behind white text for the selected time.
 */
export const TWO_DAY_THEME_CLASS = [
  // Text
  "[--td-ink:#2f2e24] dark:[--td-ink:#ece9df]",
  "[--td-mute:#5c5b4e] dark:[--td-mute:#b3af9e]",
  "[--td-olive:#46432f] dark:[--td-olive:#cfc8a8]",
  // Surfaces and borders
  "[--td-surface:#ffffff] dark:[--td-surface:#1c1b17]",
  "[--td-line:#ddd8c8] dark:[--td-line:#3f3c33]",
  // Green accent: links, focus, selected borders
  "[--td-accent:#2f5a28] dark:[--td-accent:#8cc27e]",
  "[--td-accent-soft:#e6ede3] dark:[--td-accent-soft:#253222]",
  "[--td-focus:rgba(47,90,40,.35)] dark:[--td-focus:rgba(140,194,126,.4)]",
  // Filled green (selected time, confirm button) with white text in both modes
  "[--td-fill:#2f5a28] dark:[--td-fill:#3f7535]",
  "[--td-fill-hover:#244820] dark:[--td-fill-hover:#4a8540]",
].join(" ");
