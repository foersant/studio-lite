import { Injectable } from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import Unit from "../entities/unit.entity";
import {CreateUnitDto, UnitInListDto} from "@studio-lite-lib/api-dto";

@Injectable()
export class UnitService {
  constructor(
    @InjectRepository(Unit)
    private unitsRepository: Repository<Unit>,
  ) {}

  async findAll(workspaceId: number): Promise<UnitInListDto[]> {
    return await this.unitsRepository.find({
      where: {workspaceId: workspaceId},
      order: {groupName: 'ASC', key: 'ASC'},
      select: ['id', 'key', 'name', 'groupName']
    })
  }

  async create(workspaceId: number, unit: CreateUnitDto ): Promise<number> {
    unit['workspaceId'] = workspaceId;
    const newUnit = await this.unitsRepository.create(unit);
    await this.unitsRepository.save(newUnit);
    return newUnit.id;
  }

}
