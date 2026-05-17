-- Table for Attendance Logs
CREATE TABLE XX_Attendance (
    XX_Attendance_ID numeric(10,0) NOT NULL,
    AD_Client_ID numeric(10,0) NOT NULL,
    AD_Org_ID numeric(10,0) NOT NULL,
    IsActive char(1) DEFAULT 'Y'::bpchar NOT NULL,
    Created timestamp with time zone DEFAULT now() NOT NULL,
    CreatedBy numeric(10,0) NOT NULL,
    Updated timestamp with time zone DEFAULT now() NOT NULL,
    UpdatedBy numeric(10,0) NOT NULL,
    
    C_BPartner_ID numeric(10,0) NOT NULL, -- Relation to C_BPartner (Employee)
    AttendanceType varchar(3) NOT NULL, -- 'IN' or 'OUT'
    CheckTime timestamp with time zone NOT NULL,
    Latitude numeric(20,16),
    Longitude numeric(20,16),
    Status varchar(20), -- e.g., 'Verified', 'Late', 'Manual'
    Description varchar(255),

    CONSTRAINT XX_Attendance_Key PRIMARY KEY (XX_Attendance_ID),
    CONSTRAINT XX_Attendance_BPartner FOREIGN KEY (C_BPartner_ID) REFERENCES C_BPartner(C_BPartner_ID)
);

-- Sequence for iDempiere (if not using UUID)
-- CREATE SEQUENCE XX_Attendance_Seq;
