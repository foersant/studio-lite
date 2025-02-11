import { ApiProperty } from '@nestjs/swagger';

export class WorkspaceInListDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  name!: string;

  @ApiProperty({ example: 463 })
  groupId!: number;
}
