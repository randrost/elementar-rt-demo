import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { PageComponent } from '../../shell/page/page';
import { DataTableComponent } from '../../shared/datatable/datatable';
import { DataColumn } from '../../shared/datatable/datatable.types';
import { Post, POST_STATUS, PostsService } from './mock-data';

@Component({
  selector: 'app-post-list',
  imports: [PageComponent, DataTableComponent, MatButtonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <app-page title="All posts" description="Everything written, drafted, or scheduled.">
      <ng-container actions>
        <a matButton="filled" routerLink="/management/posts/new">
          <iconify-icon icon="solar:add-circle-linear" width="18" height="18" class="mr-1.5"></iconify-icon>
          New post
        </a>
      </ng-container>

      <app-datatable
        [data]="store.posts()"
        [columns]="columns"
        enableSearch
        enableSelection
        [pageSize]="10"
        emptyMessage="No posts yet." />
    </app-page>
  `
})
export class PostListComponent {
  protected readonly store = inject(PostsService);
  private readonly router = inject(Router);

  protected readonly columns: DataColumn<Post>[] = [
    { id: 'title', header: 'Title', accessor: (row) => row.title },
    {
      id: 'author',
      header: 'Author',
      type: 'user',
      accessor: (row) => ({ name: row.authorName, avatarSeed: row.authorSeed })
    },
    { id: 'status', header: 'Status', type: 'status', accessor: (row) => POST_STATUS[row.status] },
    { id: 'category', header: 'Category', accessor: (row) => row.category },
    { id: 'date', header: 'Date', type: 'date', accessor: (row) => row.date },
    {
      id: 'actions',
      header: '',
      type: 'actions',
      sortable: false,
      width: '4rem',
      accessor: () => null,
      actions: [
        {
          label: 'View',
          icon: 'solar:eye-linear',
          run: (row) => this.router.navigate(['/management/posts/details', row.id])
        },
        {
          label: 'Edit',
          icon: 'solar:pen-linear',
          run: (row) => this.router.navigate(['/management/posts/edit', row.id])
        },
        {
          label: 'Delete',
          icon: 'solar:trash-bin-trash-linear',
          tone: 'danger',
          run: (row) => this.store.remove(row.id)
        }
      ]
    }
  ];
}
