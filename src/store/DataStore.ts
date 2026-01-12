import { SetStateAction } from 'react';
import { Exercise, PlannedExercise, Section } from '../types/exercise';

type Listener = () => void;

class DataStore {
    private exercises: Exercise[] = [];
    private plannedExercises: PlannedExercise[] = [];
    private sections: Section[] = [];
    private groups: string[] = [];
    private classTitle: string = '';
    private darkMode: boolean = false;
    private appTheme: string = 'pink';

    private itemListeners: Map<string, Set<Listener>> = new Map();
    private saveTimeout: ReturnType<typeof setTimeout> | null = null;
    private pendingSaves: Set<string> = new Set();
    private onChanges: ((id: string) => void)[] = [];

    constructor() {
        this.loadFromLocalStorage();

        // Registrar el guardado como un listener interno
        this.onChanges.push((id) => this.saveToLocalStorage(id));

        if (this.exercises.length === 0 && this.sections.length === 0) {
            this.exercises = [
                { id: '1', name: 'The Hundred', section: 'Core', group: 'General' },
                { id: '2', name: 'Roll Up', section: 'Core', group: 'General' },
                { id: '3', name: 'Single Leg Circles', section: 'Legs', group: 'General' },
                { id: '4', name: 'Rolling Like a Ball', section: 'Core', group: 'General' },
                { id: '5', name: 'Single Leg Stretch', section: 'Legs', group: 'General' },
            ];
            this.groups = ['General'];
            this.sections = [
                { name: 'Core', group: 'General' },
                { name: 'Legs', group: 'General' },
                { name: 'Arms', group: 'General' },
                { name: 'Back', group: 'General' }
            ];
            this.saveToLocalStorage();
        }
    }

    // --- Persistence ---

    private loadFromLocalStorage() {
        try {
            const exercises = localStorage.getItem('exercises');
            const planned = localStorage.getItem('planned-exercises');
            const sections = localStorage.getItem('sections');
            const groups = localStorage.getItem('groups');
            const title = localStorage.getItem('class-title');

            if (exercises) this.exercises = JSON.parse(exercises);
            if (planned) this.plannedExercises = JSON.parse(planned);
            if (sections) this.sections = JSON.parse(sections);
            if (groups) this.groups = JSON.parse(groups);
            if (title) this.classTitle = JSON.parse(title);
            const darkMode = localStorage.getItem('dark-mode');
            if (darkMode !== null) {
                this.darkMode = JSON.parse(darkMode);
            }
            this.applyDarkMode(this.darkMode);
            const appTheme = localStorage.getItem('app-theme');
            if (appTheme !== null) {
                this.appTheme = JSON.parse(appTheme);
            } else {
                this.appTheme = 'pink';
            }
            this.applyTheme(this.appTheme);
        } catch (e) {
            console.error('Error loading from local storage', e);
        }
    }

    private saveToLocalStorage(id?: string) {
        const storageKeys = ['exercises', 'planned-exercises', 'sections', 'groups', 'class-title', 'dark-mode', 'app-theme'];

        if (!id) {
            storageKeys.forEach(k => this.pendingSaves.add(k));
        } else if (storageKeys.includes(id)) {
            this.pendingSaves.add(id);
        } else {
            // Search id in exercises and planned exercises
            if (this.exercises.filter(e => e.id === id).length > 0) {
                this.pendingSaves.add('exercises');
            }
            if (this.plannedExercises.filter(e => e.id === id).length > 0) {
                this.pendingSaves.add('planned-exercises');
            }
        }

        if (this.saveTimeout) return;

        this.saveTimeout = setTimeout(() => {
            if (this.pendingSaves.has('exercises')) {
                localStorage.setItem('exercises', JSON.stringify(this.exercises));
            }
            if (this.pendingSaves.has('planned-exercises')) {
                localStorage.setItem('planned-exercises', JSON.stringify(this.plannedExercises));
            }
            if (this.pendingSaves.has('sections')) {
                localStorage.setItem('sections', JSON.stringify(this.sections));
            }
            if (this.pendingSaves.has('groups')) {
                localStorage.setItem('groups', JSON.stringify(this.groups));
            }
            if (this.pendingSaves.has('class-title')) {
                localStorage.setItem('class-title', JSON.stringify(this.classTitle));
            }
            if (this.pendingSaves.has('dark-mode')) {
                localStorage.setItem('dark-mode', JSON.stringify(this.darkMode));
            }
            if (this.pendingSaves.has('app-theme')) {
                localStorage.setItem('app-theme', JSON.stringify(this.appTheme));
            }
            this.pendingSaves.clear();
            this.saveTimeout = null;
        }, 100);
    }

    // --- Subscription ---

    subscribeToItem(id: string, listener: Listener) {
        if (!this.itemListeners.has(id)) {
            this.itemListeners.set(id, new Set());
        }
        this.itemListeners.get(id)!.add(listener);
        return () => {
            const set = this.itemListeners.get(id);
            if (set) {
                set.delete(listener);
                if (set.size === 0) this.itemListeners.delete(id);
            }
        };
    }

