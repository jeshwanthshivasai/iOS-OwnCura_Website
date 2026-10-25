"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { mountMotion } from "@/lib/motion";
import styles from "./Site.module.css";

/* The page's root (v5's [data-oc-root]): the tokens and the type apply from here, and the motion engine attaches to it after mount. Every word inside is server HTML. */
export default function Site({ children }: { children?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    return mountMotion(root);
  }, []);
  return (
    <div ref={ref} data-oc-root="" className={styles.root}>
      {children}
    </div>
  );
}
