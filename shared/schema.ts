import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table for admin authentication
export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("staff"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Destinations table (offices/departments)
export const destinations = pgTable("destinations", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  floor: text("floor"),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
});

export const insertDestinationSchema = createInsertSchema(destinations).omit({
  id: true,
});

export type InsertDestination = z.infer<typeof insertDestinationSchema>;
export type Destination = typeof destinations.$inferSelect;

// Staff contacts for notifications
export const staffContacts = pgTable("staff_contacts", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  department: text("department"),
  mobileNumber: text("mobile_number").notNull(),
  email: text("email"),
  isActive: boolean("is_active").notNull().default(true),
});

export const insertStaffContactSchema = createInsertSchema(staffContacts).omit({
  id: true,
});

export type InsertStaffContact = z.infer<typeof insertStaffContactSchema>;
export type StaffContact = typeof staffContacts.$inferSelect;

// Visitors log - main table for tracking visitors
export const visitors = pgTable("visitors", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  registrationType: text("registration_type").notNull().default("visitor"), // "visitor" or "employee"
  name: text("name").notNull(),
  destinationId: varchar("destination_id").references(() => destinations.id), // for backward compatibility, but we'll use destinations
  destinations: text("destinations"), // JSON array of destination IDs for multiple
  destinationName: text("destination_name"), // for backward compatibility
  personToVisit: text("person_to_visit"),
  purpose: text("purpose").notNull(),
  idScanImage: text("id_scan_image"),
  idOcrText: text("id_ocr_text"),
  photoImage: text("photo_image"),
  rfid: text("rfid"), // RFID number
  passNumber: text("pass_number"), // Guest pass number
  entryTime: timestamp("entry_time"),
  exitTime: timestamp("exit_time"),
  status: text("status").notNull().default("registered"),
  approvalStatus: text("approval_status").default("pending"),
  approvalToken: text("approval_token"),
});

export const visitorsRelations = relations(visitors, ({ one }) => ({
  destination: one(destinations, {
    fields: [visitors.destinationId],
    references: [destinations.id],
  }),
}));

export const insertVisitorSchema = createInsertSchema(visitors).omit({
  id: true,
});

export type InsertVisitor = z.infer<typeof insertVisitorSchema>;
export type Visitor = typeof visitors.$inferSelect;

// Scheduled visits (pre-registration)
export const scheduledVisits = pgTable("scheduled_visits", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  visitorName: text("visitor_name").notNull(),
  visitorEmail: text("visitor_email"),
  visitorPhone: text("visitor_phone"),
  destinationId: varchar("destination_id").references(() => destinations.id),
  destinationName: text("destination_name"),
  hostName: text("host_name").notNull(),
  purpose: text("purpose").notNull(),
  expectedDate: timestamp("expected_date").notNull(),
  notes: text("notes"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const scheduledVisitsRelations = relations(
  scheduledVisits,
  ({ one }) => ({
    destination: one(destinations, {
      fields: [scheduledVisits.destinationId],
      references: [destinations.id],
    }),
  }),
);

export const insertScheduledVisitSchema = createInsertSchema(
  scheduledVisits,
).omit({
  id: true,
  status: true,
  createdAt: true,
});

export type InsertScheduledVisit = z.infer<typeof insertScheduledVisitSchema>;
export type ScheduledVisit = typeof scheduledVisits.$inferSelect;

// Building settings
export const settings = pgTable("settings", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
});

export const insertSettingSchema = createInsertSchema(settings).omit({
  id: true,
});

export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type Setting = typeof settings.$inferSelect;

// Purpose options (predefined)
export const visitPurposes = [
  "Guest",
  "Delivery",
  "Meeting",
  "Repair Works",
  "Inspection",
] as const;

export type VisitPurpose = (typeof visitPurposes)[number];
