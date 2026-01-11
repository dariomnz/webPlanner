export interface Exercise {
    id: string;
    name: string;
    description?: string;
    section: string;
    group: string;
}

export interface Section {
    name: string;
    group: string;
}

export interface Group {
    name: string;
}

export type PlannedExercise = Exercise;