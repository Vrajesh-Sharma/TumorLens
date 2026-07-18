import { Report } from './report';

/**
 * Hospital EHR Patient Case File Structure
 */
export interface Patient {
  id: string; // Unique Subject Identifier
  name: string; // Full Patient Name
  age: number;
  gender: 'male' | 'female' | 'other';
  hospitalId: string; // Institution Hospital ID
  doctor: string; // Assigned Neuroradiologist
  reports: Report[]; // Associated MRI prediction scans
  notes: string; // Subject clinical annotations
  createdAt: string; // Intake Timestamp ISO
}
