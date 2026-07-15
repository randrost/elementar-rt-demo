export type CellType =
  | 'text'
  | 'user'
  | 'status'
  | 'currency'
  | 'date'
  | 'progress'
  | 'rating'
  | 'tags'
  | 'actions'
  | 'custom';

export type StatusTone = 'success' | 'warning' | 'error' | 'info' | 'neutral';

export interface UserCellValue {
  name: string;
  secondary?: string;
  avatarSeed: string;
}

export interface StatusCellValue {
  label: string;
  tone: StatusTone;
}

export interface RowAction<T> {
  label: string;
  icon: string;
  tone?: 'default' | 'danger';
  run: (row: T) => void;
}

export interface DataColumn<T> {
  id: string;
  header: string;
  /** Value used for display + sorting. */
  accessor: (row: T) => unknown;
  type?: CellType;
  sortable?: boolean;
  align?: 'left' | 'right' | 'center';
  width?: string;
  /** For 'currency': ISO currency code (default USD). */
  currency?: string;
  /** For 'actions': the row action menu items. */
  actions?: RowAction<T>[];
  /** For 'custom': name of a projected <ng-template [appCell]> to render. */
  template?: string;
}
