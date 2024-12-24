export type ControlledProps<T extends React.ElementType> = Omit<
  React.ComponentPropsWithoutRef<T>,
  "defaultValue" | "value" | "onValueChange"
>;
