export interface Exercise {
    id: string;
    name: string;
}

export interface PlannedExercise extends Exercise {
    isPreview?: boolean;
}

export interface DragData {
    type?: 'menu-item';
    name?: string;
    id?: string;
}
