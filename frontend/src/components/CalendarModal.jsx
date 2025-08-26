import React, { useEffect, useRef, useState, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import {
  getCalendarEvents,
  createCustomCalendarEvent,
  deleteCustomCalendarEvent,
} from "../services/api";
import { FaTimes, FaPlus, FaSave, FaTrash } from "react-icons/fa";
import "../style/Calendar.css";
import { useTranslation } from 'react-i18next';
import itLocale from '@fullcalendar/core/locales/it';
import enLocale from '@fullcalendar/core/locales/en-gb';
export default function CalendarModal({ isOpen, onClose }) {
  const [events, setEvents] = useState([]);
  const [reptiles, setReptiles] = useState([]);
  const [selectedReptile, setSelectedReptile] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const { i18n } = useTranslation();

const localeMap = {
  it: itLocale,
  en: enLocale,
};
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    endDate: "",
    reptiles: [],
    color: "#3b82f6",
    sendReminder: false,
  });

  const [deleteTarget, setDeleteTarget] = useState(null);

  const [dayEventsModal, setDayEventsModal] = useState({ open: false, date: null, list: [] });


  const fetchEvents = useCallback(async () => {
    setLoading(true);

    try {
      const res = await getCalendarEvents(selectedReptile || null);

      const reptileMap = {};
      res.data.forEach((ev) => {
        if (Array.isArray(ev.reptile)) {
          ev.reptile.forEach((r) => (reptileMap[r._id] = r));
        } else if (ev.reptile?._id) {
          reptileMap[ev.reptile._id] = ev.reptile;
        } else if (ev.reptile?.male || ev.reptile?.female) {
          if (ev.reptile.male?._id) reptileMap[ev.reptile.male._id] = ev.reptile.male;
          if (ev.reptile.female?._id) reptileMap[ev.reptile.female._id] = ev.reptile.female;
        }
      });
      setReptiles(Object.values(reptileMap));

      const mapped = res.data.map((ev) => {
        const start = ev.date;
        const end = ev.extraData?.endDate || ev.endDate || ev.date;

        const makeFallbackId = (ev) => {
          const reptileId =
            (ev.reptile && (ev.reptile._id || ev.reptile.id)) ||
            (ev.reptile && ev.reptile.male && (ev.reptile.male._id || ev.reptile.male.id)) ||
            (ev.reptile && ev.reptile.female && (ev.reptile.female._id || ev.reptile.female.id)) ||
            "no-reptile";
          const time = start ? String(new Date(start).getTime()) : "no-time";
          return `${ev.type || "event"}_${reptileId}_${time}`;
        };

        const id = ev._id?.toString?.() || ev.id?.toString?.() || makeFallbackId(ev);
        const title = ev.title || ev.description || "Evento";
        const isCustom = ev.type === "custom" || ev.isCustom === true;

        const bg = isCustom
          ? ev.extraData?.color || ev.color || "#3b82f6"
          : ev.type?.includes?.("feeding")
            ? "#22c55e"
            : ev.type?.includes?.("breeding")
              ? "#ef4444"
              : "#6366f1";

        const calcAllDay = (() => {
          if (typeof start === "string" && typeof end === "string") {
            return !start.includes("T") && !end.includes("T");
          }
          try {
            const s = new Date(start);
            const e = new Date(end);
            return s.getHours() === 0 && s.getMinutes() === 0 && e.getHours() === 0 && e.getMinutes() === 0;
          } catch {
            return false;
          }
        })();

        return {
          id,
          title,
          start,
          end,
          backgroundColor: bg,
          borderColor: bg,
          textColor: "#fff",
          allDay: calcAllDay,
          extendedProps: { ...ev, isCustom },
        };
      });


      setEvents(mapped);
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedReptile]);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        if (showForm) setShowForm(false);
        else if (deleteTarget) setDeleteTarget(null);
        else if (dayEventsModal.open) setDayEventsModal({ open: false, date: null, list: [] });
        else onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose, showForm, deleteTarget, dayEventsModal.open]);

  useEffect(() => {
    if (isOpen) fetchEvents();
  }, [selectedReptile, isOpen, fetchEvents]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const newEvent = await createCustomCalendarEvent({
        title: formData.title?.trim(),
        description: formData.description?.trim(),
        date: formData.date,
        endDate: formData.endDate || formData.date,
        reptiles: formData.reptiles,
        color: formData.color,
        sendReminder: formData.sendReminder,
      });

      const mapped = {
        id: newEvent.data._id,
        title: newEvent.data.title || newEvent.data.description ||  t("calendarModal.event"),
        start: newEvent.data.date,
        end: newEvent.data.endDate || newEvent.data.date,
        backgroundColor: newEvent.data.color || "#3b82f6",
        borderColor: newEvent.data.color || "#3b82f6",
        textColor: "#fff",
        allDay: !newEvent.data.date.includes("T"),
        extendedProps: { ...newEvent.data, isCustom: true },
      };

      setEvents((prev) => [...prev, mapped]);
      await fetchEvents();
      setShowForm(false);
      setFormData({
        title: "",
        description: "",
        date: "",
        endDate: "",
        reptiles: [],
        color: "#3b82f6",
      });
    } catch (err) {
      console.error("Error creating custom event:", err);
    }
  };

  const handleEventClick = (info) => {
    const ev = info.event;
    const props = ev.extendedProps;
    if (props?.isCustom) {
      setDeleteTarget(ev);
    }
  };

  const confirmDelete = async () => {
    try {
      if (!deleteTarget) return;
      await deleteCustomCalendarEvent(deleteTarget.id);

      setEvents((prev) => prev.filter((ev) => ev.id !== deleteTarget.id));
      await fetchEvents();
      setDeleteTarget(null);
    } catch (err) {
      console.error("Error deleting custom event:", err);
    }
  };
  const handleMoreLinkClick = (arg) => {
    const dayStart = new Date(arg.date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const calEvents = arg.view.calendar.getEvents();
    const list = calEvents
      .filter((e) => {
        const s = e.start;
        const en = e.end || e.start;
        return s < dayEnd && en >= dayStart;
      })
      .sort((a, b) => {
        const as = a.start?.getTime() || 0;
        const bs = b.start?.getTime() || 0;
        if (as !== bs) return as - bs;
        return (a.title || "").localeCompare(b.title || "");
      });

    setDayEventsModal({ open: true, date: dayStart, list });
    return "prevent";
  };

  const renderEventContent = (arg) => {
    const { event } = arg;
    const title = event.title ||  t("calendarModal.event");
    const dotStyle = {
      backgroundColor: event.backgroundColor || event.borderColor || "#64748b",
    };
    return (
      <div className="flex items-center gap-2 w-full">
        <span className="inline-block w-2 h-2 rounded-full" style={dotStyle} />
        <span className="truncate">{title}</span>
      </div>
    );
  };

  const formatDate = (d) =>
    new Date(d).toLocaleString("it-IT", { dateStyle: "medium", timeStyle: "short" });

  return (
    <div
      className={`fixed top-[64px] left-0 right-0 bottom-0 z-40 flex h-full transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      aria-hidden={!isOpen}

    >
      <div onClick={onClose} className="flex-1 bg-black/60 backdrop-blur-sm h-full cursor-pointer"></div>

      <div
        className={`relative w-full md:w-3/4 md:max-w-3xl h-full bg-slate-50 shadow-2xl ml-auto transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        role="dialog"
        aria-label={t("calendarModal.title")}
      >
        <div className="p-4 sm:p-6 h-full flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h1 className="text-2xl font-bold text-slate-800"> {t("calendarModal.title")}</h1>
              <p className="text-sm text-slate-500">{t("calendarModal.subtitle")}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-500 hover:bg-slate-200 transition-colors"
              aria-label={t("calendarModal.close")}
            >
              <FaTimes size={20} />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between my-4 gap-4">
            <select
              value={selectedReptile}
              onChange={(e) => setSelectedReptile(e.target.value)}
              className="w-full p-2.5 rounded-lg border-slate-300 bg-white shadow-sm focus:ring-2 focus:ring-forest focus:border-forest transition"
            >
              <option value="">{t("calendarModal.filterPlaceholder")}</option>
              {reptiles.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name} ({r.species})
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowForm(true)}
              className="flex w-full sm:w-auto items-center justify-center gap-2 bg-forest text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-olive shadow-sm transition-all duration-200 transform hover:scale-105 whitespace-nowrap"
            >
              <FaPlus size={12} /> {t("calendarModal.addEvent")}
            </button>
          </div>

          <div className="flex-grow overflow-hidden calendar-container">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={events}
              eventClick={handleEventClick}
              eventContent={renderEventContent}
              locale={localeMap[i18n.language] || enLocale}
              height="100%"
              buttonText={{ today: t("calendarModal.today"), month: t("calendarModal.month"), week: t("calendarModal.week"), list: t("calendarModal.list") }}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,listWeek",
              }}
              views={{
                dayGridMonth: {
                  dayMaxEventRows: 3,
                  moreLinkClick: handleMoreLinkClick,
                  moreLinkText: (num) => t("calendarModal.other",{number:num}),
                },
                timeGridWeek: {
                  slotMinTime: "06:00:00",
                  slotMaxTime: "22:00:00",
                },
                listWeek: {
                  noEventsText: t("calendarModal.noEvent"),
                },
              }}
              eventTimeFormat={{
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              }}
              displayEventEnd={true}
              dayMaxEvents={true}
            />
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 top-16 bottom-0 z-40 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowForm(false)}></div>
          <div className="relative bg-white p-6 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 animate-in fade-in-0 zoom-in-95">
            <h2 className="text-xl font-bold text-slate-800 mb-4">{t("calendarModal.createEvent")}</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <input
                type="text"
                placeholder={t("calendarModal.eventTitle")}
                className="w-full p-2.5 rounded-lg border-slate-300 focus:ring-2 focus:ring-forest transition"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <textarea
                placeholder={t("calendarModal.eventDescription")}
                rows="3"
                className="w-full p-2.5 rounded-lg border-slate-300 focus:ring-2 focus:ring-forest transition"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="datetime-local"
                  title={t("calendarModal.startDate")}
                  className="w-full min-w-0 p-2.5 rounded-lg border-slate-300 focus:ring-2 focus:ring-forest transition"
                  value={formData.date}
                  onChange={(e) => {
                    setFormData({ ...formData, date: e.target.value });
                    if (formData.endDate && formData.endDate < e.target.value) {
                      setFormData(prev => ({ ...prev, endDate: "" }));
                    }
                  }}
                  required
                />
                <input
                  type="datetime-local"
                  title={t("calendarModal.endDate")}
                  className="w-full min-w-0 p-2.5 rounded-lg border-slate-300 focus:ring-2 focus:ring-forest transition"
                  value={formData.endDate}
                  min={formData.date}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block mb-1 text-slate-600">{t("calendarModal.selectReptiles")}</label>
                <select
                  multiple
                  value={formData.reptiles}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, (opt) => opt.value);
                    setFormData({ ...formData, reptiles: selected });
                  }}
                  className="w-full p-2.5 rounded-lg border-slate-300 bg-white shadow-sm focus:ring-2 focus:ring-forest focus:border-forest transition"
                >
                  {reptiles.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.name} ({r.species}) ({r.morph})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">{t("calendarModal.multiSelectHint")}</p>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-slate-600">{t("calendarModal.color")}</label>
                <input
                  type="color"
                  className="h-10 w-16 rounded-lg border-slate-300"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sendReminder"
                  checked={formData.sendReminder}
                  onChange={(e) => setFormData({ ...formData, sendReminder: e.target.checked })}
                />
                <label htmlFor="sendReminder" className="text-slate-600">
                  {t("calendarModal.sendReminder")}
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 font-semibold transition"
                >
                  {t("calendarModal.cancel")}
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-forest text-white hover:bg-olive font-semibold transition"
                >
                  <FaSave /> {t("calendarModal.saveEvent")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white w-full max-w-md rounded-xl shadow-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">{t("calendarModal.deleteEventTitle")}</h3>
              <button
                className="p-2 rounded-full text-slate-500 hover:bg-slate-200"
                onClick={() => setDeleteTarget(null)}
                aria-label={t("calendarModal.closed")}
              >
                <FaTimes />
              </button>
            </div>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="font-semibold text-slate-800">{deleteTarget.title}</div>
              {deleteTarget.extendedProps?.description && (
                <div className="whitespace-pre-line">{deleteTarget.extendedProps.description}</div>
              )}
              <div>
                {formatDate(deleteTarget.start)}
                {deleteTarget.end ? ` → ${formatDate(deleteTarget.end)}` : ""}
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                className="px-4 py-2 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 font-semibold"
                onClick={() => setDeleteTarget(null)}
              >
                {t("calendarModal.cancel")}
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-semibold flex items-center gap-2"
                onClick={confirmDelete}
              >
                <FaTrash /> {t("calendarModal.deleteEventButton")}
              </button>
            </div>
          </div>
        </div>
      )}

      {dayEventsModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDayEventsModal({ open: false, date: null, list: [] })}
          />
          <div className="relative bg-white w-full max-w-2xl rounded-xl shadow-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">
                {t("calendarModal.eventsOfDay", {date: dayEventsModal.date?.toLocaleDateString("it-IT")})}
              </h3>
              <button
                className="p-2 rounded-full text-slate-500 hover:bg-slate-200"
                onClick={() => setDayEventsModal({ open: false, date: null, list: [] })}
                aria-label="Chiudi"
              >
                <FaTimes />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-auto divide-y divide-slate-100">
              {dayEventsModal.list.map((ev) => (
                <div key={ev.id} className="py-3 flex items-start gap-3">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full mt-1.5"
                    style={{ backgroundColor: ev.backgroundColor || ev.borderColor }}
                    aria-hidden
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-slate-800 truncate">{ev.title}</div>
                      {ev.extendedProps?.isCustom && (
                        <span className="text-[11px] rounded px-1.5 py-0.5 bg-slate-100 text-slate-600">
                          {t("calendarModal.custom")}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500">
                      {ev.allDay ? t("calendarModal.allDay") : formatDate(ev.start)}
                      {ev.end ? ` → ${formatDate(ev.end)}` : ""}
                    </div>
                    {ev.extendedProps?.description && (
                      <div className="text-sm text-slate-600 mt-1 line-clamp-2">
                        {ev.extendedProps.description}
                      </div>
                    )}
                  </div>
                  {ev.extendedProps?.isCustom && (
                    <button
                      className="self-center px-3 py-1.5 rounded bg-red-600 text-white hover:bg-red-700 text-sm font-semibold"
                      onClick={() => setDeleteTarget(ev)}
                    >
                      {t("calendarModal.deleteEventButton")}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
