const fs = require('fs');
let text = fs.readFileSync('src/pages/admin/CategoriesPage.tsx', 'utf8');

if (!text.includes('useCategoryById')) {
    text = text.replace(/useCategories, /, 'useCategories, useCategoryById, ');
}

let startIdx = text.indexOf('function EditCategoryDialog');
if (startIdx === -1) {
  console.log('Cant find EditCategoryDialog'); process.exit();
}

let endStr = 'function DeleteCategoryButton';
let endIdx = text.indexOf(endStr, startIdx);

if (endIdx === -1) {
  console.log('Cant find DeleteCategoryButton'); process.exit();
}

let firstPart = text.substring(0, startIdx);
let remainingPart = text.substring(endIdx);

const newFunction = `function EditCategoryDialog({ category }: { category: Category }) {
  const { mutate, isPending } = useUpdateCategory()
  const [open, setOpen] = useState(false)
  const { data: categoryDetail, isLoading } = useCategoryById(open ? category.id : 0)

  const selectedCourseIds = React.useMemo(() => {
    if (Array.isArray(categoryDetail?.cursoIds) && categoryDetail.cursoIds.length > 0) return categoryDetail.cursoIds;
    if (Array.isArray(category.cursoIds) && category.cursoIds.length > 0) return category.cursoIds;

    const fromDetailCourses = categoryDetail?.cursos?.map(c => c.id) ?? []
    if (fromDetailCourses.length > 0) return fromDetailCourses;

    return category.cursos?.map(c => c.id) ?? []
  }, [categoryDetail, category])

  const handleSubmit = (values: FormValues) => {
    mutate(
      { id: category.id, data: values },
      {
        onSuccess: () => {
          toast.success('Categor\\u00EDa actualizada exitosamente')
          setOpen(false)
        },
        onError: err => toast.error(getApiErrorMessage(err, 'Error al actualizar')),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Categor\\u00EDa</DialogTitle>
          <DialogDescription>Modifica los datos de la categor\\u00EDa.</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="py-4 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <CategoryForm
            defaultValues={{
              nombre: categoryDetail?.nombre ?? category.nombre,
              descripcion: categoryDetail?.descripcion ?? category.descripcion ?? '',
              cursoIds: selectedCourseIds,
            }}
            onSubmit={handleSubmit}
            isPending={isPending}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

// -----------------------------------------------------------------------------

`;

fs.writeFileSync('src/pages/admin/CategoriesPage.tsx', firstPart + newFunction + remainingPart, 'utf8');
console.log('done!');
