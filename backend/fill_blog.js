import fs from 'fs';
import path from 'path';

const blogFileBackend = path.join(process.cwd(), 'blogData.json');
const blogFileFrontend = path.join(process.cwd(), '../frontend/src/blogPosts.json');

let targetFiles = [blogFileBackend, blogFileFrontend];

targetFiles.forEach(file => {
    if (!fs.existsSync(file)) {
        console.warn(`File not found: ${file}`);
        return;
    }
    
    let data = JSON.parse(fs.readFileSync(file, 'utf8'));

    data.forEach(post => {
        // Fix the images for goggins and boss-fights
        if (post.image === '/images/blog/cover-goggins.png') {
            post.image = 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1200&q=80';
        }
        if (post.image === '/images/blog/cover-boss-fight.png') {
            post.image = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80';
        }

        // Default image for categories
        if (!post.image || post.author === 'Reppy Editorial' && (post.image && post.image.includes('placeholder'))) {
             post.image = 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80';
        }

        // Fill empty content
        if (post.locales) {
            Object.keys(post.locales).forEach(lang => {
                const locale = post.locales[lang];
                if (!locale.content || locale.content.length < 100) {
                    const title = locale.title;
                    if (lang === 'es') {
                        locale.content = `\n# ${title}\n\nSi estás buscando mejorar tu rendimiento y llevar tu entrenamiento al siguiente nivel, has llegado al lugar indicado. Este artículo desglosará todos los detalles clave que necesitas saber.\n\n## 1. El Concepto Fundamental\nLa mayoría de las personas comenten el error de saltarse los fundamentos. En la calistenia, la base lo es todo. Necesitas entender la biomecánica, la tensión mecánica y cómo aplicarlo a tus entrenamientos diarios para ver progresos reales rápidos y prevenir lesiones.\n\n*   **Técnica sobre repeticiones**: Nunca sacrifiques forma por ego.\n*   **Progresión Constante**: Añadir dificultad progresivamente es la clave de la hipertrofia.\n*   **Recuperación**: El músculo crece mientras descansas, no cuando entrenas.\n\n## 2. Los Beneficios Principales\nAplicar correctamente estos principios te dará:\n- **Mayor fuerza relativa**: Control absoluto de tu cuerpo.\n- **Prevención de lesiones**: Articulaciones más fuertes.\n- **Mejor estética**: El físico de un gimnasta.\n\n## 3. Implementación Paso a Paso\n1.  **Analiza tu nivel**: Sé honesto contigo mismo.\n2.  **Define el objetivo**: Fuerza, resistencia o trucos.\n3.  **Ejecuta**: Mantén la constancia durante mínimo 8 semanas.\n\n[Regístrate en el Dashboard de Reppy para hacer seguimiento de tus marcas](/dashboard)\n`;
                    } else if (lang === 'en') {
                        locale.content = `\n# ${title}\n\nIf you are looking to improve your performance and take your training to the next level, you have come to the right place. This article will break down all the key details you need to know.\n\n## 1. The Core Concept\nMost people make the mistake of skipping the fundamentals. In calisthenics, the base is everything. You need to understand biomechanics, mechanical tension and how to apply it to your daily workouts to see real fast progress and prevent injuries.\n\n*   **Form over reps**: Never sacrifice form for ego.\n*   **Progressive Overload**: Progressively adding difficulty is the key to hypertrophy.\n*   **Recovery**: Muscle grows while you rest, not when you train.\n\n## 2. Main Benefits\nApplying these principles correctly will give you:\n- **Higher relative strength**: Absolute body control.\n- **Injury prevention**: Stronger joints.\n- **Better aesthetics**: A gymnast's physique.\n\n## 3. Step by Step Implementation\n1.  **Analyze your level**: Be honest with yourself.\n2.  **Define your goal**: Strength, endurance, or skills.\n3.  **Execute**: Stay consistent for at least 8 weeks.\n\n[Sign up at Reppy Dashboard to track your progress](/dashboard)\n`;
                    }
                }
            });
        }
    });

    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
});

console.log('Successfully filled empty blog posts (JSON) and fixed image URLs.');
