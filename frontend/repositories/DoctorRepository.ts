import { DatabaseService } from '../database/DatabaseService';
import { UserProfile } from '../contexts/AuthContext';

export const DoctorRepository = {
  saveDoctor(doctor: UserProfile): void {
    const db = DatabaseService.getDb();
    db.runSync(
      `INSERT OR REPLACE INTO doctors (id, name, email, hospitalName, medicalLicenseId, specialization, department, phone, photoUri, role)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        doctor.id,
        doctor.name,
        doctor.email,
        doctor.hospitalName,
        doctor.medicalLicenseId,
        doctor.specialization,
        doctor.department || null,
        doctor.phone || null,
        doctor.photoUri || null,
        doctor.role || 'doctor'
      ]
    );
  },

  getDoctorByEmail(email: string): UserProfile | null {
    const db = DatabaseService.getDb();
    const row = db.getFirstSync<any>(
      'SELECT * FROM doctors WHERE email = ? LIMIT 1;',
      [email]
    );
    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      email: row.email,
      hospitalName: row.hospitalName,
      medicalLicenseId: row.medicalLicenseId,
      specialization: row.specialization,
      department: row.department || '',
      phone: row.phone || '',
      photoUri: row.photoUri || '',
      role: row.role || 'doctor'
    };
  },

  /**
   * Wipes clinician credentials.
   */
  deleteDoctor(id: string): void {
    const db = DatabaseService.getDb();
    db.runSync('DELETE FROM doctors WHERE id = ?;', [id]);
  }
};

export default DoctorRepository;
