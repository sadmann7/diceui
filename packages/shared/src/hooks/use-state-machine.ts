import * as React from "react";

type Machine<S> = { [k: string]: { [k: string]: S } };
type MachineState<T> = keyof T;
type MachineEvent<T> = keyof UnionToIntersection<T[keyof T]>;

// 🤯 https://fettblog.eu/typescript-union-to-intersection/
type UnionToIntersection<T> = (
  T extends unknown
    ? (x: T) => unknown
    : never
) extends (x: infer R) => unknown
  ? R
  : never;

export function useStateMachine<M>(
  initialState: MachineState<M>,
  machine: M & Machine<MachineState<M>>,
) {
  return React.useReducer(
    (state: MachineState<M>, event: MachineEvent<M>): MachineState<M> => {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      const nextState = (machine[state] as any)[event];
      return nextState ?? state;
    },
    initialState,
  );
}
