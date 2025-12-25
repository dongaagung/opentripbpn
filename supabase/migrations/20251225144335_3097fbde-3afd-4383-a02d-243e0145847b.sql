-- Add database-level CHECK constraints for contact_messages security
ALTER TABLE public.contact_messages 
ADD CONSTRAINT check_name_length CHECK (char_length(name) <= 100),
ADD CONSTRAINT check_email_length CHECK (char_length(email) <= 255),
ADD CONSTRAINT check_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
ADD CONSTRAINT check_phone_length CHECK (phone IS NULL OR char_length(phone) <= 20),
ADD CONSTRAINT check_message_length CHECK (char_length(message) <= 1000);