import { Injectable, signal } from '@angular/core';
import { randomId } from '../../shared/mock/mock';

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Lesson {
  id: string;
  title: string;
  durationMins: number;
  kind: 'video' | 'reading' | 'exercise' | 'quiz';
  completed: boolean;
  notes: string;
}

export interface CourseSection {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  summary: string;
  category: string;
  level: CourseLevel;
  authorSeed: string;
  authorName: string;
  /** Tailwind gradient classes standing in for cover art. */
  cover: string;
  sections: CourseSection[];
}

export const LEVEL_META: Record<CourseLevel, { label: string; classes: string }> = {
  beginner: { label: 'Beginner', classes: 'bg-green-container text-on-green-container' },
  intermediate: { label: 'Intermediate', classes: 'bg-blue-container text-on-blue-container' },
  advanced: { label: 'Advanced', classes: 'bg-orange-container text-on-orange-container' }
};

export const LESSON_META: Record<Lesson['kind'], { icon: string; label: string }> = {
  video: { icon: 'solar:play-circle-bold-duotone', label: 'Video' },
  reading: { icon: 'solar:book-2-bold-duotone', label: 'Reading' },
  exercise: { icon: 'solar:code-square-bold-duotone', label: 'Exercise' },
  quiz: { icon: 'solar:question-circle-bold-duotone', label: 'Quiz' }
};

let seq = 0;
function lesson(title: string, mins: number, kind: Lesson['kind'], completed: boolean): Lesson {
  seq += 1;
  return { id: `lesson-${seq}`, title, durationMins: mins, kind, completed, notes: '' };
}

function section(title: string, lessons: Lesson[]): CourseSection {
  seq += 1;
  return { id: `section-${seq}`, title, lessons };
}

const COURSES: Course[] = [
  {
    id: 'course-1',
    title: 'Building admin dashboards that scale',
    summary: 'Composition, data density, and the layout decisions that keep a dashboard readable as it grows.',
    category: 'Product',
    level: 'intermediate',
    authorSeed: 'ada-lovelace',
    authorName: 'Ada Lovelace',
    cover: 'from-indigo-500 to-sky-400',
    sections: [
      section('Foundations', [
        lesson('What a dashboard is actually for', 8, 'video', true),
        lesson('Choosing the right chart', 14, 'reading', true),
        lesson('Density and the squint test', 11, 'video', true)
      ]),
      section('Composition', [
        lesson('Grid systems that survive content', 16, 'video', true),
        lesson('Building a widget registry', 22, 'exercise', false),
        lesson('Responsive behaviour without breakpoint hacks', 13, 'reading', false)
      ]),
      section('Going further', [
        lesson('Persisting user layouts', 18, 'exercise', false),
        lesson('Knowledge check', 6, 'quiz', false)
      ])
    ]
  },
  {
    id: 'course-2',
    title: 'Design tokens end to end',
    summary: 'From a token file to a themed component library, including the dark mode you do not hand-author.',
    category: 'Design',
    level: 'advanced',
    authorSeed: 'hedy-lamarr',
    authorName: 'Hedy Lamarr',
    cover: 'from-violet-500 to-pink-400',
    sections: [
      section('Token basics', [
        lesson('Primitive, semantic, component', 12, 'video', true),
        lesson('Naming that survives a redesign', 15, 'reading', false)
      ]),
      section('Theming', [
        lesson('Deriving dark mode', 19, 'video', false),
        lesson('Contrast checking in practice', 14, 'exercise', false),
        lesson('Token audit', 7, 'quiz', false)
      ])
    ]
  },
  {
    id: 'course-3',
    title: 'Angular signals in anger',
    summary: 'Signals, computed state, and the patterns that keep change detection out of your way.',
    category: 'Engineering',
    level: 'intermediate',
    authorSeed: 'margaret-hamilton',
    authorName: 'Margaret Hamilton',
    cover: 'from-emerald-500 to-teal-400',
    sections: [
      section('Signals', [
        lesson('Signals versus observables', 13, 'video', true),
        lesson('computed and effect, and when not to', 17, 'reading', true),
        lesson('Refactoring a component', 24, 'exercise', false)
      ]),
      section('State', [
        lesson('Signal stores', 20, 'video', false),
        lesson('Deriving instead of syncing', 15, 'reading', false)
      ])
    ]
  },
  {
    id: 'course-4',
    title: 'Accessible interfaces by default',
    summary: 'Keyboard paths, focus management, and colour contrast as a build step rather than an audit.',
    category: 'Design',
    level: 'beginner',
    authorSeed: 'anita-borg',
    authorName: 'Anita Borg',
    cover: 'from-amber-500 to-orange-400',
    sections: [
      section('Getting started', [
        lesson('Who you are actually designing for', 9, 'video', false),
        lesson('Semantic HTML gets you most of the way', 12, 'reading', false)
      ]),
      section('Practice', [
        lesson('Keyboard-testing a dialog', 16, 'exercise', false),
        lesson('Contrast in tinted surfaces', 11, 'video', false)
      ])
    ]
  },
  {
    id: 'course-5',
    title: 'Data tables people can actually use',
    summary: 'Sorting, filtering, selection, and the empty states that make a table feel finished.',
    category: 'Product',
    level: 'beginner',
    authorSeed: 'grace-hopper',
    authorName: 'Grace Hopper',
    cover: 'from-sky-500 to-cyan-400',
    sections: [
      section('Structure', [
        lesson('Columns, density, and alignment', 14, 'video', false),
        lesson('Sorting that matches expectations', 10, 'reading', false)
      ]),
      section('Interaction', [
        lesson('Selection and bulk actions', 18, 'exercise', false),
        lesson('Loading, empty, and error', 9, 'video', false)
      ])
    ]
  },
  {
    id: 'course-6',
    title: 'Shipping a component library',
    summary: 'Versioning, documentation, and the review habits that stop a library rotting.',
    category: 'Engineering',
    level: 'advanced',
    authorSeed: 'barbara-liskov',
    authorName: 'Barbara Liskov',
    cover: 'from-rose-500 to-red-400',
    sections: [
      section('Publishing', [
        lesson('API surface and semver', 16, 'reading', false),
        lesson('Docs that stay true', 13, 'video', false)
      ]),
      section('Maintenance', [
        lesson('Deprecation without breakage', 21, 'exercise', false),
        lesson('Final check', 5, 'quiz', false)
      ])
    ]
  }
];

