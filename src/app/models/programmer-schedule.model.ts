export interface ProgrammerSchedule {
  id?: string; // Optional Firestore document ID
  dayOfWeek: number; // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
  startTime: string; // e.g., "09:00"
  endTime: string;   // e.g., "17:00"
  isAvailable: boolean; // True if the programmer is available during this slot
  startDateOffService?: string; // Fecha de inicio de no disponibilidad (formato YYYY-MM-DD)
  endDateOffService?: string;   // Fecha de fin de no disponibilidad (formato YYYY-MM-DD)
}
