import { SportTypeRecord } from '@/types/training';

/**
 * Generates the AI prompt for training plan imports.
 * @param sportTypes The list of available sport types for mapping.
 * @returns The formatted prompt template string.
 */
export const getImportPrompt = (sportTypes: SportTypeRecord[]) => {
  const validSports =
    sportTypes.map((st) => st.name).join(', ') || 'Run, Bike, Swim';

  return `Please act as an expert [ENTER SPORT TYPE] coach and design a training program for me. 

[INSERT YOUR EVENT DETAILS, TIMEFRAME, CURRENT FITNESS LEVEL, EVENT DATE, AND GOALS HERE]

When generating the program, the "sportName" column must exactly match one of my configured sports from the database: ${validSports}. Do not use any different types, they need to match exactly.

Provide it as either a downloadable CSV file, or as text in CSV format that can be copied. Ensure that any fields containing commas (especially in the "description" or "title") are enclosed in double quotes (e.g., "Main set, 10x100m").

Required Columns:
1. "date" OR ("weekNumber" AND "dayOfWeek")
   - Use "date" in YYYY-MM-DD format for calendar imports.
   - Use "weekNumber" (starting from 1) and "dayOfWeek" (1=Monday, 2=Tuesday, ..., 7=Sunday) for generic training plans.
2. "sportName" - The name of the sport (must exactly match one of the sports listed above).
3. "title" - A short, descriptive title for the workout.
4. "description" - Details of the workout structure.
5. "plannedDurationMinutes" - The total planned duration in minutes as a whole number.
6. "plannedDistanceKilometers" - The planned distance in kilometers (use 0 if not applicable).
7. "effortLevel" - A numeric value representing intensity from 1 to 4 (1=Recovery, 2=Base, 3=Tempo, 4=VO2).
8. "isKeyWorkout" - Either "true" or "false" to indicate if this is a high-priority session.

Example row for ${sportTypes[0]?.name || 'Sport'} (Plan Template):
weekNumber,dayOfWeek,sportName,title,description,plannedDurationMinutes,plannedDistanceKilometers,effortLevel,isKeyWorkout
1,1,${sportTypes[0]?.name || 'Sport'},Steady Session,Description,60,10,2,false

Example row for ${sportTypes[0]?.name || 'Sport'} (Calendar):
date,sportName,title,description,plannedDurationMinutes,plannedDistanceKilometers,effortLevel,isKeyWorkout
${new Date().toISOString().split('T')[0]},${sportTypes[0]?.name || 'Sport'},Steady Session,Description,60,10,2,false

Before you start, ask me any questions you need to ensure you have full context`;
};
