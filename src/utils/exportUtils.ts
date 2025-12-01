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
        .exercise-name {
            font-weight: bold;
            font-size: 1.2em;
            color: #1f2937;
            margin-bottom: 5px;
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
                <div class="exercise-name"><span class="bullet">•</span>${ex.name}</div>
                ${ex.description ? `<div class="exercise-description">${ex.description}</div>` : ''}
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
