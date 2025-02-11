import { ApiProperty } from '@nestjs/swagger';

export type VeronaModuleType = 'editor' | 'player' | 'schemer';

export class VeronaModuleMetadataDto {
  [index: string]: any;

  @ApiProperty()
  type!: VeronaModuleType;

  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  version!: string;

  @ApiProperty()
  specVersion!: string;

  static getFromJsonLd(jsonMetadata: {
    type: VeronaModuleType;
    id: string;
    version: string;
    specVersion: string;
    name: { lang: string; value: string; }[] | { [x: string]: string };
    apiVersion: string;
    '@id': string;
    '@type': string;
  }): VeronaModuleMetadataDto | null {
    let returnData: VeronaModuleMetadataDto | null = null;
    if (jsonMetadata.type) {
      const nameList: { lang: string, value: string }[] = jsonMetadata.name as { lang: string, value: string }[];
      let nameDe = '';
      let nameEn = '';
      nameList.forEach(n => {
        if (n.lang === 'de') {
          nameDe = n.value;
        } else if (n.lang === 'en') {
          nameEn = n.value;
        }
      });
      returnData = {
        type: jsonMetadata.type,
        id: jsonMetadata.id,
        name: nameDe || (nameEn || jsonMetadata.id),
        version: jsonMetadata.version,
        specVersion: jsonMetadata.specVersion
      };
    } else if (jsonMetadata['@type']) {
      const nameList: { [x: string]: string } = jsonMetadata.name as { [x: string]: string };
      returnData = {
        type: jsonMetadata['@type'] as VeronaModuleType,
        id: jsonMetadata['@id'],
        name: nameList['de'] || (nameList['en'] || jsonMetadata['@id']),
        version: jsonMetadata.version,
        specVersion: jsonMetadata.apiVersion
      };
    }
    return returnData;
  }

  static getKey(metadata: VeronaModuleMetadataDto): string {
    const pattern = /^(\d+\.\d+)/g;
    const matches = pattern.exec(metadata.version);
    return matches ? `${metadata.id}@${matches[1]}` : `${metadata.id}@${metadata.version}`;
  }
}
