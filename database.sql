
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Contacts Table
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(20) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    old_address TEXT NOT NULL,
    new_address TEXT,
    status VARCHAR(50) DEFAULT 'Pending',
    conversation JSONB DEFAULT '[]',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Settings Table
CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    webhook_url TEXT,
    gemini_api_key TEXT,
    inbound_api_key TEXT UNIQUE,
    initial_message_template TEXT,
    auto_delete_done BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Initial Seed (Only if empty)
INSERT INTO settings (inbound_api_key, initial_message_template)
SELECT 'GOFOR360-INIT-KEY-DEFAULT', 'Hello! We''re preparing to ship your order for "{productName}". We noticed the delivery address provided ("{oldAddress}") seems incorrect. Could you please provide the correct address?'
WHERE NOT EXISTS (SELECT 1 FROM settings);
