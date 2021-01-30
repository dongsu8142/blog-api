import { classToPlain } from 'class-transformer';
import { Column, Entity, ManyToOne } from 'typeorm';
import { AbstractEntity } from './abstract-entity';
import { ArticleEntity } from './article.entity';
import { UserEntity } from './user.entity';

@Entity('comments')
export class CommentEntity extends AbstractEntity {
  @Column()
  body: string;

  @ManyToOne((type) => UserEntity, (user) => user.comments, { eager: true })
  author: UserEntity;

  @ManyToOne((type) => ArticleEntity, (article) => article.comments)
  article: ArticleEntity;

  toJSON() {
    return classToPlain(this);
  }
}
