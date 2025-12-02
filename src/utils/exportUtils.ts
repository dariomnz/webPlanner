import { PlannedExercise } from '../types';

export const exportClassPlan = (classTitle: string, plannedExercises: PlannedExercise[]) => {
    const content = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>${classTitle || 'Clase'}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
            color: #333;
            line-height: 1.6;
        }
        h1 {
            color: #831843; /* pink-900 */
            border-bottom: 2px solid #fbcfe8; /* pink-200 */
            padding-bottom: 10px;
            margin-bottom: 30px;
            text-align: center;
        }
        ul {
            list-style-type: none;
            padding: 0;
        }
        li {
            margin-bottom: 20px;
            page-break-inside: avoid;
        }
        .exercise-header {
            margin-bottom: 5px;
        }
        .exercise-name {
            font-weight: 500;
            font-size: 1.2em;
            color: #111827; /* gray-900 */
        }
        .exercise-section {
            font-size: 1.2em;
            color: #831843; /* pink-900 */
            margin-right: 5px;
            font-weight: 500;
        }
        .exercise-description {
            margin-left: 20px;
            color: #4b5563;
            font-style: italic;
        }
        .bullet {
            color: #db2777; /* pink-600 */
            margin-right: 10px;
            font-weight: bold;
        }
    </style>
</head>
<body>

    <h1 style="display: flex; align-items: center; justify-content: center; gap: 10px;">
        <img src="https://dariomnz.github.io/webPlanner/ballerina_icon.svg" alt="Ballerina" style="width: 96px; height: 96px; fill: #fbcfe8;">
        ${classTitle || 'Clase'}
        <img src="https://dariomnz.github.io/webPlanner/ballerina_icon.svg" alt="Ballerina" style="width: 96px; height: 96px; fill: #fbcfe8; transform: scaleX(-1);">
    </h1>
    <ul>
        ${plannedExercises.map(ex => `
            <li>
                <div class="exercise-header">
                    <span class="bullet">•</span>
                    <span class="exercise-section">${ex.section}:</span>
                    <span class="exercise-name">${ex.name}</span>
                </div>
                ${ex.description ? `<div class="exercise-description" style="white-space: pre-wrap;">${ex.description}</div>` : ''}
            </li>
        `).join('')}
    </ul>
</body>
</html>
    `;


    const blob = new Blob([content], { type: 'application/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${classTitle || ' webPlanner'}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const importClassPlan = (file: File): Promise<{ classTitle: string, plannedExercises: PlannedExercise[] }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const content = event.target?.result as string;

                // Check if it's a JSON file first (legacy support or direct JSON export)
                try {
                    const json = JSON.parse(content);
                    if (json.plannedExercises) {
                        resolve(json);
                        return;
                    }
                } catch {
                    // Not a JSON file, continue to HTML parsing
                }

                const parser = new DOMParser();
                const doc = parser.parseFromString(content, 'text/html');

                // Check for embedded JSON (backward compatibility)
                const script = doc.getElementById('webplanner-data');
                if (script && script.textContent) {
                    try {
                        const data = JSON.parse(script.textContent);
                        resolve(data);
                        return;
                    } catch (e) {
                        console.warn('Failed to parse embedded JSON, falling back to HTML parsing');
                    }
                }

                // Parse HTML structure
                const titleElement = doc.querySelector('title');
                const classTitle = titleElement?.textContent || 'Clase Importada';

                const listItems = doc.querySelectorAll('li');
                const plannedExercises: PlannedExercise[] = Array.from(listItems).map((li, index) => {
                    const nameEl = li.querySelector('.exercise-name');
                    const sectionEl = li.querySelector('.exercise-section');
                    const descEl = li.querySelector('.exercise-description');

                    // Extract name and remove the bullet point if present
                    let name = nameEl?.textContent || 'Ejercicio sin nombre';
                    name = name.replace('•', '').trim();

                    const description = descEl?.textContent?.trim();
                    let section = sectionEl?.textContent?.trim() || 'Imported';
                    // Remove trailing colon if present
                    if (section.endsWith(':')) {
                        section = section.slice(0, -1);
                    }

                    return {
                        id: `imported-${Date.now()}-${index}`,
                        name: name,
                        section: section,
                        group: 'Imported',
                        description: description || undefined
                    };
                });

                if (plannedExercises.length > 0) {
                    resolve({ classTitle, plannedExercises });
                } else {
                    reject(new Error('No se encontraron ejercicios en el archivo HTML'));
                }

            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
    });
};

export const exportDataToJson = (data: any, filename: string) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 19).replace('T', '_').replace(/:/g, '-');
    link.download = `${filename}_${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const importDataFromJson = (file: File): Promise<any> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                resolve(json);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
    });
};