    private notify(id: string) {
        const listeners = this.itemListeners.get(id);
        if (listeners) {
            listeners.forEach(l => l());
        }
        this.onChanges.forEach(cb => cb(id));
    }

    // --- Getters ---

    getExercises() { return this.exercises; }
    getPlannedExercises() { return this.plannedExercises; }
    getPlannedExercisesLength() { return this.plannedExercises.length; }
    getSections() { return this.sections; }
    getGroups() { return this.groups; }
    getClassTitle() { return this.classTitle; }
    getDarkMode() { return this.darkMode; }
    getAppTheme() { return this.appTheme; }

    getExercise(id: string) {
        return this.exercises.find(e => e.id === id) || this.plannedExercises.find(e => e.id === id);
    }

    // --- Actions ---

    setExercises(exercises: SetStateAction<Exercise[]>) {
        this.exercises = typeof exercises === 'function'
            ? exercises(this.exercises)
            : exercises;
        this.notify('exercises');
    }

    setPlannedExercises(plannedExercises: SetStateAction<PlannedExercise[]>) {
        this.plannedExercises = typeof plannedExercises === 'function'
            ? plannedExercises(this.plannedExercises)
            : plannedExercises;
        this.notify('planned-exercises');
    }

    setSections(sections: SetStateAction<Section[]>) {
        this.sections = typeof sections === 'function'
            ? sections(this.sections)
            : sections;
        this.notify('sections');
    }

    setGroups(groups: SetStateAction<string[]>) {
        this.groups = typeof groups === 'function'
            ? groups(this.groups)
            : groups;
        this.notify('groups');
    }

    setClassTitle(classTitle: SetStateAction<string>) {
        this.classTitle = typeof classTitle === 'function'
            ? classTitle(this.classTitle)
            : classTitle;
        this.notify('class-title');
    }

    setDarkMode(darkMode: SetStateAction<boolean>) {
        this.darkMode = typeof darkMode === 'function'
            ? darkMode(this.darkMode)
            : darkMode;
        this.applyDarkMode(this.darkMode);
        this.notify('dark-mode');
    }

    private applyDarkMode(dark: boolean) {
        if (dark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }

    setAppTheme(theme: string) {
        this.appTheme = theme;
        this.applyTheme(theme);
        this.notify('app-theme');
    }

    private applyTheme(theme: string) {
        document.documentElement.setAttribute('data-theme', theme);
    }

    updateSection(oldName: string, newName: string, group: string) {
        this.setSections(prev => prev.map(s =>
            (s.name === oldName && s.group === group) ? { ...s, name: newName } : s
        ));
        this.setExercises(prev => prev.map(ex =>
            (ex.section === oldName && ex.group === group) ? { ...ex, section: newName } : ex
        ));
    }

    updateExercise(id: string, updates: Partial<Exercise>) {
        let found = false;

        this.exercises = this.exercises.map(ex => {
            if (ex.id === id) {
                found = true;
                return { ...ex, ...updates };
            }
            return ex;
        });

        if (!found) {
            this.plannedExercises = this.plannedExercises.map(ex => {
                if (ex.id === id) {
                    found = true;
                    return { ...ex, ...updates };
                }
                return ex;
            });
        }

        if (found) {
            this.notify(id);
        }
    }

    addExercise(exercise: Exercise) {
        this.setExercises(prev => [...prev, exercise]);
    }

    addPlannedExercise(exercise: PlannedExercise) {
        this.setPlannedExercises(prev => [...prev, exercise]);
    }

    addGroup(groupName: string) {
        if (this.groups.includes(groupName)) return;
        this.setGroups(prev => [...prev, groupName]);
    }

    addSection(sectionName: string, group: string) {
        if (!this.sections.some(s => s.name === sectionName && s.group === group)) {
            this.setSections(prev => [...prev, { name: sectionName, group: group }]);
        }
    }

    removeSection(sectionName: string, group: string) {
        this.setSections(prev => prev.filter(s => s.name !== sectionName || s.group !== group));
        this.setExercises(prev => prev.filter(ex => !(ex.section === sectionName && ex.group === group)));
    }

    removeGroup(groupName: string) {
        this.setExercises(prev => prev.filter(ex => ex.group !== groupName));
        this.setSections(prev => prev.filter(s => s.group !== groupName));
        this.setGroups(prev => prev.filter(g => g !== groupName));
    }

    removePlannedExercise(id: string) {
        this.setPlannedExercises(prev => prev.filter(ex => ex.id !== id));
    }

    removeExercise(id: string) {
        this.setExercises(prev => prev.filter(ex => ex.id !== id));
    }

    importData(data: { exercises?: Exercise[], sections?: Section[], groups?: string[], plannedExercises?: PlannedExercise[], classTitle?: string }) {
        if (data.exercises) this.setExercises(data.exercises);
        if (data.sections) this.setSections(data.sections);
        if (data.groups) this.setGroups(data.groups);
        if (data.plannedExercises) this.setPlannedExercises(data.plannedExercises);
        if (data.classTitle) this.setClassTitle(data.classTitle);
    }

    clearPlannedExercises() {
        this.setPlannedExercises([]);
    }
}

export const dataStore = new DataStore();
