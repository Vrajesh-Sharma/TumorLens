import { useState, useEffect, useCallback } from 'react';
import { Patient } from '../types/patient';
import { PatientRepository } from '../repositories/PatientRepository';
import { SyncRepository } from '../repositories/SyncRepository';

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches patients from the repository.
   */
  const loadPatients = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await PatientRepository.getPatients();
      setPatients(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load hospital patient database.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Filter patients by search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPatients(patients);
      return;
    }

    const q = searchQuery.toLowerCase().trim();
    const filtered = patients.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.hospitalId.toLowerCase().includes(q) ||
      (p.notes && p.notes.toLowerCase().includes(q))
    );
    setFilteredPatients(filtered);
  }, [patients, searchQuery]);

  /**
   * Appends a new patient case to the database.
   */
  const addPatient = async (patient: Omit<Patient, 'createdAt' | 'reports'>) => {
    try {
      const fullPatient: Patient = {
        ...patient,
        reports: [],
        createdAt: new Date().toISOString()
      };
      await PatientRepository.savePatient(fullPatient);
      
      // Queue offline synchronization
      SyncRepository.addToQueue('insert_patient', fullPatient);

      await loadPatients();
    } catch (err: any) {
      setError(err.message || 'Failed to save patient profile.');
      throw err;
    }
  };

  /**
   * Updates an existing patient record.
   */
  const updatePatient = async (patient: Patient) => {
    try {
      await PatientRepository.savePatient(patient);
      
      // Queue offline synchronization
      SyncRepository.addToQueue('update_patient', patient);

      await loadPatients();
    } catch (err: any) {
      setError(err.message || 'Failed to update patient profile.');
      throw err;
    }
  };

  /**
   * Deletes a patient profile from local storage.
   */
  const deletePatient = async (id: string) => {
    try {
      await PatientRepository.deletePatient(id);
      await loadPatients();
    } catch (err: any) {
      setError(err.message || 'Failed to delete patient profile.');
      throw err;
    }
  };

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  return {
    patients,
    filteredPatients,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    refreshPatients: loadPatients,
    addPatient,
    updatePatient,
    deletePatient
  };
}

export default usePatients;
