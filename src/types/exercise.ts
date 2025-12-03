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


export interface PlannedExercise extends Exercise {
    isPreview?: boolean;
}

export interface ActiveItem extends PlannedExercise {
    source?: 'menu' | 'planner' | 'section';
}
