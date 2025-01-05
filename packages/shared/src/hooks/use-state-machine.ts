import * as React from "react";

interface StateMachineConfig<TState extends string, TEvent extends string> {
  initial: TState;
  states: Record<TState, Partial<Record<TEvent, TState>>>;
}

function useStateMachine<TState extends string, TEvent extends string>(
  config: StateMachineConfig<TState, TEvent>,
) {
  const [state, setState] = React.useState<TState>(config.initial);

  const send = React.useCallback(
    (event: TEvent) => {
      setState((currentState) => {
        const transition = config.states[currentState]?.[event];
        return transition ?? currentState;
      });
    },
    [config.states],
  );

  return [state, send] as const;
}

export { useStateMachine };
