const fs = require('fs');

let path = 'src/pages/admin/CategoriesPage.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add Cursos Header 
if(!content.includes('<TableHead>Cursos</TableHead>')){
    content = content.replace(/<TableHead>Descripci.*?n<\/TableHead>/g, '<TableHead>Descripción</TableHead>\n                    <TableHead>Cursos</TableHead>');
}

// 2. Add Cursos Cell
if(!content.includes('category.Cursos?.map')){
    content = content.replace(/<TableCell>{catalog.descripcion \|\| '-'}.*?<\/TableCell>/, ''); // remove wrong replace if any
    content = content.replace(/<TableCell>{category.descripcion \|\| '-'}.*?<\/TableCell>/, `<TableCell>{category.descripcion || '-'}</TableCell>\n                        <TableCell>{(category.cursos || category.Cursos || []).map(c => c.titulo).join(', ') || '-'}</TableCell>`);
}

fs.writeFileSync(path, content, 'utf8');
console.log('done!');
