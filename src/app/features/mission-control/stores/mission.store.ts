import { computed } from '@angular/core';
import { signalStore, withComputed, withMethods, withState, patchState } from '@ngrx/signals';
import { MissionOutline } from '../models/mission-outline.model';

interface MissionState {
  missions: MissionOutline[];
  isScanning: boolean;
  error: string | null;
}

const initialState: MissionState = {
  missions: [],
  isScanning: false,
  error: null
};

export const MissionStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    missionCount: computed(() => store.missions().length),
    availableMissions: computed(() => 
      store.missions().filter(m => m.status === 'available')
    ),
    canScanNewMission: computed(() => store.missions().length < 6)
  })),  withMethods((store) => ({
    startScanning(): void {
      patchState(store, { isScanning: true, error: null });
    },
    
    addMission(mission: MissionOutline): void {
      patchState(store, (state: MissionState) => ({
        missions: [...state.missions, mission],
        isScanning: false,
        error: null
      }));
    },
    
    removeMission(missionId: string): void {
      patchState(store, (state: MissionState) => ({
        missions: state.missions.filter((m: MissionOutline) => m.id !== missionId),
        error: null
      }));
    },
    
    getMissionById(missionId: string): MissionOutline | undefined {
      return store.missions().find((m: MissionOutline) => m.id === missionId);
    },
    
    setScanningError(error: string): void {
      patchState(store, { isScanning: false, error });
    },
    
    clearError(): void {
      patchState(store, { error: null });
    }
  }))
);
