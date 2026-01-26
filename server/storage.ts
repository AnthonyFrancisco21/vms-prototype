import {
  type User,
  type InsertUser,
  type Destination,
  type InsertDestination,
  type StaffContact,
  type InsertStaffContact,
  type Visitor,
  type InsertVisitor,
  type Employee,
  type InsertEmployee,
  type GuestPass,
  type InsertGuestPass,
  type Setting,
  type InsertSetting,
  type ScheduledVisit,
  type InsertScheduledVisit,
  users,
  destinations,
  staffContacts,
  visitors,
  employees,
  guestPasses,
  settings,
  scheduledVisits,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc, isNull, isNotNull, or } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Destinations
  getDestinations(): Promise<Destination[]>;
  getDestination(id: string): Promise<Destination | undefined>;
  createDestination(destination: InsertDestination): Promise<Destination>;
  updateDestination(
    id: string,
    destination: Partial<InsertDestination>,
  ): Promise<Destination | undefined>;
  deleteDestination(id: string): Promise<boolean>;

  // Staff Contacts
  getStaffContacts(): Promise<StaffContact[]>;
  getStaffContact(id: string): Promise<StaffContact | undefined>;
  createStaffContact(contact: InsertStaffContact): Promise<StaffContact>;
  updateStaffContact(
    id: string,
    contact: Partial<InsertStaffContact>,
  ): Promise<StaffContact | undefined>;
  deleteStaffContact(id: string): Promise<boolean>;

  // Visitors
  getVisitors(startDate?: Date, endDate?: Date): Promise<Visitor[]>;
  getVisitor(id: string): Promise<Visitor | undefined>;
  getActiveVisitors(): Promise<Visitor[]>;
  getVisitorByRfid(rfid: string): Promise<Visitor | undefined>;
  getVisitorByApprovalToken(token: string): Promise<Visitor | undefined>;
  createVisitor(visitor: InsertVisitor): Promise<Visitor>;
  updateVisitor(
    id: string,
    visitor: Partial<Visitor>,
  ): Promise<Visitor | undefined>;
  checkInVisitorByRfid(rfid: string): Promise<Visitor | undefined>;
  checkOutVisitorByRfid(rfid: string): Promise<Visitor | undefined>;

  // Employees
  getEmployees(): Promise<Employee[]>;
  getEmployee(id: string): Promise<Employee | undefined>;
  getEmployeeByRfid(rfid: string): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(
    id: string,
    employee: Partial<Employee>,
  ): Promise<Employee | undefined>;
  checkInEmployeeByRfid(rfid: string): Promise<Employee | undefined>;
  checkOutEmployeeByRfid(rfid: string): Promise<Employee | undefined>;
  deleteEmployee(id: string): Promise<boolean>;

  // Settings
  getSettings(): Promise<Setting[]>;
  getSetting(key: string): Promise<Setting | undefined>;
  upsertSetting(setting: InsertSetting): Promise<Setting>;

  // Guest Passes
  getGuestPasses(): Promise<GuestPass[]>;
  getGuestPass(id: string): Promise<GuestPass | undefined>;
  createGuestPass(pass: InsertGuestPass): Promise<GuestPass>;
  updateGuestPass(
    id: string,
    pass: Partial<GuestPass>,
  ): Promise<GuestPass | undefined>;
  deleteGuestPass(id: string): Promise<boolean>;
  generateGuestPasses(count: number): Promise<GuestPass[]>;

  // Scheduled Visits
  getScheduledVisits(
    startDate?: Date,
    endDate?: Date,
  ): Promise<ScheduledVisit[]>;
  getScheduledVisit(id: string): Promise<ScheduledVisit | undefined>;
  createScheduledVisit(visit: InsertScheduledVisit): Promise<ScheduledVisit>;
  updateScheduledVisit(
    id: string,
    visit: Partial<ScheduledVisit>,
  ): Promise<ScheduledVisit | undefined>;
  deleteScheduledVisit(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Destinations
  async getDestinations(): Promise<Destination[]> {
    return db.select().from(destinations).orderBy(destinations.name);
  }

  async getDestination(id: string): Promise<Destination | undefined> {
    const [destination] = await db
      .select()
      .from(destinations)
      .where(eq(destinations.id, id));
    return destination || undefined;
  }

  async createDestination(
    destination: InsertDestination,
  ): Promise<Destination> {
    const [created] = await db
      .insert(destinations)
      .values(destination)
      .returning();
    return created;
  }

  async updateDestination(
    id: string,
    destination: Partial<InsertDestination>,
  ): Promise<Destination | undefined> {
    const [updated] = await db
      .update(destinations)
      .set(destination)
      .where(eq(destinations.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteDestination(id: string): Promise<boolean> {
    const result = await db
      .delete(destinations)
      .where(eq(destinations.id, id))
      .returning();
    return result.length > 0;
  }

  // Staff Contacts
  async getStaffContacts(): Promise<StaffContact[]> {
    return db.select().from(staffContacts).orderBy(staffContacts.name);
  }

  async getStaffContact(id: string): Promise<StaffContact | undefined> {
    const [contact] = await db
      .select()
      .from(staffContacts)
      .where(eq(staffContacts.id, id));
    return contact || undefined;
  }

  async createStaffContact(contact: InsertStaffContact): Promise<StaffContact> {
    const [created] = await db
      .insert(staffContacts)
      .values(contact)
      .returning();
    return created;
  }

  async updateStaffContact(
    id: string,
    contact: Partial<InsertStaffContact>,
  ): Promise<StaffContact | undefined> {
    const [updated] = await db
      .update(staffContacts)
      .set(contact)
      .where(eq(staffContacts.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteStaffContact(id: string): Promise<boolean> {
    const result = await db
      .delete(staffContacts)
      .where(eq(staffContacts.id, id))
      .returning();
    return result.length > 0;
  }

  // Visitors
  async getVisitors(startDate?: Date, endDate?: Date): Promise<Visitor[]> {
    if (startDate && endDate) {
      return db
        .select()
        .from(visitors)
        .where(
          or(
            // Visitors with entry time within range
            and(
              isNotNull(visitors.entryTime),
              gte(visitors.entryTime, startDate),
              lte(visitors.entryTime, endDate),
            ),
            // Visitors with entry time before end date and exit time after start date (or no exit time)
            and(
              isNotNull(visitors.entryTime),
              lte(visitors.entryTime, endDate),
              or(isNull(visitors.exitTime), gte(visitors.exitTime, startDate)),
            ),
            // Include all registered visitors without entry time (active registrations)
            and(isNull(visitors.entryTime), eq(visitors.status, "registered")),
          ),
        )
        .orderBy(desc(visitors.entryTime));
    }

    // Return all visitors when no date range is specified, ordered by entry time (nulls last)
    return db.select().from(visitors).orderBy(desc(visitors.entryTime));
  }

  async getVisitor(id: string): Promise<Visitor | undefined> {
    const [visitor] = await db
      .select()
      .from(visitors)
      .where(eq(visitors.id, id));
    return visitor || undefined;
  }

  async getActiveVisitors(): Promise<Visitor[]> {
    return db
      .select()
      .from(visitors)
      .where(eq(visitors.status, "checked_in"))
      .orderBy(desc(visitors.entryTime));
  }

  async getVisitorByApprovalToken(token: string): Promise<Visitor | undefined> {
    const [visitor] = await db
      .select()
      .from(visitors)
      .where(eq(visitors.approvalToken, token));
    return visitor || undefined;
  }

  async getVisitorByRfid(rfid: string): Promise<Visitor | undefined> {
    const trimmedRfid = rfid.trim();
    // Only return visitors who haven't completed their visit (no exitTime)
    // This allows RFID reuse after check-out
    const [visitor] = await db
      .select()
      .from(visitors)
      .where(and(eq(visitors.rfid, trimmedRfid), isNull(visitors.exitTime)));
    return visitor || undefined;
  }

  async createVisitor(visitor: InsertVisitor): Promise<Visitor> {
    const [created] = await db.insert(visitors).values(visitor).returning();
    return created;
  }

  async updateVisitor(
    id: string,
    visitor: Partial<Visitor>,
  ): Promise<Visitor | undefined> {
    const [updated] = await db
      .update(visitors)
      .set(visitor)
      .where(eq(visitors.id, id))
      .returning();
    return updated || undefined;
  }

  async checkInVisitorByRfid(rfid: string): Promise<Visitor | undefined> {
    const [visitor] = await db
      .select()
      .from(visitors)
      .where(and(eq(visitors.rfid, rfid), isNull(visitors.entryTime)));

    if (!visitor) return undefined;

    const [updated] = await db
      .update(visitors)
      .set({ status: "checked_in", entryTime: new Date() })
      .where(eq(visitors.id, visitor.id))
      .returning();

    return updated || undefined;
  }

  async checkOutVisitorByRfid(rfid: string): Promise<Visitor | undefined> {
    const [visitor] = await db
      .select()
      .from(visitors)
      .where(
        and(
          eq(visitors.rfid, rfid),
          isNotNull(visitors.entryTime),
          isNull(visitors.exitTime),
        ),
      );

    if (!visitor) return undefined;

    const [updated] = await db
      .update(visitors)
      .set({ status: "checked_out", exitTime: new Date() })
      .where(eq(visitors.id, visitor.id))
      .returning();

    return updated || undefined;
  }

  // Settings
  async getSettings(): Promise<Setting[]> {
    return db.select().from(settings);
  }

  async getSetting(key: string): Promise<Setting | undefined> {
    const [setting] = await db
      .select()
      .from(settings)
      .where(eq(settings.key, key));
    return setting || undefined;
  }

  async upsertSetting(setting: InsertSetting): Promise<Setting> {
    const existing = await this.getSetting(setting.key);
    if (existing) {
      const [updated] = await db
        .update(settings)
        .set({ value: setting.value })
        .where(eq(settings.key, setting.key))
        .returning();
      return updated;
    }
    const [created] = await db.insert(settings).values(setting).returning();
    return created;
  }

  // Scheduled Visits
  async getScheduledVisits(
    startDate?: Date,
    endDate?: Date,
  ): Promise<ScheduledVisit[]> {
    if (startDate && endDate) {
      return db
        .select()
        .from(scheduledVisits)
        .where(
          and(
            gte(scheduledVisits.expectedDate, startDate),
            lte(scheduledVisits.expectedDate, endDate),
          ),
        )
        .orderBy(desc(scheduledVisits.expectedDate));
    }
    return db
      .select()
      .from(scheduledVisits)
      .orderBy(desc(scheduledVisits.expectedDate));
  }

  async getScheduledVisit(id: string): Promise<ScheduledVisit | undefined> {
    const [visit] = await db
      .select()
      .from(scheduledVisits)
      .where(eq(scheduledVisits.id, id));
    return visit || undefined;
  }

  async createScheduledVisit(
    visit: InsertScheduledVisit,
  ): Promise<ScheduledVisit> {
    const [created] = await db
      .insert(scheduledVisits)
      .values(visit)
      .returning();
    return created;
  }

  async updateScheduledVisit(
    id: string,
    visit: Partial<ScheduledVisit>,
  ): Promise<ScheduledVisit | undefined> {
    const [updated] = await db
      .update(scheduledVisits)
      .set(visit)
      .where(eq(scheduledVisits.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteScheduledVisit(id: string): Promise<boolean> {
    const result = await db
      .delete(scheduledVisits)
      .where(eq(scheduledVisits.id, id))
      .returning();
    return result.length > 0;
  }

  // Employees
  async getEmployees(): Promise<Employee[]> {
    return db.select().from(employees).orderBy(desc(employees.entryTime));
  }

  async getEmployee(id: string): Promise<Employee | undefined> {
    const [employee] = await db
      .select()
      .from(employees)
      .where(eq(employees.id, id));
    return employee || undefined;
  }

  async getEmployeeByRfid(rfid: string): Promise<Employee | undefined> {
    const trimmedRfid = rfid.trim();
    // Only return employees who haven't completed their visit (no exitTime)
    const [employee] = await db
      .select()
      .from(employees)
      .where(and(eq(employees.rfid, trimmedRfid), isNull(employees.exitTime)));
    return employee || undefined;
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const [created] = await db.insert(employees).values(employee).returning();
    return created;
  }

  async updateEmployee(
    id: string,
    employee: Partial<Employee>,
  ): Promise<Employee | undefined> {
    const [updated] = await db
      .update(employees)
      .set(employee)
      .where(eq(employees.id, id))
      .returning();
    return updated || undefined;
  }

  async checkInEmployeeByRfid(rfid: string): Promise<Employee | undefined> {
    const [employee] = await db
      .select()
      .from(employees)
      .where(and(eq(employees.rfid, rfid), isNull(employees.entryTime)));

    if (!employee) return undefined;

    const [updated] = await db
      .update(employees)
      .set({ status: "checked_in", entryTime: new Date() })
      .where(eq(employees.id, employee.id))
      .returning();

    return updated || undefined;
  }

  async checkOutEmployeeByRfid(rfid: string): Promise<Employee | undefined> {
    const [employee] = await db
      .select()
      .from(employees)
      .where(
        and(
          eq(employees.rfid, rfid),
          isNotNull(employees.entryTime),
          isNull(employees.exitTime),
        ),
      );

    if (!employee) return undefined;

    const [updated] = await db
      .update(employees)
      .set({ status: "checked_out", exitTime: new Date() })
      .where(eq(employees.id, employee.id))
      .returning();

    return updated || undefined;
  }

  async deleteEmployee(id: string): Promise<boolean> {
    const result = await db
      .delete(employees)
      .where(eq(employees.id, id))
      .returning();
    return result.length > 0;
  }

  // Guest Passes
  async getGuestPasses(): Promise<GuestPass[]> {
    return db.select().from(guestPasses).orderBy(desc(guestPasses.createdAt));
  }

  async getGuestPass(id: string): Promise<GuestPass | undefined> {
    const [pass] = await db
      .select()
      .from(guestPasses)
      .where(eq(guestPasses.id, id));
    return pass || undefined;
  }

  async createGuestPass(pass: InsertGuestPass): Promise<GuestPass> {
    const [created] = await db.insert(guestPasses).values(pass).returning();
    return created;
  }

  async updateGuestPass(
    id: string,
    pass: Partial<GuestPass>,
  ): Promise<GuestPass | undefined> {
    const [updated] = await db
      .update(guestPasses)
      .set(pass)
      .where(eq(guestPasses.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteGuestPass(id: string): Promise<boolean> {
    const result = await db
      .delete(guestPasses)
      .where(eq(guestPasses.id, id))
      .returning();
    return result.length > 0;
  }

  async generateGuestPasses(count: number): Promise<GuestPass[]> {
    const passes: InsertGuestPass[] = [];
    for (let i = 0; i < count; i++) {
      const passNumber = `V${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`;
      passes.push({
        passNumber,
        qrCode: passNumber,
        isAvailable: true,
      });
    }
    const created = await db.insert(guestPasses).values(passes).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
