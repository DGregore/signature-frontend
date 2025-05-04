// Interfaces para Documentos e Assinaturas

export interface DocumentSignatory {
  id?: number; // ID da entrada na tabela de junção (opcional)
  userId: number;
  documentId?: number; // ID do documento (opcional, pode ser inferido)
  order: number; // Ordem de assinatura
  status: 'PENDING' | 'SIGNED' | 'REJECTED'; // Status da assinatura individual
  signedAt?: Date | null; // Data da assinatura/rejeição
  rejectionReason?: string | null; // Motivo da rejeição (opcional)
  // Incluir dados do usuário para exibição (opcional, pode vir do backend)
  name?: string;
  email?: string;
}

export interface Document {
  id: number;
  originalFilename: string; // Nome original do arquivo PDF
  storageFilename: string; // Nome do arquivo no MinIO (geralmente UUID)
  status: 'DRAFT' | 'SIGNING' | 'COMPLETED' | 'REJECTED' | 'CANCELLED'; // Status geral do documento
  ownerId: number; // ID do usuário que fez o upload
  createdAt: Date;
  updatedAt: Date;
  // Relações (geralmente carregadas separadamente ou via JOIN no backend)
  signatories: DocumentSignatory[];
  // Outros metadados opcionais
  title?: string;
  description?: string;
}

// Interface para dados de assinatura (enviado ao assinar)
export interface SignatureData {
  userId: number | null; // ID do usuário que está assinando
  timestamp: Date;
  // Incluir dados adicionais da assinatura, se houver (ex: imagem, confirmação)
  // signatureImage?: string; // Base64 encoded image
}

