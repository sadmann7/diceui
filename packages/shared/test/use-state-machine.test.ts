import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useStateMachine } from "../src/hooks/use-state-machine";

type TestState = "idle" | "loading" | "success" | "error";
type TestEvent = "START" | "SUCCESS" | "ERROR" | "RETRY" | "RESET";

describe("useStateMachine", () => {
  const config = {
    initial: "idle" as TestState,
    states: {
      idle: {
        START: "loading",
      },
      loading: {
        SUCCESS: "success",
        ERROR: "error",
      },
      success: {
        RESET: "idle",
      },
      error: {
        RETRY: "loading",
        RESET: "idle",
      },
    },
  };

  it("should initialize with the initial state", () => {
    const { result } = renderHook(() => useStateMachine(config));
    const [state] = result.current;

    expect(state).toBe("idle");
  });

  it("should transition to new state when valid event is sent", () => {
    const { result } = renderHook(() => useStateMachine(config));
    const [, send] = result.current;

    act(() => {
      send("START");
    });

    const [stateAfterStart] = result.current;
    expect(stateAfterStart).toBe("loading");

    act(() => {
      send("SUCCESS");
    });

    const [stateAfterSuccess] = result.current;
    expect(stateAfterSuccess).toBe("success");
  });

  it("should not transition on invalid events", () => {
    const { result } = renderHook(() => useStateMachine(config));
    const [, send] = result.current;

    act(() => {
      send("SUCCESS" as TestEvent); // Invalid from initial state
    });

    const [state] = result.current;
    expect(state).toBe("idle");
  });

  it("should handle multiple transitions", () => {
    const { result } = renderHook(() => useStateMachine(config));
    const [, send] = result.current;

    // idle -> loading -> error -> loading -> success -> idle
    act(() => {
      send("START");
    });
    expect(result.current[0]).toBe("loading");

    act(() => {
      send("ERROR");
    });
    expect(result.current[0]).toBe("error");

    act(() => {
      send("RETRY");
    });
    expect(result.current[0]).toBe("loading");

    act(() => {
      send("SUCCESS");
    });
    expect(result.current[0]).toBe("success");

    act(() => {
      send("RESET");
    });
    expect(result.current[0]).toBe("idle");
  });

  it("should maintain state if transition is not defined", () => {
    const { result } = renderHook(() => useStateMachine(config));
    const [, send] = result.current;

    act(() => {
      send("START");
    });
    expect(result.current[0]).toBe("loading");

    act(() => {
      send("RESET" as TestEvent); // RESET is not valid in loading state
    });
    expect(result.current[0]).toBe("loading");
  });
});
