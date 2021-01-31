import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentEntity } from 'src/entities/comment.entity';
import { UserEntity } from 'src/entities/user.entity';
import { CreateCommentDTO, CommentResponse } from 'src/models/comment.models';
import { ArticleEntity } from 'src/entities/article.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentEntity)
    private commentRepo: Repository<CommentEntity>,
    @InjectRepository(ArticleEntity)
    private articleRepo: Repository<ArticleEntity>,
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
  ) {}

  async findByArticleSlug(slug: string): Promise<CommentResponse[]> {
    const article = await this.articleRepo.findOne({ where: { slug } });
    return this.commentRepo.find({
      where: { article },
      relations: ['article'],
    });
  }

  findById(id: number): Promise<CommentResponse> {
    return this.commentRepo.findOne({ where: { id } });
  }

  async createComment(
    user: UserEntity,
    data: CreateCommentDTO,
    slug: string,
  ): Promise<CommentResponse> {
    const comment = this.commentRepo.create(data);
    const article = await this.articleRepo.findOne({ where: { slug } });
    comment.author = user;
    comment.article = article;
    await comment.save();
    return this.commentRepo.findOne({ where: { body: data.body } });
  }

  async deleteComment(user: UserEntity, id: number): Promise<CommentResponse> {
    const author = await this.userRepo.findOne({ where: { id } });
    const comment = await this.commentRepo.findOne({
      where: { id, author },
    });
    await comment.remove();
    return comment;
  }
}
