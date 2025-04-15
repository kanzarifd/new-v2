declare module 'gantt-task-react' {
  export interface Task {
    start: Date;
    end: Date;
    name: string;
    id: string;
    type: 'task';
    progress: number;
    isDisabled: boolean;
    styles?: {
      backgroundColor?: string;
      backgroundSelectedColor?: string;
    };
    status?: string;
  }

  export interface GanttProps {
    tasks: Task[];
    viewMode: 'day' | 'week' | 'month';
    listCellWidth?: string;
    columnWidth?: number;
    projectBackgroundColor?: string;
    projectProgressColor?: string;
    taskHeight?: number;
    headerHeight?: number;
    locale?: string;
    style?: React.CSSProperties;
    TooltipContent?: React.ComponentType<{ task: Task }>;
  }

  export class Gantt extends React.Component<GanttProps> {}
}
