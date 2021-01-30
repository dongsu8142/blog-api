import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OptionalAuthGuard } from 'src/auth/optional-auth.gaurd';
import { User } from 'src/auth/user.decorator';
import { UserEntity } from 'src/entities/user.entity';
import {
  CreateArticleDTO,
  FindAllQuery,
  FindFeedQuery,
  UpdateArticleDTO,
} from 'src/models/article.models';
import { CreateCommentDTO } from 'src/models/comment.models';
import { ArticleService } from './article.service';
import { CommentsService } from './comments.service';

@Controller('articles')
export class ArticleController {
  constructor(
    private articleService: ArticleService,
    private commentService: CommentsService,
  ) {}

  @Get()
  @UseGuards(new OptionalAuthGuard())
  async findAll(@User() user: UserEntity, @Query() query: FindAllQuery) {
    const articles = await this.articleService.findAll(user, query);
    return { articles, articlesCount: articles.length };
  }

  @Get('/feed')
  @UseGuards(AuthGuard())
  async findFeed(@User() user: UserEntity, @Query() query: FindFeedQuery) {
    const articles = await this.articleService.findFeed(user, query);
    return { articles, articlesCount: articles.length };
  }

  @Get('/:slug')
  @UseGuards(new OptionalAuthGuard())
  async findBySlug(@Param('slug') slug: string, @User() user: UserEntity) {
    const article = await this.articleService.findBySlug(slug);
    return { article: article.toArticle(user) };
  }

  @Post()
  @UseGuards(AuthGuard())
  async createArticle(
    @User() user: UserEntity,
    @Body(ValidationPipe) data: { article: CreateArticleDTO },
  ) {
    const article = await this.articleService.createArticle(user, data.article);
    return { article };
  }

  @Put('/:slug')
  @UseGuards(AuthGuard())
  async updateArticle(
    @Param('slug') slug: string,
    @User() user: UserEntity,
    @Body(ValidationPipe) data: { article: UpdateArticleDTO },
  ) {
    const article = await this.articleService.updateArticle(
      slug,
      user,
      data.article,
    );
    return { article };
  }

  @Delete('/:slug')
  @UseGuards(AuthGuard())
  async deleteAticle(@Param('slug') slug: string, @User() user: UserEntity) {
    const article = await this.articleService.deleteArticle(slug, user);
    return { article };
  }

  @Get('/:slug/comments')
  async findComments(@Param('slug') slug: string) {
    const comments = await this.commentService.findByArticleSlug(slug);
    console.log(comments);
    return { comments };
  }

  @Post('/:slug/comments')
  @UseGuards(AuthGuard())
  async createComment(
    @Param('slug') slug: string,
    @User() user: UserEntity,
    @Body(ValidationPipe) data: { comment: CreateCommentDTO },
  ) {
    const comment = await this.commentService.createComment(
      user,
      data.comment,
      slug,
    );
    return { comment };
  }

  @Delete('/:slug/comments/:id')
  @UseGuards(AuthGuard())
  async deleteComment(@User() user: UserEntity, @Param('id') id: number) {
    const comment = await this.commentService.deleteComment(user, id);
    return { comment };
  }

  @Post('/:slug/favorite')
  @UseGuards(AuthGuard())
  async favoriteArticle(@User() user: UserEntity, @Param('slug') slug: string) {
    const article = await this.articleService.favoriteArticle(slug, user);
    return { article };
  }

  @Delete('/:slug/favorite')
  @UseGuards(AuthGuard())
  async unfavoriteArticle(
    @User() user: UserEntity,
    @Param('slug') slug: string,
  ) {
    const article = await this.articleService.unfavoriteArticle(slug, user);
    return { article };
  }
}
