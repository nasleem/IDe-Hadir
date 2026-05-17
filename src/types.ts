export interface User {
  id: number;
  name: string;
  bpartnerId: number;
  employeeValue?: string;
  shift?: string;
}

export interface AttendanceRecord {
  id: number;
  type: 'IN' | 'OUT';
  time: string;
  status: string;
  lat?: number;
  lng?: number;
}

export interface Geofence {
  lat: number;
  lng: number;
  radius: number; // in meters
}
