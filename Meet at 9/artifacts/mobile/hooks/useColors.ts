import { useTheme } from "@/context/ThemeContext";

import colors from "@/constants/colors";

/**
 * Returns the design tokens for the current theme (light or dark).
 * Theme is controlled by ThemeContext (user toggle), not the system appearance.
 * Also exposes `isDark` for conditional logic.
 */
export function useColors() {
  const { isDark } = useTheme();
  const palette = isDark ? colors.dark : colors.light;
  return { ...palette, radius: colors.radius, isDark };
}
