export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export type PriorityFilter = {
  equals?: Priority;
  in?: Priority[];
  notIn?: Priority[];
  not?: Priority | PriorityFilter;
}
