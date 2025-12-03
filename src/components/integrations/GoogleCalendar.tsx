"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  LogIn,
  LogOut,
  X,
  Loader2,
  Sparkles,
  Send,
  Edit3,
  Eye,
  RefreshCw,
  Zap,
  MessageSquare,
} from "lucide-react";

interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  colorId?: string;
  htmlLink?: string;
}

interface GoogleCalendarProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (content: string) => void;
}

type ViewMode = "list" | "create" | "detail" | "ai-schedule";

export function GoogleCalendar({ isOpen, onClose, onSendToChat }: GoogleCalendarProps) {
  const { data: session, status } = useSession();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Week navigation
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(today.setDate(diff));
  });

  // Create event form
  const [newEvent, setNewEvent] = useState({
    summary: "",
    description: "",
    location: "",
    date: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "10:00",
  });

  // AI Scheduling
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editEvent, setEditEvent] = useState({
    summary: "",
    description: "",
    location: "",
    date: "",
    startTime: "",
    endTime: "",
  });

  // Fetch events
  const fetchEvents = useCallback(async () => {
    if (!session?.accessToken) return;

    setLoading(true);
    setError(null);

    try {
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const params = new URLSearchParams({
        timeMin: currentWeekStart.toISOString(),
        timeMax: weekEnd.toISOString(),
      });

      const response = await fetch(`/api/calendar?${params}`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal mengambil event");
      }

      setEvents(data.events || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, currentWeekStart]);

  useEffect(() => {
    if (session?.accessToken) {
      fetchEvents();
    }
  }, [session?.accessToken, fetchEvents]);

  // Week navigation
  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentWeekStart((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
      return newDate;
    });
  };

  const goToToday = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    setCurrentWeekStart(new Date(today.setDate(diff)));
  };

  // Create event
  const handleCreateEvent = async () => {
    if (!newEvent.summary.trim()) {
      setError("Judul event harus diisi");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const startDateTime = `${newEvent.date}T${newEvent.startTime}:00`;
      const endDateTime = `${newEvent.date}T${newEvent.endTime}:00`;

      const response = await fetch("/api/calendar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({
          summary: newEvent.summary,
          description: newEvent.description,
          location: newEvent.location,
          start: { dateTime: startDateTime, timeZone: "Asia/Jakarta" },
          end: { dateTime: endDateTime, timeZone: "Asia/Jakarta" },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal membuat event");
      }

      setNewEvent({
        summary: "",
        description: "",
        location: "",
        date: new Date().toISOString().split("T")[0],
        startTime: "09:00",
        endTime: "10:00",
      });
      setViewMode("list");
      fetchEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  // Delete event
  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Yakin ingin menghapus event ini?")) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/calendar?eventId=${eventId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Gagal menghapus event");
      }

      setViewMode("list");
      setSelectedEvent(null);
      fetchEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  // Update event
  const handleUpdateEvent = async () => {
    if (!selectedEvent || !editEvent.summary.trim()) {
      setError("Judul event harus diisi");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const startDateTime = `${editEvent.date}T${editEvent.startTime}:00`;
      const endDateTime = `${editEvent.date}T${editEvent.endTime}:00`;

      const response = await fetch("/api/calendar", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({
          eventId: selectedEvent.id,
          summary: editEvent.summary,
          description: editEvent.description,
          location: editEvent.location,
          start: { dateTime: startDateTime, timeZone: "Asia/Jakarta" },
          end: { dateTime: endDateTime, timeZone: "Asia/Jakarta" },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal mengupdate event");
      }

      setIsEditing(false);
      setViewMode("list");
      setSelectedEvent(null);
      fetchEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  // AI Schedule parsing
  const handleAISchedule = async () => {
    if (!aiPrompt.trim()) return;

    setAiLoading(true);
    setAiSuggestions([]);

    try {
      // Parse natural language to event
      const prompt = aiPrompt.toLowerCase();
      const now = new Date();
      let eventDate = new Date();
      let startTime = "09:00";
      let endTime = "10:00";
      let summary = aiPrompt;

      // Parse "besok"
      if (prompt.includes("besok")) {
        eventDate.setDate(eventDate.getDate() + 1);
      }
      // Parse "lusa"
      else if (prompt.includes("lusa")) {
        eventDate.setDate(eventDate.getDate() + 2);
      }
      // Parse day names
      const days = ["minggu", "senin", "selasa", "rabu", "kamis", "jumat", "sabtu"];
      for (let i = 0; i < days.length; i++) {
        if (prompt.includes(days[i])) {
          const currentDay = now.getDay();
          let targetDay = i;
          let daysUntil = targetDay - currentDay;
          if (daysUntil <= 0) daysUntil += 7;
          eventDate.setDate(now.getDate() + daysUntil);
          break;
        }
      }

      // Parse time - "jam X"
      const jamMatch = prompt.match(/jam\s*(\d{1,2})(?:[.:](\d{2}))?(?:\s*(pagi|siang|sore|malam))?/i);
      if (jamMatch) {
        let hour = parseInt(jamMatch[1]);
        const minute = jamMatch[2] ? parseInt(jamMatch[2]) : 0;
        const period = jamMatch[3]?.toLowerCase();

        if (period === "sore" || period === "malam") {
          if (hour < 12) hour += 12;
        } else if (period === "pagi" && hour === 12) {
          hour = 0;
        }

        startTime = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        const endHour = hour + 1;
        endTime = `${endHour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
      }

      // Parse duration - "X jam"
      const durationMatch = prompt.match(/(\d+)\s*jam/i);
      if (durationMatch && jamMatch) {
        const duration = parseInt(durationMatch[1]);
        const [startH, startM] = startTime.split(":").map(Number);
        const endH = startH + duration;
        endTime = `${endH.toString().padStart(2, "0")}:${startM.toString().padStart(2, "0")}`;
      }

      // Extract event title - remove time/date words
      summary = aiPrompt
        .replace(/besok|lusa|minggu|senin|selasa|rabu|kamis|jumat|sabtu/gi, "")
        .replace(/jam\s*\d{1,2}[.:]\d{2}|\bjam\s*\d{1,2}/gi, "")
        .replace(/pagi|siang|sore|malam/gi, "")
        .replace(/\d+\s*jam/gi, "")
        .replace(/\s+/g, " ")
        .trim();

      if (summary.length < 3) {
        summary = "Event Baru";
      }

      // Set suggestions
      setAiSuggestions([
        `📅 Tanggal: ${eventDate.toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`,
        `⏰ Waktu: ${startTime} - ${endTime}`,
        `📝 Judul: ${summary}`,
      ]);

      // Populate create form
      setNewEvent({
        summary: summary,
        description: `Dibuat dari AI: "${aiPrompt}"`,
        location: "",
        date: eventDate.toISOString().split("T")[0],
        startTime: startTime,
        endTime: endTime,
      });
    } catch (err) {
      setError("Gagal memproses input AI");
    } finally {
      setAiLoading(false);
    }
  };

  // Smart time suggestions
  const getSmartTimeSuggestions = (): string[] => {
    const suggestions: string[] = [];
    const busyTimes = events.map((e) => ({
      start: new Date(e.start.dateTime || e.start.date || ""),
      end: new Date(e.end.dateTime || e.end.date || ""),
    }));

    // Find free slots today
    const today = new Date();
    today.setHours(9, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(18, 0, 0, 0);

    const workHours = [9, 10, 11, 13, 14, 15, 16, 17];
    for (const hour of workHours) {
      const slotStart = new Date(today);
      slotStart.setHours(hour, 0, 0, 0);
      const slotEnd = new Date(today);
      slotEnd.setHours(hour + 1, 0, 0, 0);

      const isBusy = busyTimes.some(
        (busy) => slotStart < busy.end && slotEnd > busy.start
      );

      if (!isBusy && slotStart > new Date()) {
        suggestions.push(`Hari ini ${hour}:00 - ${hour + 1}:00`);
        if (suggestions.length >= 3) break;
      }
    }

    return suggestions;
  };

  // Send schedule to chat
  const handleSendToChat = () => {
    if (!onSendToChat) return;

    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    let scheduleText = `📅 **Jadwal Minggu Ini**\n`;
    scheduleText += `${currentWeekStart.toLocaleDateString("id-ID")} - ${weekEnd.toLocaleDateString("id-ID")}\n\n`;

    if (events.length === 0) {
      scheduleText += "_Tidak ada event minggu ini_";
    } else {
      const groupedEvents: { [key: string]: CalendarEvent[] } = {};
      events.forEach((event) => {
        const date = event.start.dateTime?.split("T")[0] || event.start.date || "";
        if (!groupedEvents[date]) groupedEvents[date] = [];
        groupedEvents[date].push(event);
      });

      Object.keys(groupedEvents)
        .sort()
        .forEach((date) => {
          const dateObj = new Date(date);
          scheduleText += `**${dateObj.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "short" })}**\n`;
          groupedEvents[date].forEach((event) => {
            const time = event.start.dateTime
              ? new Date(event.start.dateTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
              : "Sepanjang hari";
            scheduleText += `- ${time}: ${event.summary}\n`;
          });
          scheduleText += "\n";
        });
    }

    onSendToChat(scheduleText);
  };

  // View event detail
  const openEventDetail = (event: CalendarEvent) => {
    setSelectedEvent(event);
    
    const startDateTime = event.start.dateTime ? new Date(event.start.dateTime) : null;
    const endDateTime = event.end.dateTime ? new Date(event.end.dateTime) : null;
    
    setEditEvent({
      summary: event.summary || "",
      description: event.description || "",
      location: event.location || "",
      date: startDateTime ? startDateTime.toISOString().split("T")[0] : event.start.date || "",
      startTime: startDateTime ? startDateTime.toTimeString().slice(0, 5) : "00:00",
      endTime: endDateTime ? endDateTime.toTimeString().slice(0, 5) : "00:00",
    });
    
    setViewMode("detail");
    setIsEditing(false);
  };

  // Format helpers
  const formatTime = (dateTime?: string, date?: string) => {
    if (dateTime) {
      return new Date(dateTime).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return "Sepanjang hari";
  };

  const formatDate = (dateTime?: string, date?: string) => {
    const d = new Date(dateTime || date || "");
    return d.toLocaleDateString("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const getWeekRange = () => {
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    return `${currentWeekStart.toLocaleDateString("id-ID", { day: "numeric", month: "short" })} - ${weekEnd.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}`;
  };

  // Loading state
  if (!isOpen) return null;

  if (status === "loading") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl w-full max-w-lg mx-4 shadow-2xl">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!session) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl w-full max-w-lg mx-4 shadow-2xl">
          <div className="flex items-center justify-between p-4 border-b border-neutral-800">
            <h2 className="font-semibold text-white">Google Calendar</h2>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <Calendar className="w-12 h-12 text-neutral-400" />
            <p className="text-neutral-400 text-center">
              Hubungkan Google Calendar untuk mengelola jadwal
            </p>
            <button
              onClick={() => signIn("google")}
              className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-neutral-200 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Hubungkan Google Calendar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl w-full max-w-lg mx-4 shadow-2xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-neutral-400" />
            <div>
              <h2 className="font-semibold text-white">Google Calendar</h2>
              <p className="text-xs text-neutral-500">{session.user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => signOut()}
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
              title="Keluar"
            >
              <LogOut className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 p-2 border-b border-neutral-800 bg-neutral-900/50">
        <button
          onClick={() => setViewMode("list")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
            viewMode === "list"
              ? "bg-white text-black"
              : "text-neutral-400 hover:text-white hover:bg-neutral-800"
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          Jadwal
        </button>
        <button
          onClick={() => setViewMode("create")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
            viewMode === "create"
              ? "bg-white text-black"
              : "text-neutral-400 hover:text-white hover:bg-neutral-800"
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          Buat Event
        </button>
        <button
          onClick={() => setViewMode("ai-schedule")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
            viewMode === "ai-schedule"
              ? "bg-white text-black"
              : "text-neutral-400 hover:text-white hover:bg-neutral-800"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          AI Schedule
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* List View */}
        {viewMode === "list" && (
          <div className="p-4 space-y-4">
            {/* Week Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigateWeek("prev")}
                className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white">{getWeekRange()}</span>
                <button
                  onClick={goToToday}
                  className="px-2 py-1 text-xs text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
                >
                  Hari ini
                </button>
              </div>
              <button
                onClick={() => navigateWeek("next")}
                className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={fetchEvents}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
              {onSendToChat && (
                <button
                  onClick={handleSendToChat}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Kirim ke Chat
                </button>
              )}
            </div>

            {/* Events List */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-10 h-10 text-neutral-600 mx-auto mb-2" />
                <p className="text-neutral-500 text-sm">Tidak ada event minggu ini</p>
              </div>
            ) : (
              <div className="space-y-2">
                {events.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => openEventDetail(event)}
                    className="w-full text-left p-3 bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">{event.summary}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-neutral-400">
                            {formatDate(event.start.dateTime, event.start.date)}
                          </span>
                          <span className="text-xs text-neutral-500">•</span>
                          <span className="text-xs text-neutral-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(event.start.dateTime, event.start.date)}
                          </span>
                        </div>
                        {event.location && (
                          <p className="text-xs text-neutral-500 mt-1 truncate">📍 {event.location}</p>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-neutral-400 flex-shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create View */}
        {viewMode === "create" && (
          <div className="p-4 space-y-4">
            {/* Smart Suggestions */}
            {getSmartTimeSuggestions().length > 0 && (
              <div className="p-3 bg-neutral-900 rounded-lg">
                <p className="text-xs text-neutral-400 mb-2 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Waktu kosong:
                </p>
                <div className="flex flex-wrap gap-2">
                  {getSmartTimeSuggestions().map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        const match = suggestion.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
                        if (match) {
                          setNewEvent((prev) => ({
                            ...prev,
                            date: new Date().toISOString().split("T")[0],
                            startTime: `${match[1].padStart(2, "0")}:${match[2]}`,
                            endTime: `${match[3].padStart(2, "0")}:${match[4]}`,
                          }));
                        }
                      }}
                      className="px-2 py-1 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm text-neutral-400 mb-1">Judul Event *</label>
              <input
                type="text"
                value={newEvent.summary}
                onChange={(e) => setNewEvent({ ...newEvent, summary: e.target.value })}
                placeholder="Contoh: Meeting dengan tim"
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
              />
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-1">Deskripsi</label>
              <textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="Detail event..."
                rows={2}
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-1">Lokasi</label>
              <input
                type="text"
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                placeholder="Contoh: Ruang Meeting A"
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
              />
            </div>

            <div>
              <label className="block text-sm text-neutral-400 mb-1">Tanggal</label>
              <input
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-neutral-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Mulai</label>
                <input
                  type="time"
                  value={newEvent.startTime}
                  onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-neutral-600"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Selesai</label>
                <input
                  type="time"
                  value={newEvent.endTime}
                  onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-neutral-600"
                />
              </div>
            </div>

            <button
              onClick={handleCreateEvent}
              disabled={loading || !newEvent.summary.trim()}
              className="w-full py-2.5 bg-white text-black rounded-lg font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Buat Event
            </button>
          </div>
        )}

        {/* AI Schedule View */}
        {viewMode === "ai-schedule" && (
          <div className="p-4 space-y-4">
            <div className="p-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <p className="text-sm font-medium text-white">AI Schedule Assistant</p>
              </div>
              <p className="text-xs text-neutral-400">
                Ketik jadwal dengan bahasa natural, contoh: "Meeting dengan client besok jam 2 sore" atau "Deadline project hari Jumat"
              </p>
            </div>

            <div className="relative">
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Ketik jadwal dengan bahasa natural..."
                rows={3}
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder:text-neutral-600 focus:outline-none focus:border-purple-500/50 resize-none"
              />
              <button
                onClick={handleAISchedule}
                disabled={aiLoading || !aiPrompt.trim()}
                className="absolute right-2 bottom-2 p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {aiLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* AI Suggestions */}
            {aiSuggestions.length > 0 && (
              <div className="p-3 bg-neutral-900 rounded-lg space-y-2">
                <p className="text-xs text-neutral-400 font-medium">Hasil parsing:</p>
                {aiSuggestions.map((suggestion, i) => (
                  <p key={i} className="text-sm text-white">{suggestion}</p>
                ))}
                <button
                  onClick={() => {
                    setAiSuggestions([]);
                    setViewMode("create");
                  }}
                  className="w-full mt-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Buat Event Ini
                </button>
              </div>
            )}

            {/* Quick Examples */}
            <div>
              <p className="text-xs text-neutral-500 mb-2">Contoh cepat:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Meeting besok jam 10 pagi",
                  "Deadline project hari Jumat",
                  "Lunch dengan tim jam 12 siang",
                  "Review code hari Rabu jam 3 sore 2 jam",
                ].map((example, i) => (
                  <button
                    key={i}
                    onClick={() => setAiPrompt(example)}
                    className="px-2 py-1 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-400 rounded transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Detail View */}
        {viewMode === "detail" && selectedEvent && (
          <div className="p-4 space-y-4">
            <button
              onClick={() => {
                setViewMode("list");
                setSelectedEvent(null);
                setIsEditing(false);
              }}
              className="flex items-center gap-1 text-sm text-neutral-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Kembali
            </button>

            {isEditing ? (
              /* Edit Mode */
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-neutral-400 mb-1">Judul Event *</label>
                  <input
                    type="text"
                    value={editEvent.summary}
                    onChange={(e) => setEditEvent({ ...editEvent, summary: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-neutral-600"
                  />
                </div>

                <div>
                  <label className="block text-sm text-neutral-400 mb-1">Deskripsi</label>
                  <textarea
                    value={editEvent.description}
                    onChange={(e) => setEditEvent({ ...editEvent, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-neutral-600 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-neutral-400 mb-1">Lokasi</label>
                  <input
                    type="text"
                    value={editEvent.location}
                    onChange={(e) => setEditEvent({ ...editEvent, location: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-neutral-600"
                  />
                </div>

                <div>
                  <label className="block text-sm text-neutral-400 mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={editEvent.date}
                    onChange={(e) => setEditEvent({ ...editEvent, date: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-neutral-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-neutral-400 mb-1">Mulai</label>
                    <input
                      type="time"
                      value={editEvent.startTime}
                      onChange={(e) => setEditEvent({ ...editEvent, startTime: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-neutral-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-neutral-400 mb-1">Selesai</label>
                    <input
                      type="time"
                      value={editEvent.endTime}
                      onChange={(e) => setEditEvent({ ...editEvent, endTime: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-neutral-600"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-2 bg-neutral-800 text-white rounded-lg font-medium hover:bg-neutral-700 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleUpdateEvent}
                    disabled={loading}
                    className="flex-1 py-2 bg-white text-black rounded-lg font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Simpan
                  </button>
                </div>
              </div>
            ) : (
              /* View Mode */
              <div className="space-y-4">
                <div className="p-4 bg-neutral-900 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">{selectedEvent.summary}</h3>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-neutral-400">
                      <Calendar className="w-4 h-4" />
                      {formatDate(selectedEvent.start.dateTime, selectedEvent.start.date)}
                    </div>
                    <div className="flex items-center gap-2 text-neutral-400">
                      <Clock className="w-4 h-4" />
                      {formatTime(selectedEvent.start.dateTime, selectedEvent.start.date)} - {formatTime(selectedEvent.end.dateTime, selectedEvent.end.date)}
                    </div>
                    {selectedEvent.location && (
                      <div className="flex items-center gap-2 text-neutral-400">
                        📍 {selectedEvent.location}
                      </div>
                    )}
                  </div>

                  {selectedEvent.description && (
                    <div className="mt-4 pt-4 border-t border-neutral-800">
                      <p className="text-xs text-neutral-500 mb-1">Deskripsi</p>
                      <p className="text-sm text-neutral-300">{selectedEvent.description}</p>
                    </div>
                  )}

                  {selectedEvent.htmlLink && (
                    <a
                      href={selectedEvent.htmlLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-4 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Buka di Google Calendar →
                    </a>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 py-2 bg-neutral-800 text-white rounded-lg font-medium hover:bg-neutral-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(selectedEvent.id)}
                    disabled={loading}
                    className="flex-1 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg font-medium hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    Hapus
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