@Injectable({ providedIn: 'root' })
export class CoursesService {
  private readonly items = signal<Course[]>(COURSES);
  readonly courses = this.items.asReadonly();

  byId(id: string): Course | undefined {
    return this.items().find((course) => course.id === id);
  }

  lessonCount(course: Course): number {
    return course.sections.reduce((sum, section) => sum + section.lessons.length, 0);
  }

  durationMins(course: Course): number {
    return course.sections.reduce(
      (sum, section) => sum + section.lessons.reduce((s, lesson) => s + lesson.durationMins, 0),
      0
    );
  }

  /** Percent of lessons marked complete, rounded. */
  progress(course: Course): number {
    const total = this.lessonCount(course);
    if (!total) return 0;
    const done = course.sections.reduce(
      (sum, section) => sum + section.lessons.filter((lesson) => lesson.completed).length,
      0
    );
    return Math.round((done / total) * 100);
  }

  toggleLesson(courseId: string, lessonId: string): void {
    this.update(courseId, (course) => ({
      ...course,
      sections: course.sections.map((section) => ({
        ...section,
        lessons: section.lessons.map((lesson) =>
          lesson.id === lessonId ? { ...lesson, completed: !lesson.completed } : lesson
        )
      }))
    }));
  }

  /** Replaces the section list after a drag reorder. */
  setSections(courseId: string, sections: CourseSection[]): void {
    this.update(courseId, (course) => ({ ...course, sections }));
  }

  addSection(courseId: string, title: string): void {
    this.update(courseId, (course) => ({
      ...course,
      sections: [...course.sections, { id: randomId('section-'), title, lessons: [] }]
    }));
  }

  removeSection(courseId: string, sectionId: string): void {
    this.update(courseId, (course) => ({
      ...course,
      sections: course.sections.filter((section) => section.id !== sectionId)
    }));
  }

  addLesson(courseId: string, sectionId: string, title: string): void {
    this.update(courseId, (course) => ({
      ...course,
      sections: course.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              lessons: [
                ...section.lessons,
                { id: randomId('lesson-'), title, durationMins: 10, kind: 'video' as const, completed: false, notes: '' }
              ]
            }
          : section
      )
    }));
  }

  removeLesson(courseId: string, lessonId: string): void {
    this.update(courseId, (course) => ({
      ...course,
      sections: course.sections.map((section) => ({
        ...section,
        lessons: section.lessons.filter((lesson) => lesson.id !== lessonId)
      }))
    }));
  }

  updateLesson(courseId: string, lessonId: string, patch: Partial<Omit<Lesson, 'id'>>): void {
    this.update(courseId, (course) => ({
      ...course,
      sections: course.sections.map((section) => ({
        ...section,
        lessons: section.lessons.map((lesson) =>
          lesson.id === lessonId ? { ...lesson, ...patch } : lesson
        )
      }))
    }));
  }

  private update(courseId: string, patch: (course: Course) => Course): void {
    this.items.update((list) => list.map((course) => (course.id === courseId ? patch(course) : course)));
  }
}
