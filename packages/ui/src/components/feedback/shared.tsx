import type { ReactNode, RefObject, KeyboardEventHandler } from "react";
import type { CommonProps, Tone } from "../../core/base";
export interface DialogProps extends CommonProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: ReactNode;
  description?: ReactNode;
  /** `false` (with `cancelLabel={false}`) leaves the dialog without a footer, e.g. for settings that apply at once. */
  confirmLabel?: string | false;
  cancelLabel?: string | false;
  /** Icon tile beside the title. */
  icon?: string;
  /** Label of the close button, for localisation. */
  closeLabel?: string;
  /** Decoration painted across the whole window behind its content (artwork, glows, frames). */
  art?: ReactNode;
  /** Close on a click outside the window (default); `false` keeps it open until a button closes it. */
  dismissible?: boolean;
  /** Window width: "narrow" for a short question, "wide" and "large" for forms and lists, "full" for a workspace. */
  width?: "narrow" | "normal" | "wide" | "large" | "full";
  danger?: boolean;
  onConfirm?: () => boolean | void | Promise<boolean | void>;
}
export interface PopoverProps extends CommonProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  anchorRef?: RefObject<HTMLElement | null>;
  label?: string;
  role?: "dialog" | "menu" | "listbox";
  onKeyDown?: KeyboardEventHandler<HTMLDivElement>;
  align?: "start" | "end";
  matchAnchorWidth?: boolean;
  /** Move focus into the popover when it opens (default). Off for comboboxes that keep typing focus. */
  autoFocus?: boolean;
}
export interface MenuItemData {
  id?: string;
  label?: string;
  icon?: string;
  endIcon?: string;
  disabled?: boolean;
  danger?: boolean;
  separator?: boolean;
  onSelect?: () => void;
}
export interface MenuItemProps extends CommonProps, MenuItemData {}
export interface MenuProps extends PopoverProps {
  items?: MenuItemData[];
}
export interface ToastProps extends CommonProps {
  message?: ReactNode;
  open?: boolean;
  duration?: number;
  onClose?: () => void;
  floating?: boolean;
}
export interface BadgeProps extends CommonProps {
  label?: string;
}
export interface MessageBarProps extends CommonProps {
  /** A button or link that resolves the message, e.g. "Повторить". */
  action?: ReactNode;
}
export interface StatusIndicatorProps extends CommonProps {
  status?: Tone;
  label?: ReactNode;
}
export interface ProgressBarProps extends CommonProps {
  value?: number;
  max?: number;
  label?: string;
  indeterminate?: boolean;
  /** A bar, or a sound wave that fills with colour from the left (e.g. audio being processed). */
  variant?: "bar" | "wave";
}
export interface StepsProps extends CommonProps {
  steps?: string[];
  current?: number;
}
export interface EmptyStateProps extends CommonProps {
  title?: string;
  description?: string;
  icon?: string;
  action?: ReactNode;
}
export interface KeyValueListProps extends CommonProps {
  items?: Array<[ReactNode, ReactNode]>;
}
/** A row of a table: named fields, or the cells in column order. */
export type DataTableRow = Record<string, unknown> | ReactNode[];
export interface DataTableColumn<T extends DataTableRow = DataTableRow> {
  /** Field of the row (or the cell index for array rows). */
  key: string;
  title: ReactNode;
  align?: "start" | "center" | "end";
  width?: string;
  /** Allow readers to resize this column; on by default. */
  resizable?: boolean;
  /** Click the header to sort; on by default. */
  sortable?: boolean;
  /** Cell content; the raw field by default. */
  render?: (row: T, index: number) => ReactNode;
  /** What sorting, search, filters and groups look at; the raw field by default. */
  value?: (row: T) => string | number;
  /**
   * A filter in the header: "text" (contains), "values" (pick from the column's values),
   * "range" (numbers from–to). With `filterable` on the table every column gets one: values
   * for short lists, range for numbers, text otherwise; `false` turns it off.
   */
  filter?: "text" | "values" | "range" | false;
  /** Rows can be grouped by this column; on by default. */
  groupable?: boolean;
  /** A summary of a group's rows shown in its header row (a count, a sum, an average…). */
  aggregate?: (rows: T[]) => ReactNode;
}
export type DataTableSort = { key: string; direction: "asc" | "desc" };
/** One column's filter: text it contains, values it is one of, or a number range. */
export type DataTableFilter =
  | { kind: "text"; text: string }
  | { kind: "values"; values: string[] }
  | { kind: "range"; min?: number; max?: number };
export interface DataTableProps<
  T extends DataTableRow = DataTableRow,
> extends CommonProps {
  /** Column titles, or full column descriptions. */
  columns?: Array<string | DataTableColumn<T>>;
  rows?: T[];
  caption?: ReactNode;
  /** Stable id of a row, for selection; its index by default. */
  rowKey?: (row: T, index: number) => string;
  sort?: DataTableSort | null;
  defaultSort?: DataTableSort | null;
  onSortChange?: (sort: DataTableSort | null) => void;
  /** Checkboxes to pick rows, with "select all" in the header. */
  selectable?: boolean;
  selected?: string[];
  defaultSelected?: string[];
  onSelectionChange?: (keys: string[]) => void;
  /** A search field over every column. */
  searchable?: boolean;
  /** Filters in every column header (see `DataTableColumn.filter`). */
  filterable?: boolean;
  filters?: Record<string, DataTableFilter>;
  defaultFilters?: Record<string, DataTableFilter>;
  onFiltersChange?: (filters: Record<string, DataTableFilter>) => void;
  /** Group rows by a column; `groupable` adds a "group by" choice to the toolbar. */
  groupable?: boolean;
  groupBy?: string | null;
  defaultGroupBy?: string | null;
  onGroupByChange?: (key: string | null) => void;
  /** Rows per page; everything on one page by default. */
  pageSize?: number;
  /** Page-size choices in the footer when pagination is enabled. */
  pageSizeOptions?: number[];
  /** Allow readers to resize columns; on by default. */
  resizableColumns?: boolean;
  /** Scroll inside the table with a sticky header beyond this height. */
  maxHeight?: string;
  dense?: boolean;
  striped?: boolean;
  /** Placeholder rows while data loads. */
  loading?: boolean;
  /** Shown when there are no rows (or none match the search). */
  empty?: ReactNode;
  onRowClick?: (row: T, index: number) => void;
}
export interface CollapsibleSectionProps extends CommonProps {
  title?: string;
  /** Muted line under the title, e.g. what the section holds. */
  description?: ReactNode;
  icon?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}
