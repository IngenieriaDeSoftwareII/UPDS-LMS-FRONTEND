const fs = require('fs');

function fixFile(path) {
    let content = fs.readFileSync(path, 'utf8');
    content = content.replace(/\\u00ED/g, 'í');
    content = content.replace(/\\u00E1/g, 'á');
    content = content.replace(/Categor\u00C3\u00ADa/g, 'Categoría');
    content = content.replace(/Categor\u00C3\u00ADas/g, 'Categorías');
    content = content.replace(/Descripci\u00C3\u00B3n/g, 'Descripción');
    // Also inject id and fix mapped property "Cursos"
    
    // Fix Edit Payload
    content = content.replace(/mutate\(\s*\{\s*id:\s*category\.id,\s*data:\s*values\s*\}\s*,/g, 'mutate({ id: category.id, data: { id: category.id, ...values } },');

    // Fix selectedCourseIds Memo to catch "Cursos" (capitalized)
    content = content.replace(/categoryDetail\?\.cursos\?\.map/g, '(categoryDetail?.cursos || categoryDetail?.Cursos || [])?.map');
    content = content.replace(/category\.cursos\?\.map/g, '(category.cursos || category.Cursos || [])?.map');
    
    fs.writeFileSync(path, content, 'utf8');
}

fixFile('src/pages/admin/CategoriesPage.tsx');

let contentTypes = fs.readFileSync('src/types/category.ts', 'utf8');
if (!contentTypes.includes('Cursos?:')) {
    contentTypes = contentTypes.replace('cursos?:', 'cursos?: Array<{ id: number; titulo: string }>;\n  Cursos?:');
    fs.writeFileSync('src/types/category.ts', contentTypes, 'utf8');
}
console.log("Done");
