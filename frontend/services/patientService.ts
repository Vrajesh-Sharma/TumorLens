import { Patient } from '../types/patient';
import { Report } from '../types/report';
import { storageService } from './storageService';
import { reportService } from './reportService';

const COLLECTION = 'patients/patients';

class PatientServiceImpl {
  async getAll(): Promise<Patient[]> {
    const patients = await storageService.getCollection<Patient>(COLLECTION);
    const allReports = await reportService.getAll();
    return patients.map(patient => ({
      ...patient,
      reports: allReports.filter(r =>
        (r.patientId && r.patientId === patient.id) ||
        (!r.patientId && r.patientName.toLowerCase().trim() === patient.name.toLowerCase().trim())
      ),
    }));
  }

  async getById(id: string): Promise<Patient | null> {
    const all = await this.getAll();
    return all.find(p => p.id === id) || null;
  }

  async create(data: Omit<Patient, 'id' | 'createdAt' | 'reports'>): Promise<Patient> {
    const patient: Patient = {
      ...data,
      id: `PAT-${Date.now().toString(36).toUpperCase()}`,
      reports: [],
      createdAt: new Date().toISOString(),
    };
    await storageService.addItem(COLLECTION, patient);
    return patient;
  }

  async update(patient: Patient): Promise<void> {
    await storageService.addItem(COLLECTION, patient);
  }

  async delete(id: string): Promise<void> {
    await storageService.removeItem(COLLECTION, id);
  }

  async search(query: string): Promise<Patient[]> {
    const all = await this.getAll();
    if (!query.trim()) return all;
    const q = query.toLowerCase().trim();
    return all.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.hospitalId.toLowerCase().includes(q) ||
      (p.notes && p.notes.toLowerCase().includes(q))
    );
  }

  async getCount(): Promise<number> {
    return storageService.getCollectionSize(COLLECTION);
  }
}

export const patientService = new PatientServiceImpl();
export default patientService;
