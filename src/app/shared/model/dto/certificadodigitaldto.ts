export class CertificadoDigitalResponseDto {

    public UsuarioCriacaoId: number;
    public UsuarioCriacao: string;
    public DataCriacao: Date;
    public UsuarioModificadorId?: number;
    public UsuarioModificacao?: string;
    public DataModificacao?: Date;
    public Id: number;
    public Arquivo: string;
    public DataVencimento: Date;
    public NomeDono: string;
    public SerialNumber: string;
}