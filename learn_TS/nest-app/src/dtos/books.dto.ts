// import { ApiProperty } from '@nestjs/swagger';

import { IsString, MinLength, MaxLength } from "class-validator";

export class CreateBooksDto {
    // @ApiProperty()
    @IsString()
    @MinLength(10, { message: 'Name is too short' })
    @MaxLength(20, { message: 'Name is too long' })
    readonly name: string;

    // @ApiProperty()
    @IsString()
    readonly author: string;
}
