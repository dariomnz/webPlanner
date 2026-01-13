import { describe, it, expect, vi, beforeEach } from 'vitest';
import { importClassPlan, exportClassPlan, exportDataToJson, importDataFromJson } from '../../src/utils/exportUtils';

describe('exportUtils', () => {
    // Mock URL methods
    if (typeof window !== 'undefined') {
        window.URL.createObjectURL = vi.fn(() => 'mock-url');
        window.URL.revokeObjectURL = vi.fn();
    }

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('importClassPlan', () => {
        it('should import class plan from HTML content', async () => {
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head><title>My Test Class</title></head>
                <body>
                    <ul>
                        <li>
                            <div class="exercise-header">
                                <span class="bullet">•</span>
                                <span class="exercise-section">Arms:</span>
                                <span class="exercise-name">Push up</span>
                            </div>
                            <div class="exercise-description">Keep back straight</div>
                        </li>
                    </ul>
                </body>
                </html>
            `;
            const file = new File([htmlContent], 'test.html', { type: 'text/html' });

            const result = await importClassPlan(file);

            expect(result.classTitle).toBe('My Test Class');
            expect(result.plannedExercises).toHaveLength(1);
            expect(result.plannedExercises[0].name).toBe('Push up');
            expect(result.plannedExercises[0].section).toBe('Arms');
            expect(result.plannedExercises[0].description).toBe('Keep back straight');
        });

        it('should handle missing description', async () => {
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head><title>Title</title></head>
                <body>
                    <ul>
                        <li>
                            <div class="exercise-header">
                                <span class="exercise-section">Core:</span>
                                <span class="exercise-name">Plank</span>
                            </div>
                        </li>
                    </ul>
                </body>
                </html>
            `;
            const file = new File([htmlContent], 'test.html', { type: 'text/html' });

            const result = await importClassPlan(file);

            expect(result.plannedExercises[0].name).toBe('Plank');
            expect(result.plannedExercises[0].description).toBeUndefined();
        });

        it('should reject invalid files', async () => {
            const file = new File(['invalid content'], 'test.html', { type: 'text/html' });

            await expect(importClassPlan(file)).rejects.toThrow();
        });

        it('should handle legacy JSON format in importClassPlan', async () => {
            const jsonData = JSON.stringify({
                classTitle: 'JSON Class',
                plannedExercises: [{ id: '1', name: 'Exercise', section: 'S', group: 'G' }]
            });
            const file = new File([jsonData], 'test.json', { type: 'application/json' });

            const result = await importClassPlan(file);
            expect(result.classTitle).toBe('JSON Class');
            expect(result.plannedExercises).toHaveLength(1);
        });
    });

    describe('exportClassPlan', () => {
        it('should create and click a download link', () => {
            const createElementSpy = vi.spyOn(document, 'createElement');
            const appendChildSpy = vi.spyOn(document.body, 'appendChild');
            const removeChildSpy = vi.spyOn(document.body, 'removeChild');

            const plannedExercises = [
                { id: '1', name: 'Ex 1', section: 'Sec 1', group: 'Grp 1' }
            ];

            exportClassPlan('Test Class', plannedExercises);

            expect(createElementSpy).toHaveBeenCalledWith('a');
            expect(appendChildSpy).toHaveBeenCalled();
            expect(removeChildSpy).toHaveBeenCalled();
            expect(window.URL.createObjectURL).toHaveBeenCalled();
            expect(window.URL.revokeObjectURL).toHaveBeenCalled();
        });
    });

    describe('exportDataToJson', () => {
        it('should create and click a download link for JSON backup', () => {
            const createElementSpy = vi.spyOn(document, 'createElement');
            const appendChildSpy = vi.spyOn(document.body, 'appendChild');

            const data = {
                exercises: [],
                sections: [],
                groups: ['General']
            };

            exportDataToJson(data, 'backup');

            expect(createElementSpy).toHaveBeenCalledWith('a');
            expect(appendChildSpy).toHaveBeenCalled();
            expect(window.URL.createObjectURL).toHaveBeenCalled();
        });
    });

    describe('importDataFromJson', () => {
        it('should import data from a JSON file', async () => {
            const data = {
                exercises: [{ id: '1', name: 'Ex', section: 'Sec', group: 'Grp' }],
                sections: [],
                groups: ['General']
            };
            const file = new File([JSON.stringify(data)], 'backup.json', { type: 'application/json' });

            const result = await importDataFromJson(file);

            expect(result).toEqual(data);
        });

        it('should reject if JSON is invalid', async () => {
            const file = new File(['invalid json'], 'backup.json', { type: 'application/json' });

            await expect(importDataFromJson(file)).rejects.toThrow();
        });
    });
});
