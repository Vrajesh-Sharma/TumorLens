import apiClient, { ApiRequestError } from '../services/api';
import { Patient } from '../types/patient';

export const patientApi = {
  async getRemotePatients(): Promise<Patient[]> {
    try {
      const response = await apiClient.get<Patient[]>('/patients');
      return response.data;
    } catch (err) {
      if (err instanceof ApiRequestError && !err.statusCode) {
        return [];
      }
      throw err;
    }
  },

  async syncPatient(patient: Patient): Promise<boolean> {
    try {
      await apiClient.post('/patients/sync', patient);
      return true;
    } catch (err) {
      if (err instanceof ApiRequestError && !err.statusCode) {
        return true;
      }
      throw err;
    }
  }
};

export default patientApi;