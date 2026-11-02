"use client";

import { useEffect } from "react";

/**
 * Turns on the Annuity Gator theme (styles/aim-brand.css) while an advisor-facing screen is
 * mounted. The class goes on <body>, not on a wrapper, so menus and dialogs rendered in portals
 * get it too. Public booking pages never mount this, so they keep their own look.
 */
export function AimBrandScope() {
  useEffect(() => {
    document.body.classList.add("aim-brand");
    return () => document.body.classList.remove("aim-brand");
  }, []);

  return null;
}
