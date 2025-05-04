import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule for *ngFor
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel
import { SectorService } from '../../services/sector.service';
import { Sector } from '../../models/sector.model'; // Import Sector model for typing

@Component({
  selector: 'app-sector-management',
  standalone: true, // Mark as standalone
  imports: [CommonModule, FormsModule], // Import CommonModule and FormsModule
  templateUrl: './sector-management.component.html',
  styleUrls: ['./sector-management.component.css']
})
export class SectorManagementComponent implements OnInit {
  sectors: Sector[] = []; // Initialize with correct type
  newSector = { name: '', description: '' };

  constructor(private sectorService: SectorService) {}

  ngOnInit() {
    this.loadSectors();
  }

  loadSectors() {
    // Assuming getSectors() returns Observable<Sector[]>
    this.sectorService.getSectors().subscribe((data: Sector[]) => {
      this.sectors = data;
    });
  }

  addSector() {
    // Assuming addSector exists and accepts { name: string, description?: string }
    // Need to verify SectorService implementation later if error persists
    this.sectorService.createSector(this.newSector).subscribe(() => {
      this.loadSectors();
      this.newSector = { name: '', description: '' };
    });
  }

  deleteSector(id: number) {
    // Assuming deleteSector exists and accepts id
    this.sectorService.deleteSector(id).subscribe(() => {
      this.loadSectors();
    });
  }
}

