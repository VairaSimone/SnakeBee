import express from "express";
import { authenticateJWT } from "../middlewares/Auth.js";
import { createCustomEvent, deleteCustomEvent, getCalendarEvents } from "../controllers/CalendarController.js";

const calendar = express.Router();

calendar.get("/", authenticateJWT, getCalendarEvents);
calendar.post("/custom", authenticateJWT, createCustomEvent);
calendar.delete("/custom/:id", authenticateJWT, deleteCustomEvent);

export default calendar;
