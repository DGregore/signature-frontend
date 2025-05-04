import { Pipe, PipeTransform } from '@angular/core';
import { DocumentSignatory } from '../models/document.model';

@Pipe({
  name: 'nextSignatory',
  standalone: true // Make pipe standalone
})
export class NextSignatoryPipe implements PipeTransform {

  transform(signatories: DocumentSignatory[] | undefined | null): string {
    if (!signatories || signatories.length === 0) {
      return 'N/A'; // Or empty string
    }

    // Filter pending signatories and sort them by order
    const pendingSignatories = signatories
      .filter(sig => sig.status === 'PENDING')
      .sort((a, b) => a.order - b.order);

    if (pendingSignatories.length > 0) {
      // Return the name or email of the first pending signatory
      const next = pendingSignatories[0];
      // Display name, fallback to email, then ID
      return next.name || next.email || `Usuário ID: ${next.userId}`; 
    } else {
      // If no pending signatories, check overall status (might be completed/rejected)
      // This pipe just finds the *next* in line, so if none are pending, return appropriate text
      return '-'; // Or 'Concluído', 'Rejeitado' based on document status
    }
  }
}

