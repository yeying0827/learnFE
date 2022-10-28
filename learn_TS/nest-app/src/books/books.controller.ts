import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import {BooksService} from "./books.service";
import {CreateBooksDto} from "../dtos/books.dto";

@Controller('books')
export class BooksController {
    constructor(private readonly booksService: BooksService) {
    }

    @Get('/js')
    findJavaScript() {
        return 'JavaScript高级程序设计'
    }

    // @Get('/find')
    // findBook() {
    //     const res = this.booksService.getBooks();
    //     return res;
    // }

    @Get(':id')
    findBook(@Param('id') id: number) {
        return this.booksService.getBooks(id);
    }

    @Post()
    async create(@Body() createBooksDto: CreateBooksDto): Promise<{ id: number }> {
        return await this.booksService.createBooks(createBooksDto);
    }
}
