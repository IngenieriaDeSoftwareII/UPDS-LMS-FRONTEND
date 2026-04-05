const fs = require('fs');
let text = fs.readFileSync('src/pages/admin/CatalogsPage.tsx', 'utf8');

let startIdx = text.indexOf('function EditCatalogDialog');
let endStr = 'function DeleteCatalogButton';
let endIdx = text.indexOf(endStr, startIdx);

if (startIdx === -1 || endIdx === -1) {
  console.log('Cant find marks'); process.exit();
}

let firstPart = text.substring(0, startIdx);
let remainingPart = text.substring(endIdx);

const newFunction = `function EditCatalogDialog({ catalog }: { catalog: Catalog }) {
  const { mutate, isPending } = useUpdateCatalog()
  const [open, setOpen] = useState(false)
  const { data: catalogDetail, isLoading } = useCatalogById(open ? catalog.id : 0)

  const selectedCategoryIds = React.useMemo(() => {
    if (Array.isArray(catalogDetail?.categoriaIds) && catalogDetail.categoriaIds.length > 0) {
      return catalogDetail.categoriaIds
    }
    if (Array.isArray(catalog.categoriaIds) && catalog.categoriaIds.length > 0) {
      return catalog.categoriaIds
    }

    const fromDetailCategories = catalogDetail?.categorias?.map(c => c.id) ?? []
    if (fromDetailCategories.length > 0) {
      return fromDetailCategories
    }

    return catalog.categorias?.map(c => c.id) ?? []
  }, [catalogDetail, catalog])

  const handleSubmit = (values: FormValues) => {
    const tipo = catalogDetail?.tipo || catalog.tipo || \`TIPO_\${Math.random().toString(36).slice(2, 10).toUpperCase()}\`
    const valor = catalogDetail?.valor || catalog.valor || values.nombre
    mutate(
      { id: catalog.id, data: { id: catalog.id, ...values, tipo, valor } as any },
      {
        onSuccess: () => {
          toast.success('Cat\\u00E1logo actualizado exitosamente')
          setOpen(false)
        },
        onError: err => toast.error(getApiErrorMessage(err, 'Error al actualizar')),
      },
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
          <DialogTitle>Editar Cat\\u00E1logo</DialogTitle>
          <DialogDescription>Modifica los datos del cat\\u00E1logo.</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="py-4 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <CatalogForm
            defaultValues={{
              nombre: catalogDetail?.nombre ?? catalog.nombre,
              tipo: catalogDetail?.tipo ?? catalog.tipo,
              descripcion: catalogDetail?.descripcion ?? catalog.descripcion ?? '',
              categoriaIds: selectedCategoryIds,
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

fs.writeFileSync('src/pages/admin/CatalogsPage.tsx', firstPart + newFunction + remainingPart, 'utf8');
console.log('done!');
