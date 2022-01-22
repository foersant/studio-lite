import { MatTableDataSource } from '@angular/material/table';
import { ViewChild, Component, OnInit } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { FormGroup } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
  MessageDialogComponent,
  MessageDialogData,
  MessageType
} from "@studio-lite/iqb-components";
import {
  BackendService,
} from '../backend.service';
import { MainDatastoreService } from '../../maindatastore.service';
import {CreateUserDto, UserFullDto, UserInListDto, WorkspaceInListDto} from "@studio-lite-lib/api-admin";
import {EditUserComponent} from "./edituser.component";
import { WorkspaceGroupToCheckCollection} from "../workspaces/workspaceChecked";

@Component({
  templateUrl: './users.component.html',
  styles: [
    '.scroll-area {height: calc(100% - 35px); overflow-y: auto;}',
    '.object-list {height: calc(100% - 5px);}'
  ]
})
export class UsersComponent implements OnInit {
  dataLoading = false;
  objectsDatasource = new MatTableDataSource<UserInListDto>();
  displayedColumns = ['selectCheckbox', 'name', 'description'];
  tableselectionCheckbox = new SelectionModel <UserInListDto>(true, []);
  tableselectionRow = new SelectionModel <UserInListDto>(false, []);
  selectedUser = 0;

  userWorkspaces = new WorkspaceGroupToCheckCollection([]);

  @ViewChild(MatSort, { static: true }) sort = new MatSort();

