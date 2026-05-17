-- Table for Shift Definitions
CREATE TABLE XX_Shift (
    XX_Shift_ID numeric(10,0) NOT NULL,
    AD_Client_ID numeric(10,0) NOT NULL,
    AD_Org_ID numeric(10,0) NOT NULL,
    IsActive char(1) DEFAULT 'Y'::bpchar NOT NULL,
    Created timestamp with time zone DEFAULT now() NOT NULL,
    CreatedBy numeric(10,0) NOT NULL,
    Updated timestamp with time zone DEFAULT now() NOT NULL,
    UpdatedBy numeric(10,0) NOT NULL,

    Name varchar(60) NOT NULL,
    StartTime time NOT NULL, -- e.g., '08:00:00'
    EndTime time NOT NULL,   -- e.g., '17:00:00'
    GracePeriodMinutes numeric(3,0) DEFAULT 0,

    CONSTRAINT XX_Shift_Key PRIMARY KEY (XX_Shift_ID)
);

-- Mapping Shift to Employee
-- Note: You can also just add XX_Shift_ID column to C_BPartner
ALTER TABLE C_BPartner ADD COLUMN XX_Shift_ID numeric(10,0);
ALTER TABLE C_BPartner ADD CONSTRAINT FK_C_BPartner_XX_Shift FOREIGN KEY (XX_Shift_ID) REFERENCES XX_Shift(XX_Shift_ID);
