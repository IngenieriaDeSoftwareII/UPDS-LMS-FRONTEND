type FormatDocument = {

    pdf: 'pdf',
    doc: 'doc',
    docx: 'docx',
    xls: 'xls',
    xlsx: 'xlsx',
    ppt: 'ppt',
    pptx: 'pptx',
    rar: 'rar',
    zip: 'zip',
    otro: 'otro'
}
//Dto para crear la tarea
export type HomeWorkDto = {
    lessonId: number;
    titulo: string;
    descripcion: string;
    fechaApertura: Date;
    fechaEntrega: Date;
    fechaLimite: Date;
    urlArchivo: string;
    file: File;
    formato: FormatDocument;
    tamanoKb: number;
}
//Dto para actualizar la tarea
export type updateHomeWorkDto = {
    id: number;
    titulo: string;
    descripcion: string;
    fechaApertura: Date;
    fechaEntrega: Date;
    fechaLimite: Date;
    urlArchivo: string;
    file: File;
    formato: FormatDocument;
    tamanoKb: number;
}
//Dto para obtener la tarea
export type getHomeWorkDto = {
    id: number;
    lessonId: number;
    titulo: string;
    descripcion: string;
    fechaApertura: Date;
    fechaEntrega: Date;
    fechaLimite: Date;
    urlArchivo: string;
    file: File;
    formato: FormatDocument;
    tamanoKb: number;
}

export type getUrlHomeWorkDto = {
    url: string;
}