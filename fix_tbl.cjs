const fs = require('fs');
let path = 'src/pages/admin/CategoriesPage.tsx';
let content = fs.readFileSync(path, 'utf8');

// Also update the empty span and the edit modal logic
content = content.replace(/colSpan=\{3\}/, 'colSpan={4}');
content = content.replace(/No se encontraron categor\u00C3\u00ADas./g, 'No se encontraron categorías.');
content = content.replace(/TableHead>Descripci.*?n<\/TableHead>/, 'TableHead>Descripción</TableHead>');
fs.writeFileSync(path, content, 'utf8');
