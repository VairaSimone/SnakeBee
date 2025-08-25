import Feeding from "../models/Feeding.js";
import Event from "../models/Event.js";
import Breeding from "../models/Breeding.js";
import Reptile from "../models/Reptile.js";
import CustomEvent from "../models/CustomEvent.js";
import { getUserPlan } from "../utils/getUserPlans.js";
import User from "../models/User.js";

const toIso = (d) => {
  if (!d) return null;
  return typeof d === "string"
    ? new Date(d).toISOString()
    : (d.toISOString ? d.toISOString() : new Date(d).toISOString());
};

export const getCalendarEvents = async (req, res) => {
  try {
    const userId = req.user.userid;
    const { reptileId } = req.query;
    const user = await User.findById(req.user.userid).lean();
    if (!user) {
      return res.status(404).send({ message: req.t('user_notFound') });
    }

    const { plan } = getUserPlan(user);

    if (plan !== 'BREEDER') {
      return res.status(403).json({ error: req.t("premium_only_feature") });
    }

    const reptileIds = reptileId
      ? [reptileId]
      : (await Reptile.find({ user: userId }).select("_id").lean()).map((r) => r._id);

 
const customEventFilter = { user: userId };

if (reptileId) {
  customEventFilter.$or = [
    { reptiles: reptileId },      
    { reptiles: { $eq: [] } },    
  ];
}
    const [feedings, reptileEvents, breedings, customEvents] = await Promise.all([
      Feeding.find({ reptile: { $in: reptileIds } }).populate("reptile", "name species morph").lean(),
      Event.find({ reptile: { $in: reptileIds } }).populate("reptile", "name species").lean(),
      Breeding.find({
        user: userId,
        ...(reptileId && { $or: [{ male: reptileId }, { female: reptileId }] }),
      })
        .populate("male", "name species morph")
        .populate("female", "name species morph")
        .lean(),
  CustomEvent.find(customEventFilter)             // <-- qui passo il filtro corretto
    .populate("reptiles", "name species morph")
    .lean(),
    ]);

    const feedingEvents = feedings.flatMap((f) => {
      const baseId = f._id
        ? f._id.toString()
        : `feeding_${new Date(f.date).getTime()}_${f.reptile?._id || "unknown"}`;

      const base = {
        _id: f._id || null,
        id: baseId,
        date: toIso(f.date),
        type: "feeding",
        reptile: f.reptile,
        description: req.t("calendar.feedingDescription", {
          foodType: f.foodType,
          quantity: f.quantity || 1,
          weight: f.weightPerUnit || 0,
        }),
        extraData: {
          wasEaten: f.wasEaten,
          notes: f.notes,
        },
      };

      const events = [base];

      if (f.nextFeedingDate) {
        events.push({
          _id: f._id ? `${baseId}_next` : `feeding_next_${new Date(f.nextFeedingDate).getTime()}`,
          id: f._id ? `${baseId}_next` : `feeding_next_${new Date(f.nextFeedingDate).getTime()}`,
          date: toIso(f.nextFeedingDate),
          type: "nextFeeding",
          reptile: f.reptile,
          description: req.t("calendar.nextFeeding"),
          extraData: {},
        });
      }

      return events;
    });

    const mappedReptileEvents = reptileEvents.map((e) => {
      const id = e._id
        ? e._id.toString()
        : `event_${new Date(e.date).getTime()}_${e.reptile?._id || "unknown"}`;

      return {
        _id: e._id || null,
        id,
        date: toIso(e.date),
        type: e.type,
        reptile: e.reptile,
        title: e.title,
        description: req.t("calendar.reptileEvent", { type: e.type }),
        extraData: {
          notes: e.notes,
          weight: e.weight,
        },
      };
    });

    const breedingEvents = breedings.flatMap((b) =>
      (b.events || []).map((ev, idx) => {
        const id = ev._id
          ? ev._id.toString()
          : `breeding_${b._id ? b._id.toString() : "no-b"}_${new Date(ev.date).getTime()}_${idx}`;
        return {
          _id: ev._id || null,
          id,
          date: toIso(ev.date),
          type: `breeding:${ev.type}`,
          reptile: {
            male: b.male,
            female: b.female,
          },
          description: req.t("calendar.breedingEvent", {
            type: ev.type,
            species: b.species,
          }),
          extraData: {
            notes: ev.notes,
            outcome: b.outcome,
          },
        };
      })
    );

    const mappedCustomEvents = customEvents.map((c) => ({
      _id: c._id,
      id: c._id.toString(),
      date: toIso(c.date),
      endDate: toIso(c.endDate),
      title: c.title,
      description: c.description,
      type: "custom",
      reptile: c.reptiles.length ? c.reptiles : null,
      color: c.color,
      isCustom: true,
    }));

    const allEvents = [...feedingEvents, ...mappedReptileEvents, ...breedingEvents, ...mappedCustomEvents];

    allEvents.sort((a, b) => {
      const da = a.date ? new Date(a.date).getTime() : Number.MAX_SAFE_INTEGER;
      const db = b.date ? new Date(b.date).getTime() : Number.MAX_SAFE_INTEGER;
      return da - db;
    });

    res.json(allEvents);
  } catch (err) {
    console.error("Calendar error:", err && err.stack ? err.stack : err);
    res.status(500).json({ error: req.t("server_error") });
  }
};

export const createCustomEvent = async (req, res) => {
  try {
    const userId = req.user.userid;
    const { reptiles, title, description, date, endDate, color, sendReminder } = req.body;
    const user = await User.findById(req.user.userid).lean();
    if (!user) {
      return res.status(404).send({ message: req.t('user_notFound') });
    }
    const { plan } = getUserPlan(user);

    if (plan !== 'BREEDER') {
      return res.status(403).json({ error: req.t("premium_only_feature") });
    }
    const newEvent = new CustomEvent({
      user: userId,
      reptiles: reptiles || [],
      title,
      description,
      date,
      endDate,
      color,
      sendReminder: !!sendReminder,
    });

    await newEvent.save();

    res.status(201).json(newEvent);
  } catch (err) {
    console.error("Create custom event error:", err);
    res.status(500).json({ error: req.t("element_error") });
  }
};

export const deleteCustomEvent = async (req, res) => {
  try {
    const userId = req.user.userid;
    const { id } = req.params;

    const event = await CustomEvent.findOne({ _id: id, user: userId });

    if (!event) {
      return res.status(404).json({ error: req.t("eventNotFound") });
    }

    await event.deleteOne();

    res.json({ message: req.t("event_delete") });
  } catch (err) {
    console.error("Delete custom event error:", err);
    res.status(500).json({ error: req.t("element_error") });
  }
};
