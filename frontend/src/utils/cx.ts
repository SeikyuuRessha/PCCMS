/**
 * Joins class names, filtering out falsy values.
 * Lightweight alternative to `clsx` / `classnames`.
 */
export const cx = (...classes: (string | boolean | undefined | null)[]): string =>
    classes.filter(Boolean).join(" ");
