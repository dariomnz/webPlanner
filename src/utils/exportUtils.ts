import { Exercise, PlannedExercise, Section } from '../types/exercise';

interface BackupData {
    exercises: Exercise[];
    sections: Section[];
    groups: string[];
}

export const exportClassPlan = (classTitle: string, plannedExercises: PlannedExercise[]) => {
    // Define the SVG symbol content (path only)
    const ballerinaPath = `
        <g inkscape:label="Capa 1" inkscape:groupmode="layer" id="layer1">
            <path
                style="opacity:1;fill:#fba7d7;fill-opacity:1;stroke-width:0.227593"
                d="m 129.6,91.9 c 2.9,-6.8 4.9,-13.8 3.8,-21.4 2.4,-4.5 1.6,-8.5 -4.4,-11.8 l -0.6,-3.2 c 1.6,-9.4 5.0,-20.9 4.0,-27.3 -0.4,-3.8 -3.9,-15.8 -6.5,-19.1 -2.7,-1.5 -5.6,-1.9 -7.8,-1.9 -4.7,0.2 -8.9,2.5 -8.5,3.0 0.1,0.9 2.6,0.0 4.8,-0.5 -1.0,1.4 -2.7,2.8 -2.4,3.9 0.9,0.9 5.1,-5.4 6.4,-2.7 -1.1,1.0 -3.4,1.6 -3.3,2.9 0.8,0.6 6.8,-2.1 8.1,-0.9 2.2,1.2 1.7,15.1 2.7,16.6 -0.2,21.8 -5.0,16.0 -6.2,24.9 -3.2,-2.0 -7.7,-2.8 -6.7,-9.6 3.1,-0.8 4.4,-1.6 4.6,-2.3 0.2,-0.9 -0.0,-1.8 -1.0,-2.3 -0.1,-0.3 0.3,-1.1 0.0,-1.4 -0.3,-0.3 -0.3,-0.4 -0.3,-0.7 0.0,-0.4 -0.7,-0.5 -0.9,-1.1 1.7,-2.5 -1.9,-1.8 -2.8,-2.7 -1.9,-8.3 -17.1,-8.2 -18.3,0.8 -8.1,-1.7 -6.1,11.1 1.0,7.6 1.7,4.7 5.1,6.1 9.1,6.3 2.1,2.3 3.4,4.8 0.9,8.5 -7.3,2.1 -14.3,5.2 -22.8,3.3 -7.4,-0.4 -13.4,0.2 -18.8,1.2 -5.9,1.4 -13.1,9.9 -12.6,11.2 0.5,1.2 4.5,-4.3 6.5,-3.9 1.9,0.1 -2.3,3.7 -1.0,4.3 3.8,-3.1 4.8,-3.9 6.5,-6.4 0.6,-0.9 1.6,-1.5 2.7,-1.8 5.8,0.5 11.6,2.0 17.4,1.5 7.0,-0.2 13.9,-0.2 20.8,0.4 10.1,2.7 13.1,11.4 12.2,13.7 -1.4,1.1 -2.8,0.9 -5.2,1.0 -16.8,0.6 -26.6,-0.9 -39.1,-3.1 l 1.2,4.5 c -5.6,-2.1 -16.9,-0.7 -27.1,-0.1 -5.6,-0.1 -6.9,-2.0 -9.7,-2.5 -3.0,-1.1 -5.5,-0.8 -7.9,-0.5 -1.7,1.7 -1.7,2.6 -1.0,4.0 3.8,3.7 11.6,4.9 15.0,3.9 9.4,0.1 19.6,3.5 33.2,4.2 7.2,12.6 18.0,21.6 30.4,29.4 1.2,32.7 -9.0,15.1 0.1,53.1 0.0,0.6 -0.1,1.1 -0.5,1.7 -1.4,0.4 -2.8,0.7 -3.4,2.9 -0.7,2.6 1.6,4.3 2.1,7.3 0.7,4.0 -1.5,8.7 -0.2,11.0 4.0,2.1 9.6,-15.3 8.0,-20.5 -2.3,-23.6 1.4,-27.5 6.5,-49.9 10.1,3.6 30.2,5.3 40.4,-5.9 -11.7,-8.1 -21.8,-17.7 -29.5,-29.7 z"
                id="path1" />
        </g>
    `;

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
    <!-- Define SVG Symbol -->
    <svg width="0" height="0" style="position: absolute;">
        <symbol id="ballerina-icon" viewBox="0 0 200 200">
            ${ballerinaPath}
        </symbol>
    </svg>

    <h1 style="display: flex; align-items: center; justify-content: center; gap: 10px;">
        <svg width="96px" height="96px">
            <use href="#ballerina-icon"></use>
        </svg>
        ${classTitle || 'Clase'}
        <svg width="96px" height="96px" style="transform: scaleX(-1);">
            <use href="#ballerina-icon"></use>
        </svg>
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
                    } catch {
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

export const exportDataToJson = (data: BackupData, filename: string) => {
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

export const importDataFromJson = (file: File): Promise<BackupData> => {
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