  constructor(
    private mds: MainDatastoreService,
    private bs: BackendService,
    private newuserDialog: MatDialog,
    private newpasswordDialog: MatDialog,
    private deleteConfirmDialog: MatDialog,
    private editUserDialog: MatDialog,
    private confirmDialog: MatDialog,
    private superadminPasswordDialog: MatDialog,
    private messsageDialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.tableselectionRow.changed.subscribe(
      r => {
        if (r.added.length > 0) {
          this.selectedUser = r.added[0].id;
        } else {
          this.selectedUser = 0;
        }
        this.updateWorkspaceList();
      }
    );
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.createWorkspaceList();
      this.mds.pageTitle = 'Admin: Nutzer:innen';
    });
  }

  // ***********************************************************************************
  addObject(): void {
    const dialogRef = this.editUserDialog.open(EditUserComponent, {
      width: '600px',
      data: {
        newUser: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (typeof result !== 'undefined') {
        if (result !== false) {
          this.dataLoading = true;
          const userData: CreateUserDto = {
            name: (<FormGroup>result).get('name')?.value,
            password: (<FormGroup>result).get('password')?.value,
            isAdmin: (<FormGroup>result).get('isAdmin')?.value,
            description: (<FormGroup>result).get('description')?.value
          };
          this.bs.addUser(userData).subscribe(
            respOk => {
              this.updateObjectList();
              this.dataLoading = false;
              if (respOk) {
                this.snackBar.open('Nutzer:in angelegt', '', { duration: 1000 });
              } else {
                this.snackBar.open('Konnte Nutzer:in nicht anlegen', 'Fehler', { duration: 3000 });
              }
              this.dataLoading = false;
            },
            err => {
              this.snackBar.open(`Konnte Nutzer:in nicht anlegen (${err.code})`, 'Fehler', { duration: 3000 });
              this.dataLoading = false;
            }
          );
        }
      }
    })
  }


  changeData(): void {
    let selectedRows = this.tableselectionRow.selected;
    if (selectedRows.length === 0) {
      selectedRows = this.tableselectionCheckbox.selected;
    }
    if (selectedRows.length === 0) {
      this.messsageDialog.open(MessageDialogComponent, {
        width: '400px',
        data: <MessageDialogData>{
          title: 'Nutzerdaten ändern',
          content: 'Bitte markieren Sie erst eine/n Nutzer:in!',
          type: MessageType.error
        }
      });
    } else {
      const dialogRef = this.editUserDialog.open(EditUserComponent, {
        width: '600px',
        data: {
          newUser: false,
          name: selectedRows[0].name,
          description: selectedRows[0].description,
          isAdmin: selectedRows[0].isAdmin
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (typeof result !== 'undefined') {
          if (result !== false) {
            this.dataLoading = true;
            const newPassword: string = (<FormGroup>result).get('password')?.value;
            const newName: string = (<FormGroup>result).get('name')?.value;
            const newDescription: string = (<FormGroup>result).get('description')?.value;
            const newIsAdmin: boolean = (<FormGroup>result).get('isAdmin')?.value;
            const changedData: UserFullDto = { id: selectedRows[0].id };
            if (newName !== selectedRows[0].name) changedData.name = newName;
            if (newDescription !== selectedRows[0].description) changedData.description = newDescription;
            if (newPassword) changedData.password = newPassword;
            if (newIsAdmin !== selectedRows[0].isAdmin) changedData.isAdmin = newIsAdmin;
            this.bs.changeUserData(changedData).subscribe(
              respOk => {
                this.updateObjectList();
                this.dataLoading = false;
                if (respOk) {
                  this.snackBar.open('Nutzerdaten geändert', '', { duration: 1000 });
                } else {
                  this.snackBar.open('Konnte Nutzerdaten nicht ändern', 'Fehler', { duration: 3000 });
                }
                this.dataLoading = false;
              },
              err => {
                this.snackBar.open(`Konnte Nutzerdaten nicht ändern (${err.code})`, 'Fehler', { duration: 3000 });
                this.dataLoading = false;
              }
            );
          }
        }
      })
    }
  }

  deleteObject(): void {
    let selectedRows = this.tableselectionCheckbox.selected;
    if (selectedRows.length === 0) {
      selectedRows = this.tableselectionRow.selected;
    }
    if (selectedRows.length === 0) {
      this.messsageDialog.open(MessageDialogComponent, {
        width: '400px',
        data: <MessageDialogData>{
          title: 'Löschen von Nutzer:innen',
          content: 'Bitte markieren Sie erst Nutzer:innen!',
          type: MessageType.error
        }
      });
    } else {
      let prompt = 'Soll';
      if (selectedRows.length > 1) {
        prompt = `${prompt}en ${selectedRows.length} Nutzer:innen `;
      } else {
        prompt = `${prompt} Nutzer:in "${selectedRows[0].name}" `;
      }
      const dialogRef = this.deleteConfirmDialog.open(ConfirmDialogComponent, {
        width: '400px',
        data: <ConfirmDialogData>{
          title: 'Löschen von Nutzer:innen',
          content: `${prompt}gelöscht werden?`,
          confirmbuttonlabel: 'Löschen',
          showcancel: true
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result === true) {
          // =========================================================
          this.dataLoading = true;
          const usersToDelete: number[] = [];
          selectedRows.forEach((r: UserInListDto) => usersToDelete.push(r.id));
          this.bs.deleteUsers(usersToDelete).subscribe(
            respOk => {
              if (respOk) {
                this.snackBar.open('Nutzer:in gelöscht', '', { duration: 1000 });
                this.updateObjectList();
                this.dataLoading = false;
              } else {
                this.snackBar.open('Konnte Nutzer:in nicht löschen', 'Fehler', { duration: 3000 });
                this.dataLoading = false;
              }
            },
            err => {
              this.snackBar.open(`Konnte Nutzer:in nicht löschen (${err.code})`, 'Fehler', { duration: 3000 });
              this.dataLoading = false;
            }
          );
        }
      });
    }
  }

  // ***********************************************************************************
  updateWorkspaceList(): void {
    if (this.userWorkspaces.hasChanged) {
      this.snackBar.open(`Zugriffsrechte nicht gespeichert.`, 'Warnung', { duration: 3000 });
    }
    if (this.selectedUser > 0) {
      this.dataLoading = true;
      this.bs.getWorkspacesByUser(this.selectedUser).subscribe(
        (dataresponse: WorkspaceInListDto[]) => {
          this.userWorkspaces.setChecks(dataresponse);
          this.dataLoading = false;
        }, () => {
          this.dataLoading = false;
        }
      );
    } else {
      this.userWorkspaces.setChecks();
    }
  }

  saveWorkspaces(): void {
    if (this.selectedUser > 0) {
      if (this.userWorkspaces.hasChanged) {
        this.dataLoading = true;
        this.bs.setWorkspacesByUser(this.selectedUser, this.userWorkspaces.getChecks()).subscribe(
          respOk => {
            if (respOk) {
              this.snackBar.open('Zugriffsrechte geändert', '', { duration: 1000 });
              this.userWorkspaces.setHasChangedFalse();
            } else {
              this.snackBar.open('Konnte Zugriffsrechte nicht ändern', 'Fehler', { duration: 3000 });
            }
            this.dataLoading = false;
          },
          err => {
            this.snackBar.open(`Konnte Zugriffsrechte nicht ändern (${err.code})`, 'Fehler', { duration: 3000 });
            this.dataLoading = false;
          }
        );
      }
    }
  }

  // ***********************************************************************************
  updateObjectList(): void {
    this.selectedUser = 0;
    this.dataLoading = true;
    this.bs.getUsers().subscribe(
      (dataresponse: UserInListDto[]) => {
        this.objectsDatasource = new MatTableDataSource(dataresponse);
        this.objectsDatasource.sort = this.sort;
        this.tableselectionCheckbox.clear();
        this.tableselectionRow.clear();
        this.dataLoading = false;
      }, () => {
        // this.ass.updateAdminStatus('', '', [], err.label);
        this.tableselectionCheckbox.clear();
        this.tableselectionRow.clear();
        this.dataLoading = false;
      }
    )
  }

  createWorkspaceList(): void {
    this.userWorkspaces = new WorkspaceGroupToCheckCollection([]);
    this.bs.getWorkspacesGroupwise().subscribe(worksGroups => {
      this.userWorkspaces = new WorkspaceGroupToCheckCollection(worksGroups);
      this.updateObjectList()
    })
  }

  isAllSelected(): boolean {
    const numSelected = this.tableselectionCheckbox.selected.length;
    const numRows = this.objectsDatasource ? this.objectsDatasource.data.length : 0;
    return numSelected === numRows;
  }

  masterToggle(): void {
    this.isAllSelected() || !this.objectsDatasource ?
      this.tableselectionCheckbox.clear() :
      this.objectsDatasource.data.forEach(row => this.tableselectionCheckbox.select(row));
  }

  selectRow(row: UserInListDto): void {
    this.tableselectionRow.select(row);
  }
}
