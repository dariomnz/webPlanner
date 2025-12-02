import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportClassPlan, importClassPlan, exportDataToJson, importDataFromJson } from '../utils/exportUtils';
import { PlannedExercise, Exercise, Section } from '../types';

describe('Exportar e Importar Clases', () => {
    let mockLink: HTMLAnchorElement;
    let createElementSpy: any;
    let appendChildSpy: any;
    let removeChildSpy: any;

    beforeEach(() => {
        // Mock para el elemento <a> que se crea para descargar
        mockLink = {
            click: vi.fn(),
            href: '',
            download: '',
        } as any;

        createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
        appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink);
        removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink);

        // Mock para URL.createObjectURL y revokeObjectURL
        global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
        global.URL.revokeObjectURL = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('exportClassPlan - Exportar clase a HTML', () => {
        it('debería crear un archivo HTML con el título de la clase', () => {
            const classTitle = 'Mi Clase de Ballet';
            const exercises: PlannedExercise[] = [
                { id: '1', name: 'The Hundred', section: 'Core', group: 'General' },
                { id: '2', name: 'Roll Up', section: 'Core', group: 'General' },
            ];

            exportClassPlan(classTitle, exercises);

            // Verificar que se creó un elemento <a>
            expect(createElementSpy).toHaveBeenCalledWith('a');

            // Verificar que se estableció el nombre del archivo
            expect(mockLink.download).toBe(`${classTitle}.html`);

            // Verificar que se llamó a click()
            expect(mockLink.click).toHaveBeenCalled();

            // Verificar que se limpió el DOM
            expect(removeChildSpy).toHaveBeenCalledWith(mockLink);
        });

        it('debería incluir todos los ejercicios en el HTML exportado', () => {
            const exercises: PlannedExercise[] = [
                { id: '1', name: 'The Hundred', section: 'Core', group: 'General' },
                { id: '2', name: 'Roll Up', section: 'Core', group: 'General', description: 'Ejercicio de flexibilidad' },
            ];

            // Capturar el blob creado
            let blobContent = '';
            const originalBlob = global.Blob;
            global.Blob = class MockBlob {
                constructor(parts: any[], options?: any) {
                    blobContent = parts[0];
                }
            } as any;

            exportClassPlan('Test Class', exercises);

            // Verificar que el contenido incluye los ejercicios
            expect(blobContent).toContain('The Hundred');
            expect(blobContent).toContain('Roll Up');
            expect(blobContent).toContain('Core');
            expect(blobContent).toContain('Ejercicio de flexibilidad');

            // Restaurar Blob original
            global.Blob = originalBlob;
        });

        it('debería usar un nombre por defecto si no hay título', () => {
            const exercises: PlannedExercise[] = [
                { id: '1', name: 'Exercise', section: 'Test', group: 'General' },
            ];

            exportClassPlan('', exercises);

            expect(mockLink.download).toBe(' webPlanner.html');
        });
    });

    describe('importClassPlan - Importar clase desde HTML', () => {
        it('debería importar una clase desde un archivo HTML', async () => {
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Mi Clase Importada</title>
                </head>
                <body>
                    <ul>
                        <li>
                            <div class="exercise-header">
                                <span class="exercise-section">Core:</span>
                                <span class="exercise-name">The Hundred</span>
                            </div>
                        </li>
                        <li>
                            <div class="exercise-header">
                                <span class="exercise-section">Legs:</span>
                                <span class="exercise-name">Single Leg Circles</span>
                            </div>
                            <div class="exercise-description">Círculos con una pierna</div>
                        </li>
                    </ul>
                </body>
                </html>
            `;

            const file = new File([htmlContent], 'test.html', { type: 'text/html' });
            const result = await importClassPlan(file);

            expect(result.classTitle).toBe('Mi Clase Importada');
            expect(result.plannedExercises).toHaveLength(2);
            expect(result.plannedExercises[0].name).toBe('The Hundred');
            expect(result.plannedExercises[0].section).toBe('Core');
            expect(result.plannedExercises[1].name).toBe('Single Leg Circles');
            expect(result.plannedExercises[1].description).toBe('Círculos con una pierna');
        });

        it('debería importar una clase desde un archivo JSON', async () => {
            const jsonContent = {
                classTitle: 'Clase JSON',
                plannedExercises: [
                    { id: '1', name: 'Exercise 1', section: 'Core', group: 'General' },
                    { id: '2', name: 'Exercise 2', section: 'Legs', group: 'General' },
                ],
            };

            const file = new File([JSON.stringify(jsonContent)], 'test.json', { type: 'application/json' });
            const result = await importClassPlan(file);

            expect(result.classTitle).toBe('Clase JSON');
            expect(result.plannedExercises).toHaveLength(2);
            expect(result.plannedExercises[0].name).toBe('Exercise 1');
        });

        it('debería rechazar si el archivo HTML no contiene ejercicios', async () => {
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head><title>Empty Class</title></head>
                <body><ul></ul></body>
                </html>
            `;

            const file = new File([htmlContent], 'empty.html', { type: 'text/html' });

            await expect(importClassPlan(file)).rejects.toThrow('No se encontraron ejercicios');
        });
    });
});

