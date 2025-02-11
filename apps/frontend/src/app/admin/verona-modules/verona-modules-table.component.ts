import {
  AfterViewInit,
  Component, EventEmitter, Inject, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { MatSort } from '@angular/material/sort';
import { Subscription } from 'rxjs';
import {VeronaModuleInListDto, VeronaModuleMetadataDto} from '@studio-lite-lib/api-dto';
import { BackendService } from '../backend.service';

@Component({
  selector: 'app-verona-modules-table',
  templateUrl: './verona-modules-table.component.html'
})
export class VeronaModulesTableComponent implements OnChanges, OnInit, OnDestroy, AfterViewInit {
  @Input() type!: 'player' | 'editor' | 'schemer';
  @Input() downloadPath = '';
  @Output() selectionChanged = new EventEmitter();
  @ViewChild(MatSort) sort = new MatSort();
  objectsDatasource = new MatTableDataSource<VeronaModuleInListDto>();
  tableSelectionCheckboxes = new SelectionModel <VeronaModuleInListDto>(true, []);
  timeZone = 'Europe/Berlin';
  displayedColumns = ['selectCheckbox', 'name', 'id', 'version', 'veronaVersion', 'fileDateTime', 'filesize'];
  private selectionChangedSubscription: Subscription | undefined;

  constructor(
    @Inject('SERVER_URL') public serverUrl: string,
    private bs: BackendService
  ) {
    this.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  ngOnInit(): void {
    this.selectionChangedSubscription = this.tableSelectionCheckboxes.changed.subscribe(() => {
      this.selectionChanged.emit({ type: this.type, selectedModules: this.tableSelectionCheckboxes.selected });
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.updateList();
    });
  }

  updateList() {
    this.bs.getVeronaModuleList(this.type).subscribe(
      (fileData: VeronaModuleInListDto[]) => {
        if (fileData) {
          this.objectsDatasource = new MatTableDataSource(fileData);
          this.objectsDatasource.sortingDataAccessor = (item, property) =>
            (property.includes('.')) ?
              property.split('.')
                .reduce((metaData: unknown ,i: string)=> (metaData as VeronaModuleMetadataDto)[i] , item) :
              (item)[property];
          this.objectsDatasource.sort = this.sort;
        } else {
          this.objectsDatasource = new MatTableDataSource();
        }
      }
    );
  }

  ngOnChanges(): void {
    this.updateList();
  }

  isAllSelected(): boolean {
    const numSelected = this.tableSelectionCheckboxes.selected.length;
    const numRows = this.objectsDatasource ? this.objectsDatasource.data.length : 0;
    return numSelected === numRows;
  }

  masterToggleSelection(): void {
    this.isAllSelected() || !this.objectsDatasource ?
      this.tableSelectionCheckboxes.clear() :
      this.objectsDatasource.data.forEach(row => this.tableSelectionCheckboxes.select(row));
  }

  hasObjects(): boolean {
    if (this.objectsDatasource == null) {
      return false;
    }
    return this.objectsDatasource.data.length > 0;
  }

  ngOnDestroy(): void {
    if (this.selectionChangedSubscription) {
      this.selectionChangedSubscription.unsubscribe();
    }
  }
}
