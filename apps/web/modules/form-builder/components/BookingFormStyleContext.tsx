"use client";

import { createContext, useContext } from "react";

/**
 * "two-day": the AIM two-day view's confirmation form (Funnel v3 mockup look: labels above
 * rounded, boxed inputs that read the --td-* palette). Provided by BookEventForm so field
 * components can switch layout without threading a prop through every field type.
 */
export type BookingFormStyle = "default" | "two-day";

const BookingFormStyleContext = createContext<BookingFormStyle>("default");

export const BookingFormStyleProvider = BookingFormStyleContext.Provider;

export const useBookingFormStyle = (): BookingFormStyle => useContext(BookingFormStyleContext);

/** Boxed input look shared by every text-like field in the two-day form. */
export const TWO_DAY_INPUT_CLASS =
  "w-full rounded-xl border-[1.5px] border-(--td-line) bg-(--td-surface) px-4 py-3 text-lg text-(--td-ink) placeholder:text-(--td-mute) placeholder:opacity-70 focus:border-(--td-accent) focus:outline-[3px] focus:outline-(--td-focus) focus:outline-offset-1 focus:outline-solid disabled:opacity-60";
