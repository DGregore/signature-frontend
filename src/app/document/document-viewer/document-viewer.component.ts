import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { Subscription, forkJoin, of } from 'rxjs';
import { switchMap, catchError, tap } from 'rxjs/operators';
import { DocumentService } from '../../services/document.service';
import { AuthService } from '../../services/auth.service';
import { Document, DocumentSignatory, SignatureData } from '../../models/document.model';
import { User } from '../../models/user.model';
import { AuditLog } from '../../models/audit-log.model'; // Import AuditLog
import { PdfViewerComponent, PdfViewerModule } from 'ng2-pdf-viewer';
import { OrderByPipe } from '../../pipes/order-by.pipe';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import SignaturePad from 'signature_pad';

interface SignaturePosition {
  page: number;
  x: number;
  y: number;
}

@Component({
  selector: 'app-document-viewer',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PdfViewerModule,
    DatePipe,
    OrderByPipe,
    MatProgressSpinnerModule
  ],
  templateUrl: './document-viewer.component.html',
  styleUrls: ['./document-viewer.component.css']
})
export class DocumentViewComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('signatureCanvas') signatureCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild(PdfViewerComponent) private pdfViewer!: PdfViewerComponent;

  document: Document | null = null;
  pdfSrc: string | Blob | Uint8Array | null = null;
  auditLogs: AuditLog[] = []; // Property for audit logs
  isLoading = false;
  isLoadingLogs = false; // Separate loading state for logs
  errorMessage: string | null = null;
  logsErrorMessage: string | null = null; // Separate error message for logs
  currentUser: User | null = null;
  isUserNextSignatory = false;
  signaturePad!: SignaturePad;
  signaturePosition: SignaturePosition | null = null;

  private routeSub: Subscription | undefined;
  private userSub: Subscription | undefined;
  private currentPageNumber: number = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private documentService: DocumentService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.userSub = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.checkIfUserIsNextSignatory();
    });

    this.routeSub = this.route.paramMap.pipe(
      tap(() => {
        this.isLoading = true;
        this.errorMessage = null;
        this.logsErrorMessage = null;
        this.document = null;
        this.pdfSrc = null;
        this.auditLogs = []; // Reset logs
        this.isUserNextSignatory = false;
        this.signaturePosition = null;
      }),
      switchMap(params => {
        const idParam = params.get('id');
        if (!idParam) {
          this.errorMessage = 'ID do documento não encontrado na rota.';
          this.isLoading = false;
          return of(null);
        }
        const documentId = parseInt(idParam, 10);
        if (isNaN(documentId)) {
          this.errorMessage = 'ID do documento inválido.';
          this.isLoading = false;
          return of(null);
        }

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
        this.fetchAuditLogs(); // Fetch logs after document is loaded
      }
      this.isLoading = false;
    });
  }

  ngAfterViewInit(): void {
    this.initializeSignaturePad();
  }

  initializeSignaturePad(): void {
     // Ensure canvas exists and pad isn't already initialized
     if (this.signatureCanvas && !this.signaturePad) {
        try {
            this.signaturePad = new SignaturePad(this.signatureCanvas.nativeElement);
            this.resizeCanvas();
        } catch (e) {
            console.error("Error initializing SignaturePad:", e);
            // Fallback or retry logic if needed
            setTimeout(() => this.initializeSignaturePad(), 200); // Retry later
        }
     } else if (!this.signatureCanvas) {
         // If canvas isn't available yet, retry after a short delay
         setTimeout(() => this.initializeSignaturePad(), 100);
     }
  }

  resizeCanvas(): void {
    if (!this.signaturePad) return;
    const canvas = this.signatureCanvas.nativeElement;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext('2d')?.scale(ratio, ratio);
    this.signaturePad.clear();
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    this.userSub?.unsubscribe();
  }

  fetchAuditLogs(): void {
    if (!this.document) return;
    this.isLoadingLogs = true;
    this.logsErrorMessage = null;
    this.documentService.getAuditLogs('Document', this.document.id).subscribe({
      next: (logs) => {
        this.auditLogs = logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); // Sort descending
        this.isLoadingLogs = false;
      },
      error: (error) => {
        this.logsErrorMessage = `Erro ao buscar histórico: ${error.message}`;
        this.isLoadingLogs = false;
      }
    });
  }

  // --- PDF Viewer Interaction ---
  onPageRendered(event: any): void {
    this.currentPageNumber = event.pageNumber;
    this.attachClickListenerToPage(event.source.div);
  }

  attachClickListenerToPage(pageDiv: HTMLElement): void {
    if (!pageDiv) return;
    pageDiv.onclick = null;
    pageDiv.onclick = (event: MouseEvent) => {
      if (this.isUserNextSignatory && !this.documentSignedOrRejected()) {
        const rect = pageDiv.getBoundingClientRect();
        const viewerElement = this.pdfViewer.element.nativeElement.querySelector('.ng2-pdf-viewer-container');
        const scrollLeft = viewerElement?.scrollLeft || 0;
        const scrollTop = viewerElement?.scrollTop || 0;

        const x = event.clientX - rect.left + scrollLeft;
        const y = event.clientY - rect.top + scrollTop;

        // Basic scaling attempt (assumes default 72 DPI for PDF)
        // This needs refinement based on actual PDF page size and viewer scale
        const scale = this.pdfViewer.currentScale;
        const pdfPoint = this.pdfViewer.eventBus.pdfViewer.convertClientCoordsToPdfPoint(event.clientX, event.clientY);

        this.signaturePosition = {
          page: this.currentPageNumber,
          // Use pdfPoint if available and reliable, otherwise fallback to relative
          x: pdfPoint ? pdfPoint.x : x / scale, // Approximate PDF X
          y: pdfPoint ? pdfPoint.y : y / scale  // Approximate PDF Y
        };
        console.log('Signature position set (PDF coords approx):', this.signaturePosition);
      }
    };
  }

  // --- Signature Pad Actions ---
  clearSignature(): void {
    if (this.signaturePad) {
      this.signaturePad.clear();
    }
  }

  applySignature(): void {
    if (!this.signaturePad || this.signaturePad.isEmpty() || !this.signaturePosition) {
      this.errorMessage = 'Por favor, desenhe sua assinatura e selecione a posição no PDF.';
      return;
    }
    if (!this.document || !this.currentUser || !this.isUserNextSignatory) {
      this.errorMessage = 'Não é possível assinar este documento agora.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const signatureImageBase64 = this.signaturePad.toDataURL();

    const signatureData: SignatureData = {
      userId: this.currentUser.id,
      timestamp: new Date(),
      signatureImage: signatureImageBase64,
      positionPage: this.signaturePosition.page,
      positionX: this.signaturePosition.x,
      positionY: this.signaturePosition.y
    };

    this.documentService.signDocument(this.document.id, signatureData).subscribe({
      next: (updatedSignatory) => {
        if (this.document) {
          const signatoryIndex = this.document.signatories.findIndex(sig => sig.userId === updatedSignatory.userId);
          if (signatoryIndex !== -1) {
             this.document.signatories[signatoryIndex] = { ...this.document.signatories[signatoryIndex], ...updatedSignatory };
             this.document.signatories = [...this.document.signatories];
          }
          this.checkIfUserIsNextSignatory();
          const allSigned = this.document.signatories.every(s => s.status === 'SIGNED');
          if (allSigned) {
            this.document.status = 'COMPLETED';
          }
          this.fetchAuditLogs(); // Refresh logs after signing
        }
        this.isLoading = false;
        this.clearSignature();
        this.signaturePosition = null;
      },
      error: (error) => {
        this.errorMessage = `Erro ao assinar documento: ${error.message}`;
        this.isLoading = false;
      }
    });
  }

  // --- Helper Methods ---
  checkIfUserIsNextSignatory(): void {
    if (!this.document || !this.currentUser || this.document.status !== 'SIGNING') {
      this.isUserNextSignatory = false;
      return;
    }
    const pendingSignatories = this.document.signatories
      .filter(sig => sig.status === 'PENDING')
      .sort((a, b) => a.order - b.order);
    this.isUserNextSignatory = pendingSignatories.length > 0 && pendingSignatories[0].userId === this.currentUser.id;
    if (this.isUserNextSignatory) {
        this.initializeSignaturePad();
    }
  }

  documentSignedOrRejected(): boolean {
      if (!this.document || !this.currentUser) return true;
      const userSignatory = this.document.signatories.find(s => s.userId === this.currentUser?.id);
      return userSignatory?.status === 'SIGNED' || userSignatory?.status === 'REJECTED';
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
        error: (err: any) => this.errorMessage = `Erro ao baixar documento: ${err.message}`
      });
    }
  }
}