describe('Exportar e Importar Ejercicios (JSON)', () => {
    let mockLink: HTMLAnchorElement;
    let createElementSpy: any;

    beforeEach(() => {
        mockLink = {
            click: vi.fn(),
            href: '',
            download: '',
        } as any;

        createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
        vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink);
        vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink);

        global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
        global.URL.revokeObjectURL = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('exportDataToJson - Guardar ejercicios', () => {
        it('debería exportar ejercicios a un archivo JSON', () => {
            const exercises: Exercise[] = [
                { id: '1', name: 'The Hundred', section: 'Core', group: 'General' },
                { id: '2', name: 'Roll Up', section: 'Core', group: 'General' },
            ];

            const sections: Section[] = [
                { name: 'Core', group: 'General' },
                { name: 'Legs', group: 'General' },
            ];

            const groups = ['General', 'Advanced'];

            const data = { exercises, sections, groups };

            exportDataToJson(data, 'my_exercises');

            // Verificar que se creó el enlace de descarga
            expect(createElementSpy).toHaveBeenCalledWith('a');
            expect(mockLink.click).toHaveBeenCalled();

            // Verificar que el nombre del archivo incluye el prefijo y la fecha
            expect(mockLink.download).toContain('my_exercises_');
            expect(mockLink.download).toContain('.json');
        });

        it('debería crear un JSON válido con los datos', () => {
            const data = {
                exercises: [
                    { id: '1', name: 'Test Exercise', section: 'Test', group: 'General' },
                ],
                sections: [{ name: 'Test', group: 'General' }],
                groups: ['General'],
            };

            let blobContent = '';
            const originalBlob = global.Blob;
            global.Blob = class MockBlob {
                constructor(parts: any[], options?: any) {
                    blobContent = parts[0];
                }
            } as any;

            exportDataToJson(data, 'test');

            // Verificar que el contenido es JSON válido
            const parsed = JSON.parse(blobContent);
            expect(parsed.exercises).toHaveLength(1);
            expect(parsed.exercises[0].name).toBe('Test Exercise');
            expect(parsed.sections).toHaveLength(1);
            expect(parsed.groups).toContain('General');

            global.Blob = originalBlob;
        });
    });

    describe('importDataFromJson - Cargar ejercicios', () => {
        it('debería importar ejercicios desde un archivo JSON', async () => {
            const exercises: Exercise[] = [
                { id: '1', name: 'The Hundred', section: 'Core', group: 'General' },
                { id: '2', name: 'Roll Up', section: 'Core', group: 'General' },
            ];

            const sections: Section[] = [
                { name: 'Core', group: 'General' },
                { name: 'Legs', group: 'General' },
            ];

            const groups = ['General', 'Advanced'];

            const data = { exercises, sections, groups };
            const jsonString = JSON.stringify(data);
            const file = new File([jsonString], 'exercises.json', { type: 'application/json' });

            const result = await importDataFromJson(file);

            expect(result.exercises).toHaveLength(2);
            expect(result.exercises[0].name).toBe('The Hundred');
            expect(result.sections).toHaveLength(2);
            expect(result.groups).toContain('General');
            expect(result.groups).toContain('Advanced');
        });

        it('debería rechazar si el archivo no es JSON válido', async () => {
            const invalidContent = 'This is not JSON';
            const file = new File([invalidContent], 'invalid.json', { type: 'application/json' });

            await expect(importDataFromJson(file)).rejects.toThrow();
        });

        it('debería importar correctamente ejercicios con descripciones', async () => {
            const data = {
                exercises: [
                    {
                        id: '1',
                        name: 'The Hundred',
                        section: 'Core',
                        group: 'General',
                        description: 'Ejercicio de respiración y core'
                    },
                ],
                sections: [{ name: 'Core', group: 'General' }],
                groups: ['General'],
            };

            const file = new File([JSON.stringify(data)], 'exercises.json', { type: 'application/json' });
            const result = await importDataFromJson(file);

            expect(result.exercises[0].description).toBe('Ejercicio de respiración y core');
        });
    });
});

