export type SportType = 'Swim' | 'Bike' | 'Run' | 'Strength';

export interface SportTypeRecord {
  id: string;
  name: string;
  description?: string;
  paceRelevant: boolean;
  paceUnit?: string;
  distanceUnit?: string;
  effort1Label?: string;
  effort1Hex?: string;
  effort2Label?: string;
  effort2Hex?: string;
  effort3Label?: string;
  effort3Hex?: string;
  effort4Label?: string;
  effort4Hex?: string;
}

export interface UserSportSettings {
  id: string;
  sportTypeId: string;
  effort1Hex?: string;
  effort2Hex?: string;
  effort3Hex?: string;
  effort4Hex?: string;
  effort1Label?: string;
  effort2Label?: string;
  effort3Label?: string;
  effort4Label?: string;
}

export interface IntensitySettings {
  [key: string]: {
    [level: number]: {
      label: string;
      hexColor: string;
    };
  };
}

export interface WorkoutTypeOptions {
  [key: string]: string[];
}

export interface GarminSportMapping {
  id: string;
  garminActivityType: string;
  sportTypeId: string | null;
  garminDistanceUnit: 'km' | 'm';
  userId?: string;
  isSystem: boolean;
}
