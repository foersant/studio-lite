import { ApiProperty } from '@nestjs/swagger';

export class UserFullDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  name?: string;

  @ApiProperty()
  isAdmin?: boolean;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  password?: string;
}
