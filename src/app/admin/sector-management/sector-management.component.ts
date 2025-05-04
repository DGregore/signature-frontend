import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Keep FormsModule for template-driven approach
import { SectorService } from '../../services/sector.service';
import { Sector } from '../../models/sector.model';

@Component({
  selector: 'app-sector-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sector-management.component.html',
  styleUrls: ['./sector-management.component.css']
})
export class SectorManagementComponent implements OnInit {
  sectors: Sector[] = [];
  currentSector: Omit<Sector, 'id'> & { id?: number } = { name: '', description: '' }; // For add/edit form
  editingSector = false;

  constructor(private sectorService: SectorService) {}

  ngOnInit() {
    this.loadSectors();
  }

  loadSectors() {
    this.sectorService.getSectors().subscribe((data: Sector[]) => {
      this.sectors = data;
    });
  }

  editSector(sector: Sector) {
    this.editingSector = true;
    // Create a copy to avoid modifying the list directly
    this.currentSector = { ...sector };
  }

  cancelEdit() {
    this.editingSector = false;
    this.resetForm();
  }

  resetForm() {
    this.currentSector = { name: '', description: '' };
  }

  saveSector() {
    if (this.editingSector && this.currentSector.id) {
      // Update existing sector
      const { id, ...sectorData } = this.currentSector;
      // Prepare payload for update, potentially omitting description if empty
      const updatePayload: Partial<Omit<Sector, 'id'>> = { name: sectorData.name };
      if (sectorData.description) { // Only include description if it has a value
        updatePayload.description = sectorData.description;
      }
      this.sectorService.updateSector(id, updatePayload).subscribe(() => {
        this.loadSectors();
        this.cancelEdit(); // Reset form and exit edit mode
      });
    } else {
      // Add new sector
      // CORRECTION: Backend DTO for creation only accepts 'name'.
      // Send ONLY the name property, ignore description from the form during creation.
      const newSectorPayload = { name: this.currentSector.name };

      this.sectorService.createSector(newSectorPayload).subscribe(() => {
        this.loadSectors();
        this.resetForm(); // Clear form for next addition
        // Note: Description entered during creation will be ignored by backend.
        // User needs to edit the sector after creation to add/update description.
      });
    }
  }

  confirmDelete(id: number) {
    if (confirm('Tem certeza que deseja excluir este setor? Esta ação não pode ser desfeita.')) {
      this.sectorService.deleteSector(id).subscribe(() => {
        this.loadSectors();
        // If the deleted sector was being edited, cancel edit mode
        if (this.editingSector && this.currentSector.id === id) {
          this.cancelEdit();
        }
      });
    }
  }
}

