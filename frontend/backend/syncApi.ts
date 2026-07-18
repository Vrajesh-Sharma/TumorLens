import apiClient, { ApiRequestError } from '../services/api';
import { Patient } from '../types/patient';
import { Report } from '../types/report';

export const syncApi = {
  async syncPatientsToServer(patients: Patient[]): Promise<boolean> {
    try {
      await apiClient.post('/sync/patients', { patients });
      return true;
    } catch (err) {
      if (err instanceof ApiRequestError && !err.statusCode) {
        return true;
      }
      throw err;
    }
  },

  async syncReportsToServer(reports: Report[]): Promise<boolean> {
    try {
      await apiClient.post('/sync/reports', { reports });
      return true;
    } catch (err) {
      if (err instanceof ApiRequestError && !err.statusCode) {
        return true;
      }
      throw err;
    }
  },

  async checkCloudConnectivity(): Promise<boolean> {
    try {
      await apiClient.get('/health', { timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  }
};

export default syncApi;