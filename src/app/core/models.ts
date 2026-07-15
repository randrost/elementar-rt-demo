/** Cross-feature domain models. Feature-specific models live with their feature. */

export type UserStatus = 'active' | 'invited' | 'suspended';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarSeed: string;
  role: string;
  status: UserStatus;
  lastActive: string; // ISO date
}

export type NotificationKind = 'message' | 'system' | 'billing' | 'mention' | 'success';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  icon: string; // iconify name
  time: string; // ISO date
  read: boolean;
  kind: NotificationKind;
}

export interface Announcement {
  id: string;
  message: string;
  linkLabel?: string;
  link?: string;
}

export type IncidentSeverity = 'info' | 'warning' | 'critical';

export interface Incident {
  id: string;
  severity: IncidentSeverity;
  message: string;
}
