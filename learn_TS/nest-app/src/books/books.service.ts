import { Injectable } from '@nestjs/common';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as _ from 'lodash';

import { BooksEntity } from "../entities/books.entity";
import { CreateBooksDto } from '../dtos/books.dto';

@Injectable()
export class BooksService {
    constructor(
        @InjectRepository(BooksEntity)
        private readonly booksRepository: Repository<BooksEntity>
    ) {
    }

    async getBooks(id: number) {
        return await this.booksRepository.findOneById(id);
    }

    async createBooks(books: CreateBooksDto) {
        const res = await this.booksRepository.save(books);

        return _.pick(res, 'id');
    }

    // getBooks() {
    //     return '本书找到了！';
    // }
}
