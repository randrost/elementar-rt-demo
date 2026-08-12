import { Routes } from '@angular/router';
import { CourseListComponent } from './course-list';
import { CourseDetailsComponent } from './course-details';
import { CourseBuilderComponent } from './course-builder';

export const coursesRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'list' },
  { path: 'list', component: CourseListComponent, data: { title: 'Courses' }, title: 'Courses · Elementar RT' },
  {
    path: 'details/:id',
    component: CourseDetailsComponent,
    data: { title: 'Course Details' },
    title: 'Course · Elementar RT'
  },
  {
    path: 'builder/:id',
    component: CourseBuilderComponent,
    data: { title: 'Course Builder' },
    title: 'Course Builder · Elementar RT'
  }
];
