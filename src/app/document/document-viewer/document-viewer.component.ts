import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router'; // Import RouterModule
import { CommonModule, DatePipe } from '@angular/common'; // Import CommonModule and DatePipe
import { Subscription, forkJoin, of } from 'rxjs';
import { switchMap, catchError, tap } from 'rxjs/operators';
import { DocumentService } from '../../services/document.service';
import { AuthService } from '../../services/auth.service';
import { Document, DocumentSignatory, SignatureData } from '../../models/document.model';
import { User } from '../../models/user.model';
import { PdfViewerModule } from 'ng2-pdf-viewer'; // Import PdfViewerModule
import { OrderByPipe } from '../../pipes/order-by.pipe'; // Import pipe
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // For loading indicator

@Component({
  selector: 'app-document-viewer',
  standalone: true, // Make component standalone
  imports: [
    CommonModule, // Import CommonModule for *ngIf, *ngFor
    RouterModule, // Import RouterModule for routerLink
    PdfViewerModule, // Import PdfViewerModule for <pdf-viewer>
    DatePipe, // Import DatePipe for date formatting
    OrderByPipe, // Import custom pipe
    MatProgressSpinnerModule // Import for loading indicator
  ],
  templateUrl: './document-viewer.component.html',
  styleUrls: ['./document-viewer.component.css']
})
export class DocumentViewComponent implements OnInit, OnDestroy {
  document: Document | null = null;
  pdfSrc: string | Blob | Uint8Array | null = null;
  isLoading = false;
  errorMessage: string | null = null;
  currentUser: User | null = null;
  isUserNextSignatory = false;
  signActionRequested = false;

  private routeSub: Subscription | undefined;
  private userSub: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private documentService: DocumentService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.userSub = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.checkIfUserIsNextSignatory(); // Check again if user changes
    });

    this.routeSub = this.route.paramMap.pipe(
      tap(() => {
        this.isLoading = true;
        this.errorMessage = null;
        this.document = null;
        this.pdfSrc = null;
        this.isUserNextSignatory = false;
      }),
      switchMap(params => {
        const idParam = params.get('id');
        if (!idParam) {
          this.errorMessage = 'ID do documento não encontrado na rota.';
          this.isLoading = false;
          return of(null); // Or throw error
        }
        const documentId = parseInt(idParam, 10);
        if (isNaN(documentId)) {
          this.errorMessage = 'ID do documento inválido.';
          this.isLoading = false;
          return of(null);
        }

        // Check for query param to trigger sign action
        this.signActionRequested = this.route.snapshot.queryParamMap.get('action') === 'sign';

        // Fetch document metadata and PDF blob in parallel
        return forkJoin({
          doc: this.documentService.getDocument(documentId),
          pdf: this.documentService.downloadDocument(documentId)
        }).pipe(
          catchError(error => {
            this.errorMessage = `Erro ao carregar documento: ${error.message}`;
            this.isLoading = false;
            return of(null);
          })
        );
      })
    ).subscribe(result => {
      if (result) {
        this.document = result.doc;
        this.pdfSrc = result.pdf;
        this.checkIfUserIsNextSignatory();
      }
      this.isLoading = false;
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    this.userSub?.unsubscribe();
  }

  checkIfUserIsNextSignatory(): void {
    if (!this.document || !this.currentUser || this.document.status !== 'SIGNING') {
      this.isUserNextSignatory = false;
      return;
    }

    const pendingSignatories = this.document.signatories
      .filter(sig => sig.status === 'PENDING')
      .sort((a, b) => a.order - b.order);

    if (pendingSignatories.length > 0) {
      this.isUserNextSignatory = pendingSignatories[0].userId === this.currentUser.id;
    } else {
      this.isUserNextSignatory = false;
    }
  }

  signDocument(): void {
    if (!this.document || !this.currentUser || !this.isUserNextSignatory) {
      this.errorMessage = 'Não é possível assinar este documento agora.';
      return;
    }

    this.isLoading = true; // Indicate signing process
    this.errorMessage = null;

    const signatureData: SignatureData = {
      userId: this.currentUser.id,
      timestamp: new Date()
      // Add other signature details if needed
    };

    this.documentService.signDocument(this.document.id, signatureData).subscribe({
      next: (updatedSignatory) => {
        // Update the local document state to reflect the signature
        if (this.document) {
          const signatoryIndex = this.document.signatories.findIndex(sig => sig.userId === updatedSignatory.userId);
          if (signatoryIndex !== -1) {
            this.document.signatories[signatoryIndex] = { ...this.document.signatories[signatoryIndex], ...updatedSignatory };
          }
          // Optionally, re-fetch the whole document to get updated overall status
          this.documentService.getDocument(this.document.id).subscribe(doc => this.document = doc);
        }
        this.isUserNextSignatory = false; // No longer the next signatory
        this.isLoading = false;
        this.signActionRequested = false; // Reset flag
        // Optionally show success message
      },
      error: (error) => {
        this.errorMessage = `Erro ao assinar documento: ${error.message}`;
        this.isLoading = false;
      }
    });
  }

  downloadCurrentDocument(): void {
    if (!this.document) return;
    const filename = this.document.originalFilename || `document_${this.document.id}.pdf`;
    if (this.pdfSrc instanceof Blob) {
      const url = window.URL.createObjectURL(this.pdfSrc);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } else {
      // If pdfSrc is not a blob (e.g., if download failed initially), try downloading again
      this.documentService.downloadDocument(this.document.id).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          a.remove();
        },
        error: (err) => this.errorMessage = `Erro ao baixar documento: ${err.message}`
      });
    }
  }
}

