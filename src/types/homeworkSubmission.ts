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
//Dto para obtener la tarea
export type homeWorkSubmissionDto = {
    id: number;
    homeworkId: number;
    homeworkTitulo: string;
    usuarioId: number;
    urlArchivo: string;
    formato: FormatDocument;
    tamanoKb: number;
    comentario: string;
    revisado: boolean;
    fechaEntrega: Date;
    feedback: string;
    estado: string;
    estudianteNombre: string;
}

//Dto para entregar la tarea
export type submitHomeWorkDto = {
    homeworkId: number;
    urlArchivo: string;
    file: File;
    formato: FormatDocument;
    tamanoKb: number;
    comentario: string;
}
//Dto para revisar la tarea
export type gradeHomeWorkDto = {
    submissionId: number;
    revisado: boolean;
    feedback: string;
}

export type urlHomeWorkSubmissionDto = {
    url: string;
}