import { useState, useEffect, useCallback } from 'react';
import { Patient } from '../types/patient';
import { patientService } from '../services/patientService';

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPatients = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await patientService.getAll();
      setPatients(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load patients.');
    } finally {
      setIsLoading(false);
    }
  }, []);

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

  const addPatient = async (data: Omit<Patient, 'id' | 'createdAt' | 'reports'>) => {
    try {
      await patientService.create(data);
      await loadPatients();
    } catch (err: any) {
      setError(err.message || 'Failed to save patient.');
      throw err;
    }
  };

  const updatePatient = async (patient: Patient) => {
    try {
      await patientService.update(patient);
      await loadPatients();
    } catch (err: any) {
      setError(err.message || 'Failed to update patient.');
      throw err;
    }
  };

  const deletePatient = async (id: string) => {
    try {
      await patientService.delete(id);
      await loadPatients();
    } catch (err: any) {
      setError(err.message || 'Failed to delete patient.');
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
    deletePatient,
  };
}

export default usePatients;
