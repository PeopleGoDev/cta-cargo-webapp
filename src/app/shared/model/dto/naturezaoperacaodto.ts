export class NaturezaCargaResponseDto {
    public NaturezaCargaId: number
    public Codigo: string
    public Descricao: string
}

export class NaturezaCargaInsertRequestDto {
    public Codigo: string
    public Descricao: string
}

export class NaturezaCargaUpdateRequestDto {
    public NaturezaCargaId: number
    public Descricao: string
}