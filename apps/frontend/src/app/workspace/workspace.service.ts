import {
  BehaviorSubject, lastValueFrom
} from 'rxjs';
import { Injectable } from '@angular/core';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { map } from 'rxjs/operators';
import { UnitInListDto } from '@studio-lite-lib/api-dto';
import { BackendService } from './backend.service';
import {
  ModuleCollection, UnitCollection, UnitDefinitionStore, UnitMetadataStore
} from './workspace.classes';
import { AppService } from '../app.service';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {
  selectedWorkspace = 0;
  selectedUnit$ = new BehaviorSubject<number>(0);
  editorList = new ModuleCollection([]);
  playerList = new ModuleCollection([]);
  moduleHtmlStore: { [key: string]: string } = {};
  unitMetadataStore: UnitMetadataStore | undefined;
  unitDefinitionStore: UnitDefinitionStore | undefined;
  unitList = new UnitCollection([]);

  constructor(
    private backendService: BackendService,
    private appService: AppService
  ) {}

  static unitKeyUniquenessValidator(unitId: number, unitList: UnitInListDto[]): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
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
  }

  isChanged(): boolean {
    return !!((this.unitMetadataStore && this.unitMetadataStore.isChanged()) ||
      (this.unitDefinitionStore && this.unitDefinitionStore.isChanged()));
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
        reloadUnitList = this.unitMetadataStore.isKeyOrNameChanged();
        this.unitMetadataStore.applyChanges();
      }
    }
    if (saveOk && this.unitDefinitionStore && this.unitDefinitionStore.isChanged()) {
      saveOk = await lastValueFrom(this.backendService.setUnitDefinition(
        this.selectedWorkspace, this.selectedUnit$.getValue(), this.unitDefinitionStore.getChangedData()
      ));
      if (saveOk) this.unitDefinitionStore.applyChanges();
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
