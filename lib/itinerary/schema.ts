import type { Itinerary, ItineraryActivity, ItineraryDay } from "./types";

const activitySchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    description: { type: "string" },
    area: { type: "string" },
  },
  required: ["name", "description", "area"],
  additionalProperties: false,
} as const;

const activityList = { type: "array", items: activitySchema, minItems: 1, maxItems: 2 } as const;

export const itinerarySchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    summary: { type: "string" },
    days: {
      type: "array",
      minItems: 1,
      maxItems: 7,
      items: {
        type: "object",
        properties: {
          dayNumber: { type: "integer" },
          title: { type: "string" },
          morning: activityList,
          afternoon: activityList,
          evening: activityList,
        },
        required: ["dayNumber", "title", "morning", "afternoon", "evening"],
        additionalProperties: false,
      },
    },
    tips: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 5 },
  },
  required: ["title", "summary", "days", "tips"],
  additionalProperties: false,
} as const;

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function boundedText(value: unknown, max: number): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= max;
}

function validActivity(value: unknown): value is ItineraryActivity {
  return record(value) && Object.keys(value).length === 3 &&
    boundedText(value.name, 120) && boundedText(value.description, 320) &&
    typeof value.area === "string" && value.area.length <= 100;
}

function validPeriod(value: unknown): value is ItineraryActivity[] {
  return Array.isArray(value) && value.length >= 1 && value.length <= 2 && value.every(validActivity);
}

function validDay(value: unknown, number: number): value is ItineraryDay {
  return record(value) && Object.keys(value).length === 5 && value.dayNumber === number &&
    boundedText(value.title, 120) && validPeriod(value.morning) &&
    validPeriod(value.afternoon) && validPeriod(value.evening);
}

export function isItinerary(value: unknown, expectedDays: number): value is Itinerary {
  return Number.isInteger(expectedDays) && expectedDays >= 1 && expectedDays <= 7 &&
    record(value) && Object.keys(value).length === 4 &&
    boundedText(value.title, 160) && boundedText(value.summary, 500) &&
    Array.isArray(value.days) && value.days.length === expectedDays &&
    value.days.every((day, index) => validDay(day, index + 1)) &&
    Array.isArray(value.tips) && value.tips.length >= 2 && value.tips.length <= 5 &&
    value.tips.every((tip) => boundedText(tip, 260));
}
