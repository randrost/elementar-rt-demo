import { Injectable, signal } from '@angular/core';
import { daysAgo } from '../../shared/mock/mock';

export type ProjectStatus = 'on-track' | 'at-risk' | 'blocked' | 'shipped';

export interface Project {
  id: string;
  name: string;
  description: string;
  progress: number;
  status: ProjectStatus;
  due: string;
  members: string[];
  tags: string[];
  tasksDone: number;
  tasksTotal: number;
}

export const STATUS_META: Record<ProjectStatus, { label: string; classes: string }> = {
  'on-track': { label: 'On track', classes: 'bg-green-container text-on-green-container' },
  'at-risk': { label: 'At risk', classes: 'bg-orange-container text-on-orange-container' },
  blocked: { label: 'Blocked', classes: 'bg-red-container text-on-red-container' },
  shipped: { label: 'Shipped', classes: 'bg-surface-container-highest text-on-surface-variant' }
};

const SEED: readonly Omit<Project, 'id' | 'due'>[] = [
  { name: 'Design system 2.0', description: 'Token overhaul, dark mode parity, and a documented component API.', progress: 72, status: 'on-track', members: ['ada-lovelace', 'hedy-lamarr', 'alan-kay'], tags: ['Design', 'Platform'], tasksDone: 34, tasksTotal: 47 },
  { name: 'Billing rewrite', description: 'Move invoicing off the legacy service and onto the new ledger.', progress: 41, status: 'at-risk', members: ['marie-curie', 'grace-hopper'], tags: ['Billing'], tasksDone: 18, tasksTotal: 44 },
  { name: 'Mobile companion app', description: 'Read-only dashboards and push notifications to start.', progress: 15, status: 'blocked', members: ['sophie-wilson', 'ken-thompson', 'radia-perlman', 'vint-cerf'], tags: ['Mobile'], tasksDone: 6, tasksTotal: 40 },
  { name: 'Onboarding revamp', description: 'Cut the setup flow from nine screens to four.', progress: 88, status: 'on-track', members: ['barbara-liskov', 'anita-borg'], tags: ['Growth'], tasksDone: 22, tasksTotal: 25 },
  { name: 'Search infrastructure', description: 'Replace the LIKE queries with a real index.', progress: 55, status: 'on-track', members: ['edsger-dijkstra', 'donald-knuth'], tags: ['Platform', 'Backend'], tasksDone: 27, tasksTotal: 49 },
  { name: 'SOC 2 readiness', description: 'Audit logging, access reviews, and the policy set.', progress: 33, status: 'at-risk', members: ['margaret-hamilton', 'shirley-jackson'], tags: ['Compliance'], tasksDone: 11, tasksTotal: 33 },
  { name: 'Analytics pipeline', description: 'Event schema, warehouse sync, and the reporting layer.', progress: 61, status: 'on-track', members: ['katherine-johnson', 'frances-allen', 'jean-bartik'], tags: ['Data'], tasksDone: 30, tasksTotal: 49 },
  { name: 'Help center refresh', description: 'Rewrite the top twenty articles and add real screenshots.', progress: 100, status: 'shipped', members: ['tim-berners-lee'], tags: ['Docs'], tasksDone: 19, tasksTotal: 19 },
  { name: 'Localisation', description: 'German and Japanese first; extract every hard-coded string.', progress: 24, status: 'on-track', members: ['adele-goldberg', 'chien-shiung-wu'], tags: ['i18n'], tasksDone: 9, tasksTotal: 38 },
  { name: 'Performance budget', description: 'Hold the initial bundle under 300kb and keep charts lazy.', progress: 100, status: 'shipped', members: ['rosalind-franklin', 'nikola-tesla'], tags: ['Platform'], tasksDone: 14, tasksTotal: 14 }
];

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private readonly items = signal<Project[]>(
    SEED.map((project, i) => ({
      ...project,
      id: `project-${i + 1}`,
      due: daysAgo(-(i * 9 + 5))
    }))
  );

  readonly projects = this.items.asReadonly();
}
