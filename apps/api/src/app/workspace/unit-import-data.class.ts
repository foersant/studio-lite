import * as cheerio from 'cheerio';
import { FileIo } from '../interfaces/file-io.interface';

export class UnitImportData {
  key: string;
  name: string;
  description: string;
  definition: string;
  definitionFileName: string;
  player: string;
  editor: string;

  constructor(fileIo: FileIo) {
    const xmlDocument = cheerio.load(fileIo.buffer.toString());
    const metadataElement = xmlDocument('Metadata').first();
    const unitIdElement = metadataElement.find('Id').first();
    this.key = unitIdElement.text();
    const unitLabelElement = metadataElement.find('Label').first();
    this.name = unitLabelElement ? unitLabelElement.text() : '';
    const unitDescriptionElement = metadataElement.find('Description').first();
    this.description = unitDescriptionElement ? unitDescriptionElement.text() : '';
    const definitionRefElement = xmlDocument('DefinitionRef').first();
    this.definition = '';
    this.definitionFileName = '';
    if (definitionRefElement) {
      this.player = definitionRefElement.attr('player');
      this.editor = definitionRefElement.attr('editor');
      this.definitionFileName = definitionRefElement.text();
    } else {
      const definitionElement = xmlDocument('Definition').first();
      if (definitionElement) {
        this.player = definitionElement.attr('player');
        this.editor = definitionElement.attr('editor');
        this.definition = definitionElement.text();
      }
    }
  }
}
