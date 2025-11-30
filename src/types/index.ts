export interface Exercise {
    id: string;
    name: string;
    section: string;
}

export interface PlannedExercise extends Exercise {
    isPreview?: boolean;
}

export interface DragData {
    type?: 'menu-item';
    name?: string;
    section?: string;
    id?: string;
}
