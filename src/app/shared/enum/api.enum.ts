import { FileDestinationMap, RecordStatus } from "../proxy/ctaapi";

export class LocalFileDestinationMap {
    static CiaAerea: FileDestinationMap = FileDestinationMap._0;
    static AgenteDeCarga: FileDestinationMap = FileDestinationMap._1;
    static User: FileDestinationMap = FileDestinationMap._2;
    static enum: string[] = ['Companhia Aérea', 'Agente de Carga', 'User'];
  }
  
  export class LocalRecordStatus {
    static Insuficient: RecordStatus = RecordStatus._0;
    static ReadyForUpload: RecordStatus = RecordStatus._1;
    static ReceivedByRFB: RecordStatus = RecordStatus._2;
    static enum: string[] = ['Informações Pendentes', 'Pronto para Envio', 'Recebido pela RFB'];
  }

  export class LocalSituacaoRfb {
    static NoSubmitted: number = 0;
    static Received: number = 1;
    static Processed: number = 2;
    static Rejected: number = 3;
    static ReceivedDeletion: number = 4;
    static ProcessedDeletion: number = 5;
    static enum: string[] = ['Não Enviado', 'Recebido pela RFB', 'Rejeitado pela RFB', 'Processado pela RFB', 'Deletion Recebida pela RFB', 'Deletion Processado pela RFB'];
  }