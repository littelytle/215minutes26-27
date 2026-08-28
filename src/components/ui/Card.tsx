import clsx from "clsx";
import { HTMLAttributes } from "react";

export default function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("card-surface p-5", className)} {...rest} />;
}
