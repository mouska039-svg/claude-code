"use client";

import { useEffect } from "react";

interface RefCodeStoreProps {
  code: string;
}

/**
 * Stores the referral code in localStorage so it survives email-confirmation
 * redirects and can be sent to the server after the user verifies their email.
 */
export function RefCodeStore({ code }: RefCodeStoreProps) {
  useEffect(() => {
    if (code) {
      localStorage.setItem("naya_ref_code", code);
    }
  }, [code]);

  return null;
}
