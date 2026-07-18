import { DatabaseService } from '../database/DatabaseService';
import { Patient } from '../types/patient';
import { ReportRepository } from './ReportRepository';

export const PatientRepository = {
  async getPatients(): Promise<Patient[]> {
    const db = DatabaseService.getDb();
    
    try {
      const rows = db.getAllSync<any>('SELECT * FROM patients ORDER BY createdAt DESC;');
      const patientsList: Patient[] = rows.map(r => ({
        id: r.id,
        name: r.name,
        age: r.age,
        gender: r.gender,
        hospitalId: r.hospitalId,
        doctor: r.doctor,
        notes: r.notes || '',
        createdAt: r.createdAt,
        reports: []
      }));

      const allReports = await ReportRepository.getReports();
      return patientsList.map(patient => {
        const patientReports = allReports.filter(r => 
          r.patientName.toLowerCase().trim() === patient.name.toLowerCase().trim()
        );
        return {
          ...patient,
          reports: patientReports
        };
      });
    } catch (error) {
      console.error('[PatientRepository] getPatients failure:', error);
      return [];
    }
  },

  /**
   * Saves or updates a patient profile in SQLite.
   */
  async savePatient(patient: Patient): Promise<void> {
    const db = DatabaseService.getDb();
    try {
      db.runSync(
        `INSERT OR REPLACE INTO patients (id, name, age, gender, hospitalId, doctor, notes, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          patient.id,
          patient.name,
          patient.age,
          patient.gender,
          patient.hospitalId,
          patient.doctor,
          patient.notes || '',
          patient.createdAt
        ]
      );
    } catch (error) {
      console.error('[PatientRepository] savePatient failure:', error);
      throw new Error('EHR SQLite patient write failure');
    }
  },

  /**
   * Deletes a patient profile by ID from SQLite.
   */
  async deletePatient(id: string): Promise<void> {
    const db = DatabaseService.getDb();
    try {
      db.runSync('DELETE FROM patients WHERE id = ?;', [id]);
    } catch (error) {
      console.error('[PatientRepository] deletePatient failure:', error);
      throw new Error('EHR SQLite patient delete failure');
    }
  },

  /**
   * Resolves a single patient profile by ID from SQLite.
   */
  async getPatientById(id: string): Promise<Patient | null> {
    const list = await this.getPatients();
    return list.find(p => p.id === id) || null;
  }
};

export default PatientRepository;
