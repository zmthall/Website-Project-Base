/** Calendar presentation data; dates and times are local to the displayed timezone. */
export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  timeZone: string;
  category: string;
  location: string;
  description: string;
}
