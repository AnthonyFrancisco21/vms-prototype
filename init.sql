-- Guest-Flow-Control Database Schema
-- Run this SQL in your PostgreSQL database to create all necessary tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for admin authentication
CREATE TABLE users (
  id VARCHAR PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'staff'
);

-- Destinations table (offices/departments)
CREATE TABLE destinations (
  id VARCHAR PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  floor TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Staff contacts for notifications
CREATE TABLE staff_contacts (
  id VARCHAR PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  department TEXT,
  mobile_number TEXT NOT NULL,
  email TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Guest passes - pre-made cards with visitor numbers and QR codes
CREATE TABLE guest_passes (
  id VARCHAR PRIMARY KEY DEFAULT uuid_generate_v4(),
  pass_number TEXT NOT NULL UNIQUE,
  qr_code TEXT NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true
);

-- Visitors log - main table for tracking visitors
CREATE TABLE visitors (
  id VARCHAR PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  destination_id VARCHAR REFERENCES destinations(id),
  destination_name TEXT,
  person_to_visit TEXT NOT NULL,
  purpose TEXT NOT NULL,
  id_scan_image TEXT,
  id_ocr_text TEXT,
  photo_image TEXT,
  guest_pass_id VARCHAR REFERENCES guest_passes(id),
  pass_number TEXT,
  entry_time TIMESTAMP NOT NULL DEFAULT NOW(),
  exit_time TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'checked_in',
  approval_status TEXT DEFAULT 'pending',
  approval_token TEXT
);

-- Scheduled visits (pre-registration)
CREATE TABLE scheduled_visits (
  id VARCHAR PRIMARY KEY DEFAULT uuid_generate_v4(),
  visitor_name TEXT NOT NULL,
  visitor_email TEXT,
  visitor_phone TEXT,
  destination_id VARCHAR REFERENCES destinations(id),
  destination_name TEXT,
  host_name TEXT NOT NULL,
  purpose TEXT NOT NULL,
  expected_date TIMESTAMP NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Building settings
CREATE TABLE settings (
  id VARCHAR PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_visitors_destination_id ON visitors(destination_id);
CREATE INDEX idx_visitors_guest_pass_id ON visitors(guest_pass_id);
CREATE INDEX idx_visitors_entry_time ON visitors(entry_time);
CREATE INDEX idx_visitors_status ON visitors(status);
CREATE INDEX idx_scheduled_visits_destination_id ON scheduled_visits(destination_id);
CREATE INDEX idx_scheduled_visits_expected_date ON scheduled_visits(expected_date);

-- Insert some default data (optional)
-- Default admin user (password: admin123 - you should change this)
INSERT INTO users (username, password, role) VALUES
('admin', '$2b$10$rOz8vZxZxZxZxZxZxZxZxOeJ8vZxZxZxZxZxZxZxZxZxZxZxZxZx', 'admin');

-- Default destinations
INSERT INTO destinations (name, floor, description) VALUES
('Main Reception', 'Ground', 'Main building entrance'),
('IT Department', '2nd', 'Information Technology'),
('HR Department', '3rd', 'Human Resources');

-- Default guest passes (you can generate more)
INSERT INTO guest_passes (pass_number, qr_code) VALUES
('PASS001', 'QR001'),
('PASS002', 'QR002'),
('PASS003', 'QR003'),
('PASS004', 'QR004'),
('PASS005', 'QR005');

-- Default settings
INSERT INTO settings (key, value) VALUES
('building_name', 'Our Office Building'),
('notification_enabled', 'true'),
('max_visitors_per_day', '100');