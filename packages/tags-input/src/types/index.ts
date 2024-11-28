export type InputValue = string | Record<string, string>;

export interface TagItem {
  id: string;
  value: string;
}

export type TagValue<T> = T extends string ? T | TagItem : T;
