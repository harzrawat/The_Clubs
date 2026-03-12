// Calendar Page

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { api } from '../lib/api';
import { Event } from '../lib/types';

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    api.getEvents().then(data => {
      const approved = data.filter(e => e.status === 'approved');
      setEvents(approved);
    });
  }, []);

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getEventsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const selectedDateEvents = selectedDate
    ? events.filter(e => {
        const eventDate = new Date(e.date);
        return (
          eventDate.getDate() === selectedDate.getDate() &&
          eventDate.getMonth() === selectedDate.getMonth() &&
          eventDate.getFullYear() === selectedDate.getFullYear()
        );
      })
    : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2">Event Calendar</h1>
        <p className="text-muted-foreground">
          View all scheduled events in a calendar format
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={prevMonth} aria-label="Previous month">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={nextMonth} aria-label="Next month">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div
                  key={day}
                  className="p-2 text-center text-sm font-medium text-muted-foreground"
                >
                  {day}
                </div>
              ))}

              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayEvents = getEventsForDate(day);
                const isSelected =
                  selectedDate &&
                  selectedDate.getDate() === day &&
                  selectedDate.getMonth() === currentDate.getMonth() &&
                  selectedDate.getFullYear() === currentDate.getFullYear();

                return (
                  <button
                    key={day}
                    onClick={() =>
                      setSelectedDate(
                        new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
                      )
                    }
                    className={`min-h-[80px] rounded-lg border p-2 text-left transition-colors hover:bg-accent ${
                      isSelected ? 'bg-primary text-primary-foreground' : ''
                    }`}
                  >
                    <div className="font-medium">{day}</div>
                    {dayEvents.length > 0 && (
                      <div className="mt-1">
                        {dayEvents.slice(0, 2).map(event => (
                          <div
                            key={event.id}
                            className={`mb-1 truncate rounded px-1 text-xs ${
                              isSelected
                                ? 'bg-primary-foreground/20'
                                : 'bg-primary/10 text-primary'
                            }`}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs">+{dayEvents.length - 2} more</div>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Events */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate
                ? selectedDate.toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Select a Date'}
            </CardTitle>
            <CardDescription>
              {selectedDateEvents.length > 0
                ? `${selectedDateEvents.length} event${selectedDateEvents.length > 1 ? 's' : ''}`
                : 'No events'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedDateEvents.map(event => (
                <div key={event.id} className="rounded-lg border p-4">
                  <div className="mb-2">
                    <Badge variant="secondary" className="mb-1">
                      {event.clubName}
                    </Badge>
                  </div>
                  <h4 className="mb-1">{event.title}</h4>
                  <p className="mb-2 text-sm text-muted-foreground line-clamp-2">
                    {event.description}
                  </p>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div>🕐 {event.time}</div>
                    <div>📍 {event.location}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
