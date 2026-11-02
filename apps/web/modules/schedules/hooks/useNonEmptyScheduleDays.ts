import { isSlotShownInBooker } from "@calcom/features/bookings/Booker/utils/twoDayView";
import { useMemo } from "react";

import type { Slots } from "../lib/types";

const getNonEmptyScheduleDays = (slots?: Slots) => {
  if (typeof slots === "undefined") return [];

  const nonEmptyDays: string[] = [];

  Object.keys(slots).forEach((date) => {
    if (slots[date].some((slot) => slot && isSlotShownInBooker(slot))) {
      nonEmptyDays.push(date);
    }
  });

  return nonEmptyDays;
};

export const useNonEmptyScheduleDays = (slots?: Slots) => {
  const days = useMemo(() => getNonEmptyScheduleDays(slots), [slots]);

  return days;
};
