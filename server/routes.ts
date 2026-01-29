import type { Express } from "express";
import { createServer, type Server } from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { storage } from "./storage";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import {
  insertDestinationSchema,
  insertStaffContactSchema,
  insertVisitorSchema,
  insertEmployeeSchema,
  insertGuestPassSchema,
  insertSettingSchema,
  insertScheduledVisitSchema,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { z } from "zod";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const notificationSchema = z.object({
  contactId: z.string().min(1, "Contact ID is required"),
  visitorId: z.string().optional(),
  visitorName: z.string().optional(),
  destination: z.string().optional(),
  purpose: z.string().optional(),
});

const approvalSchema = z.object({
  token: z.string().min(1, "Token is required"),
  response: z.enum(["approved", "denied"]),
});

const updateScheduledVisitSchema = z.object({
  status: z.enum(["pending", "confirmed", "cancelled", "arrived"]).optional(),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  const objectStorageService = new ObjectStorageService();

  // ============ DESTINATIONS ============
  app.get("/api/destinations", async (req, res) => {
    try {
      const destinations = await storage.getDestinations();
      res.json(destinations);
    } catch (error) {
      console.error("Error fetching destinations:", error);
      res.status(500).json({ error: "Failed to fetch destinations" });
    }
  });

  app.get("/api/destinations/:id", async (req, res) => {
    try {
      const destination = await storage.getDestination(req.params.id);
      if (!destination) {
        return res.status(404).json({ error: "Destination not found" });
      }
      res.json(destination);
    } catch (error) {
      console.error("Error fetching destination:", error);
      res.status(500).json({ error: "Failed to fetch destination" });
    }
  });

  app.post("/api/destinations", async (req, res) => {
    try {
      const parsed = insertDestinationSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.message });
      }
      const destination = await storage.createDestination(parsed.data);
      res.status(201).json(destination);
    } catch (error) {
      console.error("Error creating destination:", error);
      res.status(500).json({ error: "Failed to create destination" });
    }
  });

  app.patch("/api/destinations/:id", async (req, res) => {
    try {
      const destination = await storage.updateDestination(
        req.params.id,
        req.body,
      );
      if (!destination) {
        return res.status(404).json({ error: "Destination not found" });
      }
      res.json(destination);
    } catch (error) {
      console.error("Error updating destination:", error);
      res.status(500).json({ error: "Failed to update destination" });
    }
  });

  app.delete("/api/destinations/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteDestination(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Destination not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting destination:", error);
      res.status(500).json({ error: "Failed to delete destination" });
    }
  });

  // ============ STAFF CONTACTS ============
  app.get("/api/staff-contacts", async (req, res) => {
    try {
      const contacts = await storage.getStaffContacts();
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching staff contacts:", error);
      res.status(500).json({ error: "Failed to fetch staff contacts" });
    }
  });

  app.get("/api/staff-contacts/:id", async (req, res) => {
    try {
      const contact = await storage.getStaffContact(req.params.id);
      if (!contact) {
        return res.status(404).json({ error: "Staff contact not found" });
      }
      res.json(contact);
    } catch (error) {
      console.error("Error fetching staff contact:", error);
      res.status(500).json({ error: "Failed to fetch staff contact" });
    }
  });

  app.post("/api/staff-contacts", async (req, res) => {
    try {
      const parsed = insertStaffContactSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.message });
      }
      const contact = await storage.createStaffContact(parsed.data);
      res.status(201).json(contact);
    } catch (error) {
      console.error("Error creating staff contact:", error);
      res.status(500).json({ error: "Failed to create staff contact" });
    }
  });

  app.patch("/api/staff-contacts/:id", async (req, res) => {
    try {
      const contact = await storage.updateStaffContact(req.params.id, req.body);
      if (!contact) {
        return res.status(404).json({ error: "Staff contact not found" });
      }
      res.json(contact);
    } catch (error) {
      console.error("Error updating staff contact:", error);
      res.status(500).json({ error: "Failed to update staff contact" });
    }
  });

  app.delete("/api/staff-contacts/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteStaffContact(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Staff contact not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting staff contact:", error);
      res.status(500).json({ error: "Failed to delete staff contact" });
    }
  });

  // ============ VISITORS ============
  app.get("/api/visitors", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;
      const visitors = await storage.getVisitors(start, end);
      res.json(visitors);
    } catch (error) {
      console.error("Error fetching visitors:", error);
      res.status(500).json({ error: "Failed to fetch visitors" });
    }
  });

  app.get("/api/visitors/active", async (req, res) => {
    try {
      const visitors = await storage.getActiveVisitors();
      res.json(visitors);
    } catch (error) {
      console.error("Error fetching active visitors:", error);
      res.status(500).json({ error: "Failed to fetch active visitors" });
    }
  });

  app.get("/api/employees/active", async (req, res) => {
    try {
      const employees = await storage.getActiveEmployees();
      res.json(employees);
    } catch (error) {
      console.error("Error fetching active employees:", error);
      res.status(500).json({ error: "Failed to fetch active employees" });
    }
  });

  app.get("/api/visitors/:id", async (req, res) => {
    try {
      const visitor = await storage.getVisitor(req.params.id);
      if (!visitor) {
        return res.status(404).json({ error: "Visitor not found" });
      }
      res.json(visitor);
    } catch (error) {
      console.error("Error fetching visitor:", error);
      res.status(500).json({ error: "Failed to fetch visitor" });
    }
  });

  app.get("/api/visitors/rfid/:rfid", async (req, res) => {
    try {
      const visitor = await storage.getVisitorByRfid(req.params.rfid);
      if (!visitor) {
        return res
          .status(404)
          .json({ error: "Visitor not found with this RFID" });
      }
      res.json(visitor);
    } catch (error) {
      console.error("Error fetching visitor by RFID:", error);
      res.status(500).json({ error: "Failed to fetch visitor" });
    }
  });

  app.post("/api/visitors", async (req, res) => {
    try {
      console.log("Registration request received");
      console.log("Request body keys:", Object.keys(req.body));
      console.log(
        "idScanImage present:",
        !!req.body.idScanImage,
        "length:",
        req.body.idScanImage?.length,
      );
      console.log(
        "photoImage present:",
        !!req.body.photoImage,
        "length:",
        req.body.photoImage?.length,
      );

      const parsed = insertVisitorSchema.safeParse(req.body);
      if (!parsed.success) {
        console.log("Schema validation failed:", parsed.error);
        return res.status(400).json({ error: parsed.error.message });
      }

      console.log("Schema validation passed");

      // Check if RFID is already in use by an active visitor or employee (no exitTime)
      if (parsed.data.rfid) {
        const existingVisitor = await storage.getVisitorByRfid(
          parsed.data.rfid,
        );
        const existingEmployee = await storage.getEmployeeByRfid(
          parsed.data.rfid,
        );
        if (existingVisitor) {
          return res.status(400).json({
            error:
              "This RFID card is already assigned to an active visitor. Please use a different RFID card or wait for the current visitor to check out.",
          });
        }
        if (existingEmployee) {
          return res.status(400).json({
            error:
              "This RFID card is already assigned to an active employee. Please use a different RFID card or wait for the current employee to check out.",
          });
        }
      }

      // Parse destinations - client sends JSON string, we store as JSON string
      let destinations: string = parsed.data.destinations || "[]";
      if (typeof destinations === "string") {
        try {
          // Validate that it's valid JSON by parsing and re-stringifying
          const parsedDest = JSON.parse(destinations);
          destinations = JSON.stringify(parsedDest);
        } catch (e) {
          // If parsing fails, default to empty array
          destinations = "[]";
        }
      }

      // Handle ID scan image saving
      let idScanImage = parsed.data.idScanImage;
      console.log(
        "Processing ID scan image:",
        idScanImage ? "present" : "empty",
      );
      if (idScanImage && idScanImage.startsWith("data:image/")) {
        try {
          // Save to uploads folder
          const uploadsDir = path.join(__dirname, "uploads");
          await fs.promises.mkdir(uploadsDir, { recursive: true });

          const base64Data = idScanImage.split(",")[1];
          if (!base64Data) {
            throw new Error("Invalid base64 data for ID scan");
          }
          const buffer = Buffer.from(base64Data, "base64");
          const sanitizedName = parsed.data.name.replace(/[^a-zA-Z0-9]/g, "_");
          const timestamp = Date.now();
          const fileName = `${sanitizedName}_id_${timestamp}.jpg`;
          const filePath = path.join(uploadsDir, fileName);
          await fs.promises.writeFile(filePath, buffer);
          idScanImage = `/uploads/${fileName}`;
          console.log("ID scan image saved:", filePath);
        } catch (error) {
          console.error("Error saving ID scan image:", error);
          // Continue without saving the image
          idScanImage = "";
        }
      } else if (idScanImage) {
        // If it's not a data URL but contains data, don't store it
        console.log("ID scan image is not a data URL, clearing it");
        idScanImage = "";
      }

      // Handle photo saving
      let photoImage = parsed.data.photoImage;
      console.log("Processing photo image:", photoImage ? "present" : "empty");
      if (photoImage && photoImage.startsWith("data:image/")) {
        try {
          // Save to uploads folder
          const uploadsDir = path.join(__dirname, "uploads");
          await fs.promises.mkdir(uploadsDir, { recursive: true });

          const base64Data = photoImage.split(",")[1];
          if (!base64Data) {
            throw new Error("Invalid base64 data for photo");
          }
          const buffer = Buffer.from(base64Data, "base64");
          const sanitizedName = parsed.data.name.replace(/[^a-zA-Z0-9]/g, "_");
          const timestamp = Date.now();
          const fileName = `${sanitizedName}_photo_${timestamp}.jpg`;
          const filePath = path.join(uploadsDir, fileName);
          await fs.promises.writeFile(filePath, buffer);
          photoImage = `/uploads/${fileName}`;
          console.log("Photo image saved:", filePath);
        } catch (error) {
          console.error("Error saving photo image:", error);
          // Continue without saving the image
          photoImage = "";
        }
      } else if (photoImage) {
        // If it's not a data URL but contains data, don't store it
        photoImage = "";
      }

      // Skip guest pass logic - using RFID as pass system
      let guestPassId = null;
      let passNumber = null;

      // Get destination name if destinationId provided (for backward compatibility)
      let destinationName = parsed.data.destinationName;
      if (parsed.data.destinationId && !destinationName) {
        const destination = await storage.getDestination(
          parsed.data.destinationId,
        );
        if (destination) {
          destinationName = destination.name;
        }
      }

      console.log("Creating visitor with data:", {
        ...parsed.data,
        destinations: JSON.stringify(destinations),
        photoImage: photoImage ? "present" : "empty",
        guestPassId,
        passNumber,
        destinationName,
      });

      console.log("About to create visitor with:");
      console.log("idScanImage:", idScanImage ? "set" : "empty");
      console.log("photoImage:", photoImage ? "set" : "empty");

      const visitor = await storage.createVisitor({
        ...parsed.data,
        destinations: JSON.stringify(destinations),
        idScanImage,
        photoImage,
        destinationName,
        status: "registered",
        entryTime: null,
      });

      console.log("Visitor created successfully with ID:", visitor.id);
      console.log("Final visitor data:", {
        idScanImage: visitor.idScanImage ? "present" : "empty",
        photoImage: visitor.photoImage ? "present" : "empty",
      });

      res.status(201).json(visitor);
    } catch (error) {
      console.error("Error creating visitor:", error);
      res.status(500).json({ error: "Failed to create visitor" });
    }
  });
  // ============ VISITOR CHECK-IN/CHECK-OUT & KIOSK ============

  app.post("/api/visitors/check-in", async (req, res) => {
    try {
      const parsed = z.object({ rfid: z.string().min(1) }).safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.message });
      }

      const { rfid } = parsed.data;

      // Check in by RFID only
      const visitor = await storage.checkInVisitorByRfid(rfid);

      if (!visitor) {
        return res
          .status(404)
          .json({ error: "No registered visitor found with this RFID" });
      }

      res.json(visitor);
    } catch (error) {
      console.error("Error checking in visitor:", error);
      res.status(500).json({ error: "Failed to check in visitor" });
    }
  });

  app.post("/api/visitors/check-out", async (req, res) => {
    try {
      const parsed = z.object({ rfid: z.string().min(1) }).safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.message });
      }

      const { rfid } = parsed.data;

      // Check out by RFID only
      const visitor = await storage.checkOutVisitorByRfid(rfid);

      if (!visitor) {
        return res
          .status(404)
          .json({ error: "No checked-in visitor found with this RFID" });
      }

      res.json(visitor);
    } catch (error) {
      console.error("Error checking out visitor:", error);
      res.status(500).json({ error: "Failed to check out visitor" });
    }
  });

  app.post("/api/visitors/kiosk", async (req, res) => {
    try {
      const parsed = z.object({ rfid: z.string().min(1) }).safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.message });
      }

      const { rfid } = parsed.data;

      // First try employees - process attendance (time in/out toggle)
      const employeeResult = await storage.processEmployeeAttendance(rfid);
      if (employeeResult) {
        // Return employee with attendance info for display
        const employeeWithAttendance = {
          ...employeeResult.employee,
          entryTime: employeeResult.log.timeIn,
          exitTime: employeeResult.log.timeOut,
          isCheckIn: !employeeResult.log.timeOut, // true if time in, false if time out
        } as any;
        return res.json(employeeWithAttendance);
      }

      // Then try visitors
      let updatedVisitor = await storage.checkInVisitorByRfid(rfid);
      if (!updatedVisitor) {
        updatedVisitor = await storage.checkOutVisitorByRfid(rfid);
      }

      // If both failed, no active person with this RFID
      if (!updatedVisitor) {
        return res
          .status(404)
          .json({ error: "No person recorded with this RFID" });
      }

      res.json(updatedVisitor);
    } catch (error) {
      console.error("Error processing kiosk request:", error);
      res.status(500).json({ error: "Failed to process kiosk request" });
    }
  });

  app.delete("/api/visitors/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteVisitor(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Visitor not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting visitor:", error);
      res.status(500).json({ error: "Failed to delete visitor" });
    }
  });

  // ============ SETTINGS ============
  app.get("/api/settings", async (req, res) => {
    try {
      const allSettings = await storage.getSettings();
      res.json(allSettings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.get("/api/settings/:key", async (req, res) => {
    try {
      const setting = await storage.getSetting(req.params.key);
      if (!setting) {
        return res.status(404).json({ error: "Setting not found" });
      }
      res.json(setting);
    } catch (error) {
      console.error("Error fetching setting:", error);
      res.status(500).json({ error: "Failed to fetch setting" });
    }
  });

  app.post("/api/settings", async (req, res) => {
    try {
      const parsed = insertSettingSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.message });
      }
      const setting = await storage.upsertSetting(parsed.data);
      res.status(201).json(setting);
    } catch (error) {
      console.error("Error saving setting:", error);
      res.status(500).json({ error: "Failed to save setting" });
    }
  });

  // ============ NOTIFICATIONS ============
  app.post("/api/notifications/send", async (req, res) => {
    try {
      const parsed = notificationSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.message });
      }

      const { contactId, visitorId, visitorName, destination, purpose } =
        parsed.data;

      const contact = await storage.getStaffContact(contactId);
      if (!contact) {
        return res.status(404).json({ error: "Contact not found" });
      }

      let approvalToken = null;
      let approvalLink = "";

      if (visitorId) {
        approvalToken = randomUUID();
        await storage.updateVisitor(visitorId, {
          approvalToken,
          approvalStatus: "pending",
        });
        const baseUrl = process.env.REPLIT_DEV_DOMAIN
          ? `https://${process.env.REPLIT_DEV_DOMAIN}`
          : "http://localhost:5000";
        approvalLink = `${baseUrl}/approve/${approvalToken}`;
      }

      const message = approvalLink
        ? `Visitor ${visitorName} has arrived at ${destination} for ${purpose}. Allow Visitor? Reply at: ${approvalLink}`
        : `Visitor ${visitorName} has arrived at ${destination} for ${purpose}. Please come to the reception desk.`;

      console.log(
        `SMS Notification to ${contact.name} (${contact.mobileNumber}): ${message}`,
      );

      res.json({
        success: true,
        message: `Notification sent to ${contact.name}`,
        recipient: contact.mobileNumber,
        approvalLink: approvalLink || undefined,
      });
    } catch (error) {
      console.error("Error sending notification:", error);
      res.status(500).json({ error: "Failed to send notification" });
    }
  });

  // ============ VISITOR APPROVAL ============
  app.get("/api/visitors/approval/:token", async (req, res) => {
    try {
      const visitor = await storage.getVisitorByApprovalToken(req.params.token);
      if (!visitor) {
        return res
          .status(404)
          .json({ error: "Visitor not found or link expired" });
      }
      res.json({
        id: visitor.id,
        name: visitor.name,
        destinationName: visitor.destinationName,
        personToVisit: visitor.personToVisit,
        purpose: visitor.purpose,
        approvalStatus: visitor.approvalStatus,
      });
    } catch (error) {
      console.error("Error fetching visitor for approval:", error);
      res.status(500).json({ error: "Failed to fetch visitor" });
    }
  });

  app.post("/api/visitors/approval", async (req, res) => {
    try {
      const parsed = approvalSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.message });
      }

      const { token, response } = parsed.data;

      const visitor = await storage.getVisitorByApprovalToken(token);
      if (!visitor) {
        return res
          .status(404)
          .json({ error: "Visitor not found or link expired" });
      }

      if (visitor.approvalStatus !== "pending") {
        return res.status(400).json({ error: "Response already submitted" });
      }

      const updated = await storage.updateVisitor(visitor.id, {
        approvalStatus: response,
        approvalToken: null,
      });

      res.json({
        success: true,
        message:
          response === "approved" ? "Visitor approved" : "Visitor denied",
        approvalStatus: response,
      });
    } catch (error) {
      console.error("Error processing approval:", error);
      res.status(500).json({ error: "Failed to process approval" });
    }
  });

  // ============ OBJECT STORAGE ============
  app.get("/objects/:objectPath(*)", async (req, res) => {
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(
        req.path,
      );
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.post("/api/objects/upload", async (req, res) => {
    try {
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  app.put("/api/objects/finalize", async (req, res) => {
    try {
      const { uploadURL } = req.body;
      if (!uploadURL) {
        return res.status(400).json({ error: "uploadURL is required" });
      }

      const objectPath =
        objectStorageService.normalizeObjectEntityPath(uploadURL);
      res.json({ objectPath });
    } catch (error) {
      console.error("Error finalizing upload:", error);
      res.status(500).json({ error: "Failed to finalize upload" });
    }
  });

  app.get("/public-objects/:filePath(*)", async (req, res) => {
    try {
      const filePath = req.params.filePath;
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error serving public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // ============ SCHEDULED VISITS ============
  app.get("/api/scheduled-visits", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;
      const visits = await storage.getScheduledVisits(start, end);
      res.json(visits);
    } catch (error) {
      console.error("Error fetching scheduled visits:", error);
      res.status(500).json({ error: "Failed to fetch scheduled visits" });
    }
  });

  app.get("/api/scheduled-visits/:id", async (req, res) => {
    try {
      const visit = await storage.getScheduledVisit(req.params.id);
      if (!visit) {
        return res.status(404).json({ error: "Scheduled visit not found" });
      }
      res.json(visit);
    } catch (error) {
      console.error("Error fetching scheduled visit:", error);
      res.status(500).json({ error: "Failed to fetch scheduled visit" });
    }
  });

  app.post("/api/scheduled-visits", async (req, res) => {
    try {
      const bodyWithDate = {
        ...req.body,
        expectedDate: req.body.expectedDate
          ? new Date(req.body.expectedDate)
          : undefined,
      };
      const parsed = insertScheduledVisitSchema.safeParse(bodyWithDate);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.message });
      }

      let destinationName = parsed.data.destinationName;
      if (parsed.data.destinationId && !destinationName) {
        const destination = await storage.getDestination(
          parsed.data.destinationId,
        );
        if (destination) {
          destinationName = destination.name;
        }
      }

      const visit = await storage.createScheduledVisit({
        ...parsed.data,
        destinationName,
      });
      res.status(201).json(visit);
    } catch (error) {
      console.error("Error creating scheduled visit:", error);
      res.status(500).json({ error: "Failed to create scheduled visit" });
    }
  });

  app.patch("/api/scheduled-visits/:id", async (req, res) => {
    try {
      const parsed = updateScheduledVisitSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.message });
      }
      const visit = await storage.updateScheduledVisit(
        req.params.id,
        parsed.data,
      );
      if (!visit) {
        return res.status(404).json({ error: "Scheduled visit not found" });
      }
      res.json(visit);
    } catch (error) {
      console.error("Error updating scheduled visit:", error);
      res.status(500).json({ error: "Failed to update scheduled visit" });
    }
  });

  app.delete("/api/scheduled-visits/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteScheduledVisit(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Scheduled visit not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting scheduled visit:", error);
      res.status(500).json({ error: "Failed to delete scheduled visit" });
    }
  });

  // ============ EMPLOYEES ============
  app.get("/api/employees", async (req, res) => {
    try {
      const employees = await storage.getEmployees();
      res.json(employees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ error: "Failed to fetch employees" });
    }
  });

  app.get("/api/employees/:id", async (req, res) => {
    try {
      const employee = await storage.getEmployee(req.params.id);
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      console.error("Error fetching employee:", error);
      res.status(500).json({ error: "Failed to fetch employee" });
    }
  });

  app.get("/api/employees/rfid/:rfid", async (req, res) => {
    try {
      const employee = await storage.getEmployeeByRfid(req.params.rfid);
      if (!employee) {
        return res
          .status(404)
          .json({ error: "Employee not found with this RFID" });
      }
      res.json(employee);
    } catch (error) {
      console.error("Error fetching employee by RFID:", error);
      res.status(500).json({ error: "Failed to fetch employee" });
    }
  });

  app.post("/api/employees", async (req, res) => {
    try {
      console.log("Employee registration request received");
      console.log("Request body keys:", Object.keys(req.body));

      const parsed = insertEmployeeSchema.safeParse(req.body);
      if (!parsed.success) {
        console.log("Schema validation failed:", parsed.error);
        return res.status(400).json({ error: parsed.error.message });
      }

      console.log("Schema validation passed");

      // Check if RFID is already in use by an active employee (no exitTime)
      if (parsed.data.rfid) {
        const existingEmployee = await storage.getEmployeeByRfid(
          parsed.data.rfid,
        );
        if (existingEmployee) {
          return res.status(400).json({
            error:
              "This RFID card is already assigned to an active employee. Please use a different RFID card.",
          });
        }
      }

      // Handle ID scan image saving
      let idScanImage = parsed.data.idScanImage;
      console.log(
        "Processing ID scan image:",
        idScanImage ? "present" : "empty",
      );
      if (idScanImage && idScanImage.startsWith("data:image/")) {
        try {
          // Save to uploads folder
          const uploadsDir = path.join(__dirname, "uploads");
          await fs.promises.mkdir(uploadsDir, { recursive: true });

          const base64Data = idScanImage.split(",")[1];
          if (!base64Data) {
            throw new Error("Invalid base64 data for ID scan");
          }
          const buffer = Buffer.from(base64Data, "base64");
          const sanitizedName = parsed.data.name.replace(/[^a-zA-Z0-9]/g, "_");
          const timestamp = Date.now();
          const fileName = `${sanitizedName}_id_${timestamp}.jpg`;
          const filePath = path.join(uploadsDir, fileName);
          await fs.promises.writeFile(filePath, buffer);
          idScanImage = `/uploads/${fileName}`;
          console.log("ID scan image saved:", filePath);
        } catch (error) {
          console.error("Error saving ID scan image:", error);
          // Continue without saving the image
          idScanImage = "";
        }
      } else if (idScanImage) {
        // If it's not a data URL but contains data, don't store it
        console.log("ID scan image is not a data URL, clearing it");
        idScanImage = "";
      }

      // Handle photo saving
      let photoImage = parsed.data.photoImage;
      console.log("Processing photo image:", photoImage ? "present" : "empty");
      if (photoImage && photoImage.startsWith("data:image/")) {
        try {
          // Save to uploads folder
          const uploadsDir = path.join(__dirname, "uploads");
          await fs.promises.mkdir(uploadsDir, { recursive: true });

          const base64Data = photoImage.split(",")[1];
          if (!base64Data) {
            throw new Error("Invalid base64 data for photo");
          }
          const buffer = Buffer.from(base64Data, "base64");
          const sanitizedName = parsed.data.name.replace(/[^a-zA-Z0-9]/g, "_");
          const timestamp = Date.now();
          const fileName = `${sanitizedName}_photo_${timestamp}.jpg`;
          const filePath = path.join(uploadsDir, fileName);
          await fs.promises.writeFile(filePath, buffer);
          photoImage = `/uploads/${fileName}`;
          console.log("Photo image saved:", filePath);
        } catch (error) {
          console.error("Error saving photo image:", error);
          // Continue without saving the image
          photoImage = "";
        }
      } else if (photoImage) {
        // If it's not a data URL but contains data, don't store it
        photoImage = "";
      }

      console.log("Creating employee with data:", {
        ...parsed.data,
        photoImage: photoImage ? "present" : "empty",
      });

      console.log("About to create employee with:");
      console.log("idScanImage:", idScanImage ? "set" : "empty");
      console.log("photoImage:", photoImage ? "set" : "empty");

      const employee = await storage.createEmployee({
        ...parsed.data,
        idScanImage,
        photoImage,
      });

      console.log("Employee created successfully with ID:", employee.id);
      console.log("Final employee data:", {
        idScanImage: employee.idScanImage ? "present" : "empty",
        photoImage: employee.photoImage ? "present" : "empty",
      });

      res.status(201).json(employee);
    } catch (error) {
      console.error("Error creating employee:", error);
      res.status(500).json({ error: "Failed to create employee" });
    }
  });

  app.patch("/api/employees/:id", async (req, res) => {
    try {
      const employee = await storage.updateEmployee(req.params.id, req.body);
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      console.error("Error updating employee:", error);
      res.status(500).json({ error: "Failed to update employee" });
    }
  });

  app.delete("/api/employees/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteEmployee(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Employee not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting employee:", error);
      res.status(500).json({ error: "Failed to delete employee" });
    }
  });

  app.get("/api/employees/:id/attendance", async (req, res) => {
    try {
      const attendanceLogs = await storage.getAttendanceLogs(req.params.id);
      res.json(attendanceLogs);
    } catch (error) {
      console.error("Error fetching employee attendance:", error);
      res.status(500).json({ error: "Failed to fetch employee attendance" });
    }
  });

  // ============ GUEST PASSES ============
  app.get("/api/guest-passes", async (req, res) => {
    try {
      const passes = await storage.getGuestPasses();
      res.json(passes);
    } catch (error) {
      console.error("Error fetching guest passes:", error);
      res.status(500).json({ error: "Failed to fetch guest passes" });
    }
  });

  app.get("/api/guest-passes/:id", async (req, res) => {
    try {
      const pass = await storage.getGuestPass(req.params.id);
      if (!pass) {
        return res.status(404).json({ error: "Guest pass not found" });
      }
      res.json(pass);
    } catch (error) {
      console.error("Error fetching guest pass:", error);
      res.status(500).json({ error: "Failed to fetch guest pass" });
    }
  });

  app.post("/api/guest-passes", async (req, res) => {
    try {
      const parsed = insertGuestPassSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.message });
      }
      const pass = await storage.createGuestPass(parsed.data);
      res.status(201).json(pass);
    } catch (error) {
      console.error("Error creating guest pass:", error);
      res.status(500).json({ error: "Failed to create guest pass" });
    }
  });

  app.post("/api/guest-passes/generate", async (req, res) => {
    try {
      const { count } = req.body;
      if (!count || typeof count !== "number" || count < 1 || count > 100) {
        return res
          .status(400)
          .json({ error: "Count must be a number between 1 and 100" });
      }
      const passes = await storage.generateGuestPasses(count);
      res.status(201).json({ passes, count });
    } catch (error) {
      console.error("Error generating guest passes:", error);
      res.status(500).json({ error: "Failed to generate guest passes" });
    }
  });

  app.patch("/api/guest-passes/:id", async (req, res) => {
    try {
      const pass = await storage.updateGuestPass(req.params.id, req.body);
      if (!pass) {
        return res.status(404).json({ error: "Guest pass not found" });
      }
      res.json(pass);
    } catch (error) {
      console.error("Error updating guest pass:", error);
      res.status(500).json({ error: "Failed to update guest pass" });
    }
  });

  app.delete("/api/guest-passes/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteGuestPass(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Guest pass not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting guest pass:", error);
      res.status(500).json({ error: "Failed to delete guest pass" });
    }
  });

  return httpServer;
}
