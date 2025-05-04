import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router'; // Import RouterModule
import { CommonModule, DatePipe } from '@angular/common'; // Import CommonModule and DatePipe
import { Subscription, catchError } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { DocumentService } from '../../services/document.service';
import { AuthService } from '../../services/auth.service';
import { Document } from '../../models/document.model';
import { User } from '../../models/user.model';
import { NextSignatoryPipe } from '../../pipes/next-signatory.pipe'; // Import pipe
import { OrderByPipe } from '../../pipes/order-by.pipe'; // Import pipe

@Component({
  selector: 'app-document-list',
  standalone: true, // Make component standalone
  imports: [
    CommonModule, // Import CommonModule for *ngIf, *ngFor
    RouterModule, // Import RouterModule for routerLink
    DatePipe, // Import DatePipe for date formatting
    NextSignatoryPipe, // Import custom pipe
    OrderByPipe // Import custom pipe
  ],
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.css']
})
export class DocumentListComponent implements OnInit, OnDestroy {
  documents: Document[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  listType: 'my' | 'pending' | 'all' = 'all'; // Default or determined by route
  currentUser: User | null = null;
  private routeSub: Subscription | undefined;
  private userSub: Subscription | undefined;

  constructor(
    private documentService: DocumentService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.userSub = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      // Re-fetch documents if user changes or on initial load
      if (this.routeSub) { // Avoid fetching before route is processed
        this.fetchDocuments();
      }
    });

    this.routeSub = this.route.url.pipe(
      switchMap(urlSegments => {
        // Determine list type from URL, e.g., /documents/my, /documents/pending
        const path = urlSegments.length > 0 ? urlSegments[urlSegments.length - 1].path : 'all';
        this.listType = path === 'my' ? 'my' : path === 'pending' ? 'pending' : 'all';
        return this.fetchDocuments(); // Return the observable from fetchDocuments
      })
    ).subscribe(); // Subscribe to trigger the fetch
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    this.userSub?.unsubscribe();
  }

  fetchDocuments(): Observable<Document[]> { // Return Observable for switchMap
    if (!this.currentUser && (this.listType === 'my' || this.listType === 'pending')) {
      this.errorMessage = 'Usuário não autenticado.';
      this.documents = [];
      return of([]); // Return empty observable if no user
    }

    this.isLoading = true;
    this.errorMessage = null;
    let filters: any = {};

    if (this.listType === 'my') {
      filters.ownerId = this.currentUser?.id;
    } else if (this.listType === 'pending') {
      filters.status = 'SIGNING'; // Assuming 'SIGNING' is the status for pending docs
      filters.pendingFor = this.currentUser?.id;
    }
    // 'all' type has no specific filters here, backend might apply role-based filtering

    return this.documentService.getDocuments(filters).pipe(
      tap(docs => {
        this.documents = docs;
        this.isLoading = false;
      }),
      catchError((error: any) => {
        this.errorMessage = `Erro ao buscar documentos: ${error.message}`;
        this.isLoading = false;
        this.documents = [];
        return of([]); // Return empty observable on error
      })
    );
  }

  viewDocument(id: number): void {
    this.router.navigate(['/documents', id, 'view']);
  }

  downloadDocument(id: number, filename: string): void {
    this.documentService.downloadDocument(id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || `document_${id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      },
      error: (err: any) => this.errorMessage = `Erro ao baixar documento: ${err.message}`
    });
  }

  // Placeholder for sign action - likely redirects to view page where signing happens
  signDocument(id: number): void {
    this.router.navigate(['/documents', id, 'view'], { queryParams: { action: 'sign' } });
  }
}

// Need to import Observable and of from rxjs
import { Observable, of, tap } from 'rxjs';

