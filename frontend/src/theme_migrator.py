import os
import re

color_map = {
    # Text
    r'\btext-white\b': 'text-zinc-900 dark:text-white',
    r'\btext-zinc-400\b': 'text-zinc-500 dark:text-zinc-400',
    r'\btext-zinc-300\b': 'text-zinc-600 dark:text-zinc-300',
    r'\btext-zinc-500\b': 'text-zinc-400 dark:text-zinc-500',
    r'\btext-zinc-100\b': 'text-zinc-800 dark:text-zinc-100',
    
    # Backgrounds
    r'\bbg-zinc-900\b': 'bg-white dark:bg-zinc-900',
    r'\bbg-zinc-800\b': 'bg-zinc-100 dark:bg-zinc-800',
    r'\bbg-zinc-950/20\b': 'bg-zinc-100/50 dark:bg-zinc-950/20',
    r'\bbg-zinc-900/50\b': 'bg-white/50 dark:bg-zinc-900/50',
    r'\bbg-black/40\b': 'bg-black/5 dark:bg-black/40',
    r'\bbg-black/20\b': 'bg-white/20 dark:bg-black/20',
    r'\bbg-white/\[0\.02\]\b': 'bg-black/[0.02] dark:bg-white/[0.02]',
    
    # Borders
    r'\bborder-white/10\b': 'border-zinc-200 dark:border-white/10',
    r'\bborder-white/5\b': 'border-zinc-200 dark:border-white/5',
    r'\bborder-zinc-800\b': 'border-zinc-300 dark:border-zinc-800',
}

def process_file(filepath):
    if not filepath.endswith('.vue'): return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    for pattern, replacement in color_map.items():
        # Avoid double replacing if it's already there
        # For example, if "dark:text-white" is already present, don't change "text-white" next to it.
        # It's tricky with simple regex. Let's do a basic replace but check if we didn't accidentally prefix twice
        content = re.sub(pattern, replacement, content)
        
    # Cleanup any accidental double 'dark:' 
    content = re.sub(r'text-zinc-900 dark:text-zinc-900 dark:text-white', 'text-zinc-900 dark:text-white', content)
    content = re.sub(r'dark:text-zinc-900 dark:text-white', 'dark:text-white', content)
    
    if original != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk('c:/Users/talia/Desktop/cosas del bubu/Reppy/frontend/src'):
    for file in files:
        process_file(os.path.join(root, file))
