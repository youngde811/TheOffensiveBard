import { NativeModules } from 'react-native';
import type { SystemMetrics } from './SystemMetrics.types';

const { SystemMetrics: NativeSystemMetrics } = NativeModules;

interface SystemMetricsModule {
  getMetrics(): Promise<SystemMetrics>;
}

const SystemMetricsAPI: SystemMetricsModule = {
  getMetrics: (): Promise<SystemMetrics> => {
    if (!NativeSystemMetrics) {
      return Promise.reject(
        new Error('SystemMetrics native module is not available')
      );
    }
    return NativeSystemMetrics.getMetrics();
  },
};

export default SystemMetricsAPI;
export * from './SystemMetrics.types';