describe('Flujo Completo: Exportar e Importar', () => {
    it('debería poder exportar y luego importar la misma clase', async () => {
        const originalTitle = 'Mi Clase de Prueba';
        const originalExercises: PlannedExercise[] = [
            { id: '1', name: 'The Hundred', section: 'Core', group: 'General' },
            { id: '2', name: 'Roll Up', section: 'Core', group: 'General', description: 'Test description' },
        ];

        // Capturar el HTML generado
        let exportedHTML = '';
        const originalBlob = global.Blob;
        global.Blob = class MockBlob {
            constructor(parts: any[], options?: any) {
                exportedHTML = parts[0];
            }
        } as any;

        const mockLink = { click: vi.fn() } as any;
        vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
        vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink);
        vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink);
        global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
        global.URL.revokeObjectURL = vi.fn();

        // Exportar
        exportClassPlan(originalTitle, originalExercises);

        // Importar el HTML exportado
        const file = new File([exportedHTML], 'test.html', { type: 'text/html' });
        const imported = await importClassPlan(file);

        // Verificar que los datos son consistentes
        expect(imported.classTitle).toBe(originalTitle);
        expect(imported.plannedExercises).toHaveLength(originalExercises.length);
        expect(imported.plannedExercises[0].name).toBe('The Hundred');
        expect(imported.plannedExercises[1].description).toBe('Test description');

        global.Blob = originalBlob;
        vi.restoreAllMocks();
    });

    it('debería poder exportar y luego importar ejercicios en JSON', async () => {
        const originalData = {
            exercises: [
                { id: '1', name: 'Exercise 1', section: 'Core', group: 'General' },
                { id: '2', name: 'Exercise 2', section: 'Legs', group: 'Advanced' },
            ],
            sections: [
                { name: 'Core', group: 'General' },
                { name: 'Legs', group: 'Advanced' },
            ],
            groups: ['General', 'Advanced'],
        };

        // Capturar el JSON generado
        let exportedJSON = '';
        const originalBlob = global.Blob;
        global.Blob = class MockBlob {
            constructor(parts: any[], options?: any) {
                exportedJSON = parts[0];
            }
        } as any;

        const mockLink = { click: vi.fn() } as any;
        vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
        vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink);
        vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink);
        global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
        global.URL.revokeObjectURL = vi.fn();

        // Exportar
        exportDataToJson(originalData, 'test_exercises');

        // Importar el JSON exportado
        const file = new File([exportedJSON], 'exercises.json', { type: 'application/json' });
        const imported = await importDataFromJson(file);

        // Verificar que los datos son idénticos
        expect(imported.exercises).toEqual(originalData.exercises);
        expect(imported.sections).toEqual(originalData.sections);
        expect(imported.groups).toEqual(originalData.groups);

        global.Blob = originalBlob;
        vi.restoreAllMocks();
    });
});
