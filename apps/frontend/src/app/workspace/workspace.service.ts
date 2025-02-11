import {
  BehaviorSubject, lastValueFrom
} from 'rxjs';
import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { map } from 'rxjs/operators';
import {UnitInListDto, WorkspaceSettingsDto} from '@studio-lite-lib/api-dto';
import { BackendService } from './backend.service';
import {
  UnitCollection, UnitDefinitionStore, UnitMetadataStore, UnitSchemeStore
} from './workspace.classes';
import { AppService } from '../app.service';
import { VeronaModuleCollection } from './verona-module-collection.class';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {
  selectedWorkspace = 0;
  selectedUnit$ = new BehaviorSubject<number>(0);
  workspaceSettings: WorkspaceSettingsDto;
  editorList = new VeronaModuleCollection([]);
  playerList = new VeronaModuleCollection([]);
  schemerList = new VeronaModuleCollection([]);
  moduleHtmlStore: { [key: string]: string } = {};
  unitMetadataStore: UnitMetadataStore | undefined;
  unitDefinitionStore: UnitDefinitionStore | undefined;
  unitSchemeStore: UnitSchemeStore | undefined;
  unitList = new UnitCollection([]);

  constructor(
    private backendService: BackendService,
    private appService: AppService
  ) {
    this.workspaceSettings = {
      defaultEditor: '',
      defaultPlayer: '',
      unitGroups: []
    }
  }

  static unitKeyUniquenessValidator(unitId: number, unitList: UnitInListDto[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const newKeyNormalised = control.value.toUpperCase().trim();
      let isUnique = true;
      unitList.forEach(u => {
        if (u.key.toUpperCase().trim() === newKeyNormalised && u.id !== unitId) {
          isUnique = false;
        }
      });
      if (!isUnique) {
        return { keyNotUnique: 'Der Kurzname muss eindeutig innerhalb des Arbeitsbereiches sein.' };
      }
      return null;
    };
  }

  resetUnitData(): void {
    this.unitMetadataStore = undefined;
    this.unitDefinitionStore = undefined;
    this.unitSchemeStore = undefined;
  }

  isChanged(): boolean {
    return !!((this.unitMetadataStore && this.unitMetadataStore.isChanged()) ||
      (this.unitDefinitionStore && this.unitDefinitionStore.isChanged()) ||
      (this.unitSchemeStore && this.unitSchemeStore.isChanged())
    );
  }

  async getModuleHtml(key: string): Promise<string | null> {
    if (Object.keys(this.moduleHtmlStore).indexOf(key) >= 0) return this.moduleHtmlStore[key];
    this.appService.dataLoading = true;
    const fileData = await lastValueFrom(this.backendService.getModuleHtml(key));
    this.appService.dataLoading = false;
    if (fileData) {
      this.moduleHtmlStore[key] = fileData.file;
      return this.moduleHtmlStore[key];
    }
    return null;
  }

  async saveUnitData(): Promise<boolean> {
    let reloadUnitList = false;
    let saveOk = true;
    this.appService.dataLoading = true;
    if (this.unitMetadataStore && this.unitMetadataStore.isChanged()) {
      saveOk = await lastValueFrom(this.backendService.setUnitMetadata(
        this.selectedWorkspace, this.unitMetadataStore.getChangedData()
      ));
      if (saveOk) {
        reloadUnitList = this.unitMetadataStore.isKeyOrNameOrGroupChanged();
        this.unitMetadataStore.applyChanges();
      }
    }
    if (saveOk && this.unitDefinitionStore && this.unitDefinitionStore.isChanged()) {
      saveOk = await lastValueFrom(this.backendService.setUnitDefinition(
        this.selectedWorkspace, this.selectedUnit$.getValue(), this.unitDefinitionStore.getChangedData()
      ));
      if (saveOk) this.unitDefinitionStore.applyChanges();
    }
    if (saveOk && this.unitSchemeStore && this.unitSchemeStore.isChanged()) {
      saveOk = await lastValueFrom(this.backendService.setUnitScheme(
        this.selectedWorkspace, this.selectedUnit$.getValue(), this.unitSchemeStore.getChangedData()
      ));
      if (saveOk) this.unitSchemeStore.applyChanges();
    }
    if (reloadUnitList) {
      saveOk = await lastValueFrom(this.backendService.getUnitList(this.selectedWorkspace)
        .pipe(
          map(uResponse => {
            this.unitList = new UnitCollection(uResponse);
            this.appService.dataLoading = false;
            return true;
          })
        ));
    }
    this.appService.dataLoading = false;
    return saveOk;
  }
}
