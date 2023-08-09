import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Note } from './schemas/note.schema';
import mongoose from 'mongoose';

@Injectable()
export class NoteService {
  constructor(
    @InjectModel(Note.name) private noteModel: mongoose.Model<Note>,
  ) {}

  async createNote(note: Note): Promise<Note> {
    const createdNote = await this.noteModel.create(note);

    return createdNote;
  }

  async getAllNotes(query): Promise<Note[]> {
    const keyword = query.keyword
      ? {
          $or: [
            {
              title: {
                $regex: query.keyword,
                $options: 'i',
              },
            },
            {
              content: {
                $regex: query.keyword,
                $options: 'i',
              },
            },
          ],
        }
      : {};

    const resPerPage = 10;
    const currentPage = Number(query.page) || 1;
    const skip = resPerPage * (currentPage - 1);

    const notes = await this.noteModel
      .find({ ...keyword })
      .limit(resPerPage)
      .skip(skip);

    return notes;
  }

  async getNoteById(id: string): Promise<Note> {
    const isValidId = mongoose.isValidObjectId(id);

    if (!isValidId) {
      throw new BadRequestException('Please enter the correct id.');
    }

    const note = await this.noteModel.findById(id);

    if (!note) {
      throw new NotFoundException("Note doesn't exist.");
    }

    return note;
  }

  async updateNote(id: string, note: Note): Promise<Note> {
    return await this.noteModel.findByIdAndUpdate(id, note, {
      new: true,
      runValidators: true,
    });
  }

  async deleteNote(id: string): Promise<Note> {
    return await this.noteModel.findByIdAndDelete(id);
  }
}
