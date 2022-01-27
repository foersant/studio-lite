import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UnitShortData } from '../backend.service';
import { AppService } from '../../app.service';
import { DatastoreService } from '../datastore.service';
import {WorkspaceDataFlat} from "../../app.classes";

@Component({
  templateUrl: './moveunit.component.html'
})
export class MoveUnitComponent implements OnInit {
  objectsDatasource = new MatTableDataSource<UnitShortData>();
  displayedColumns = ['selectCheckbox', 'name'];
  tableSelectionCheckbox = new SelectionModel <UnitShortData>(true, []);
  workspaceList: WorkspaceDataFlat[] = [];
  selectForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private appService: AppService,
    private ds: DatastoreService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.selectForm = this.fb.group({
      wsSelector: this.fb.control(0, [Validators.required, Validators.min(1)])
    });
  }

  ngOnInit(): void {
    if (this.appService.authData.userId > 0) {
      this.appService.authData.workspaces.forEach(wsg => {
        wsg.workspaces.forEach(ws => {
          if (ws.id !== this.data.currentWorkspaceId) {
            this.workspaceList.push(<WorkspaceDataFlat>{
              id: ws.id,
              name: ws.name,
              groupId: wsg.id,
              groupName: wsg.name
            });
          }
        })
      });
    }
    this.objectsDatasource = new MatTableDataSource(this.ds.unitList);
    this.tableSelectionCheckbox.clear();
  }

  isAllSelected(): boolean {
    const numSelected = this.tableSelectionCheckbox.selected.length;
    const numRows = this.objectsDatasource ? this.objectsDatasource.data.length : 0;
    return numSelected === numRows;
  }

  masterToggle(): void {
    this.isAllSelected() || !this.objectsDatasource ?
      this.tableSelectionCheckbox.clear() :
      this.objectsDatasource.data.forEach(row => this.tableSelectionCheckbox.select(row));
  }
}
