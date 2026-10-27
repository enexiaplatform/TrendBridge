import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { ButtonTone } from "@/lib/design-system";

type Common = { children: ReactNode; tone?: ButtonTone; size?: "sm" | "md" | "lg"; icon?: ReactNode; className?: string };
type ButtonProps = Common & ButtonHTMLAttributes<HTMLButtonElement> & { href?: never };
type LinkProps = Common & { href: string; target?: string; rel?: string };

export function Button(props: ButtonProps | LinkProps) {
  const { children, tone = "primary", size = "md", icon, className = "" } = props;
  const classes = `ds-button ds-button--${tone} ds-button--${size} ${className}`.trim();
  if ("href" in props && props.href) {
    return <Link className={classes} href={props.href} target={props.target} rel={props.rel}>{icon}{children}</Link>;
  }
  const { href: _href, tone: _tone, size: _size, icon: _icon, ...buttonProps } = props as ButtonProps & { href?: never };
  return <button {...buttonProps} className={classes}>{icon}{children}</button>;
}
