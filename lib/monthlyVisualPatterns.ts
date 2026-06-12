export type MonthlyVisualPattern = {
  month: number;
  name: string;
  barPattern: string;
  accentColor: string;
  backgroundColor: string;
  calendarTint: string;
};

export const MONTHLY_VISUAL_PATTERNS: Record<number, MonthlyVisualPattern> = {
  0: { month: 0, name: "Enero", barPattern: "pattern-lines", accentColor: "#3B82F6", backgroundColor: "rgba(59, 130, 246, 0.2)", calendarTint: "rgba(59, 130, 246, 0.03)" }, // Blue
  1: { month: 1, name: "Febrero", barPattern: "pattern-bubbles", accentColor: "#EC4899", backgroundColor: "rgba(236, 72, 153, 0.2)", calendarTint: "rgba(236, 72, 153, 0.03)" }, // Pink
  2: { month: 2, name: "Marzo", barPattern: "pattern-leaf", accentColor: "#10B981", backgroundColor: "rgba(16, 185, 129, 0.2)", calendarTint: "rgba(16, 185, 129, 0.03)" }, // Green
  3: { month: 3, name: "Abril", barPattern: "pattern-dots", accentColor: "#8B5CF6", backgroundColor: "rgba(139, 92, 246, 0.2)", calendarTint: "rgba(139, 92, 246, 0.03)" }, // Purple
  4: { month: 4, name: "Mayo", barPattern: "pattern-overlap", accentColor: "#F59E0B", backgroundColor: "rgba(245, 158, 11, 0.2)", calendarTint: "rgba(245, 158, 11, 0.03)" }, // Amber
  5: { month: 5, name: "Junio", barPattern: "pattern-circuit", accentColor: "#06B6D4", backgroundColor: "rgba(6, 182, 212, 0.2)", calendarTint: "rgba(6, 182, 212, 0.03)" }, // Cyan
  6: { month: 6, name: "Julio", barPattern: "pattern-zigZag", accentColor: "#EF4444", backgroundColor: "rgba(239, 68, 68, 0.2)", calendarTint: "rgba(239, 68, 68, 0.03)" }, // Red
  7: { month: 7, name: "Agosto", barPattern: "pattern-bars", accentColor: "#F97316", backgroundColor: "rgba(249, 115, 22, 0.2)", calendarTint: "rgba(249, 115, 22, 0.03)" }, // Orange
  8: { month: 8, name: "Septiembre", barPattern: "pattern-stripes", accentColor: "#14B8A6", backgroundColor: "rgba(20, 184, 166, 0.2)", calendarTint: "rgba(20, 184, 166, 0.03)" }, // Teal
  9: { month: 9, name: "Octubre", barPattern: "pattern-aztec", accentColor: "#BA28A9", backgroundColor: "rgba(186, 40, 169, 0.2)", calendarTint: "rgba(186, 40, 169, 0.03)" }, // Deep Magenta
  10: { month: 10, name: "Noviembre", barPattern: "pattern-jupiter", accentColor: "#D97706", backgroundColor: "rgba(217, 119, 6, 0.2)", calendarTint: "rgba(217, 119, 6, 0.03)" }, // Warm orange/brown
  11: { month: 11, name: "Diciembre", barPattern: "pattern-crosses", accentColor: "#059669", backgroundColor: "rgba(5, 150, 105, 0.2)", calendarTint: "rgba(5, 150, 105, 0.03)" } // Emerald
};

export function getMonthlyVisualPattern(monthIndex: number): MonthlyVisualPattern {
  const safeMonth = Math.max(0, Math.min(11, monthIndex));
  return MONTHLY_VISUAL_PATTERNS[safeMonth];
}
