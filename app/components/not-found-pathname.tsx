"use client";
import { usePathname } from "next/navigation";

export function NotFoundPathname() {
  const pathname = usePathname();
  return <>{pathname}</>;
}
