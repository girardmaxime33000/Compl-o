"use client";

import { forwardRef } from "react";
import Link from "next/link";
import { track, type ALLOWED_PROPS } from "@/lib/analytics";

type Props = Partial<Record<(typeof ALLOWED_PROPS)[number], string>>;

/** Lien Next qui envoie un événement `cta_click` anonyme au clic (source = emplacement, target = destination). */
export const TrackedLink = forwardRef<HTMLAnchorElement, Omit<React.ComponentProps<typeof Link>, "ref"> & { trackProps: Props }>(
  function TrackedLink({ trackProps, onClick, ...rest }, ref) {
    return (
      <Link
        ref={ref}
        {...rest}
        onClick={(e) => {
          track("cta_click", trackProps);
          onClick?.(e);
        }}
      />
    );
  },
);
