import { Sector } from "./sector.model";

// Define UserRole enum here as it's used in the frontend
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string; // Senha é opcional, especialmente ao buscar/exibir
  role: UserRole; // Add role property with the defined enum type
  sector?: Sector; // Relacionamento opcional, pode não vir em todas as buscas
  sectorId?: number; // ID pode ser útil para criação/atualização
}

