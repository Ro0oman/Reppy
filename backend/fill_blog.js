import fs from 'fs';
import path from 'path';

const blogFileBackend = path.join(process.cwd(), 'blogData.js');
const blogFileFrontend = path.join(process.cwd(), '../frontend/src/blogPosts.js');

let targetFiles = [blogFileBackend, blogFileFrontend];

targetFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Fix the images for goggins and boss-fights
    content = content.replace(/'\/images\/blog\/cover-goggins\.png'/g, "'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1200&q=80'");
    content = content.replace(/'\/images\/blog\/cover-boss-fight\.png'/g, "'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80'");

    // Make sure we catch default image assignment for satellites that don't have images
    const regexMissingImage = /author:\s*'Reppy Editorial',\n\s*category:/g;
    content = content.replace(regexMissingImage, "author: 'Reppy Editorial',\n    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80',\n    category:");

    const esRegex = /es:\s*\{\s*title:\s*'([^']+)',\s*(?:excerpt:\s*'[^']+',\s*)?(?:keywords:\s*\[[^\]]+\],\s*)?content:\s*'(.*?)'\s*\}/g;
    const enRegex = /en:\s*\{\s*title:\s*'([^']+)',\s*(?:excerpt:\s*'[^']+',\s*)?(?:keywords:\s*\[[^\]]+\],\s*)?content:\s*'(.*?)'\s*\}/g;

    content = content.replace(esRegex, (match, title, oldContent) => {
        if (oldContent.length > 100) return match; // Already filled
        const newContent = `\\n# ${title}\\n\\nSi estás buscando mejorar tu rendimiento y llevar tu entrenamiento al siguiente nivel, has llegado al lugar indicado. Este artículo desglosará todos los detalles clave que necesitas saber.\\n\\n## 1. El Concepto Fundamental\\nLa mayoría de las personas comenten el error de saltarse los fundamentos. En la calistenia, la base lo es todo. Necesitas entender la biomecánica, la tensión mecánica y cómo aplicarlo a tus entrenamientos diarios para ver progresos reales rápidos y prevenir lesiones.\\n\\n*   **Técnica sobre repeticiones**: Nunca sacrifiques forma por ego.\\n*   **Progresión Constante**: Añadir dificultad progresivamente es la clave de la hipertrofia.\\n*   **Recuperación**: El músculo crece mientras descansas, no cuando entrenas.\\n\\n## 2. Los Beneficios Principales\\nAplicar correctamente estos principios te dará:\\n- **Mayor fuerza relativa**: Control absoluto de tu cuerpo.\\n- **Prevención de lesiones**: Articulaciones más fuertes.\\n- **Mejor estética**: El físico de un gimnasta.\\n\\n## 3. Implementación Paso a Paso\\n1.  **Analiza tu nivel**: Sé honesto contigo mismo.\\n2.  **Define el objetivo**: Fuerza, resistencia o trucos.\\n3.  **Ejecuta**: Mantén la constancia durante mínimo 8 semanas.\\n\\n[Regístrate en el Dashboard de Reppy para hacer seguimiento de tus marcas](/dashboard)\\n`;
        return match.replace(`'${oldContent}'`, '`' + newContent + '`');
    });

    content = content.replace(enRegex, (match, title, oldContent) => {
        if (oldContent.length > 100) return match; // Already filled
        const newContent = `\\n# ${title}\\n\\nIf you are looking to improve your performance and take your training to the next level, you have come to the right place. This article will break down all the key details you need to know.\\n\\n## 1. The Core Concept\\nMost people make the mistake of skipping the fundamentals. In calisthenics, the base is everything. You need to understand biomechanics, mechanical tension and how to apply it to your daily workouts to see real fast progress and prevent injuries.\\n\\n*   **Form over reps**: Never sacrifice form for ego.\\n*   **Progressive Overload**: Progressively adding difficulty is the key to hypertrophy.\\n*   **Recovery**: Muscle grows while you rest, not when you train.\\n\\n## 2. Main Benefits\\nApplying these principles correctly will give you:\\n- **Higher relative strength**: Absolute body control.\\n- **Injury prevention**: Stronger joints.\\n- **Better aesthetics**: A gymnast\\'s physique.\\n\\n## 3. Step by Step Implementation\\n1.  **Analyze your level**: Be honest with yourself.\\n2.  **Define your goal**: Strength, endurance, or skills.\\n3.  **Execute**: Stay consistent for at least 8 weeks.\\n\\n[Sign up at Reppy Dashboard to track your progress](/dashboard)\\n`;
        return match.replace(`'${oldContent}'`, '`' + newContent + '`');
    });

    fs.writeFileSync(file, content, 'utf8');
});
console.log('Successfully filled empty blog posts and fixed image URLs.');
