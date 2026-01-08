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


export type PlannedExercise = Exercise;

export interface ActiveSection {
    id: string;
    name: string;
    section: string;
    group: string;
    source: 'section';
}

export type ActiveItem = (PlannedExercise & { source?: 'menu' | 'planner' }) | ActiveSection;
