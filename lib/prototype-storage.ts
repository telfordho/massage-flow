import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  createEmptyStoredData,
  normalizeStoredData,
  type MassageFlowStoredData,
} from "@/lib/prototype-history";

const STORAGE_KEY = "massage-flow.local-data.v1";

export async function loadMassageFlowData(): Promise<MassageFlowStoredData> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? normalizeStoredData(JSON.parse(raw)) : createEmptyStoredData();
  } catch {
    return createEmptyStoredData();
  }
}

export async function saveMassageFlowData(data: MassageFlowStoredData): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // The guided prototype remains usable when device storage is unavailable.
  }
}
