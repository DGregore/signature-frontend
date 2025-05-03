import { Component, OnInit } from '@angular/core';
import { SectorService } from '../../services/sector.service';

@Component({
  selector: 'app-sector-management',
  templateUrl: './sector-management.component.html',
  styleUrls: ['./sector-management.component.css']
})
export class SectorManagementComponent implements OnInit {
  sectors = [];
  newSector = { name: '', description: '' };

  constructor(private sectorService: SectorService) {}

  ngOnInit() {
    this.loadSectors();
  }

  loadSectors() {
    this.sectorService.getSectors().subscribe((data) => {
      this.sectors = data;
    });
  }

  addSector() {
    this.sectorService.addSector(this.newSector).subscribe(() => {
      this.loadSectors();
      this.newSector = { name: '', description: '' };
    });
  }

  deleteSector(id: number) {
    this.sectorService.deleteSector(id).subscribe(() => {
      this.loadSectors();
    });
  }
}
