import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  ScrollSpy,
  ScrollSpyLink,
  ScrollSpyNav,
  ScrollSpySection,
  ScrollSpyViewport,
} from "@/registry/bases/radix/ui/scroll-spy";

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
  takeRecords = vi.fn(() => []);
  root = null;
  rootMargin = "";
  thresholds = [];
}

vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

// Mock window.matchMedia for getDefaultScrollBehavior
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe("ScrollSpy", () => {
  function ScrollSpyTest({
    onValueChange,
    defaultValue = "section1",
    value,
    orientation = "horizontal",
    scrollBehavior = "smooth",
    offset = 0,
    ...props
  }: React.ComponentProps<typeof ScrollSpy>) {
    return (
      <ScrollSpy
        defaultValue={defaultValue}
        value={value}
        onValueChange={onValueChange}
        orientation={orientation}
        scrollBehavior={scrollBehavior}
        offset={offset}
        {...props}
      >
        <ScrollSpyNav>
          <ScrollSpyLink value="section1">Section 1</ScrollSpyLink>
          <ScrollSpyLink value="section2">Section 2</ScrollSpyLink>
          <ScrollSpyLink value="section3">Section 3</ScrollSpyLink>
        </ScrollSpyNav>
        <ScrollSpyViewport>
          <ScrollSpySection value="section1">
            <h2>Section 1</h2>
            <p>Content for section 1</p>
          </ScrollSpySection>
          <ScrollSpySection value="section2">
            <h2>Section 2</h2>
            <p>Content for section 2</p>
          </ScrollSpySection>
          <ScrollSpySection value="section3">
            <h2>Section 3</h2>
            <p>Content for section 3</p>
          </ScrollSpySection>
        </ScrollSpyViewport>
      </ScrollSpy>
    );
  }

  it("renders scroll spy with correct initial state", () => {
    render(<ScrollSpyTest />);

    expect(screen.getAllByText("Section 1")).toHaveLength(2); // Link + heading
    expect(screen.getAllByText("Section 2")).toHaveLength(2);
    expect(screen.getAllByText("Section 3")).toHaveLength(2);

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(3);
    expect(links[0]).toHaveAttribute("data-state", "active");
  });

  it("changes active section when clicking on link", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    // Mock scrollTo
    window.scrollTo = vi.fn();

    render(<ScrollSpyTest onValueChange={onValueChange} />);

    const section2Link = screen.getByRole("link", { name: /section 2/i });
    await user.click(section2Link);

    expect(onValueChange).toHaveBeenCalledWith("section2");
  });

  it("prevents default link behavior on click", async () => {
    window.scrollTo = vi.fn();

    render(<ScrollSpyTest />);

    const section2Link = screen.getByRole("link", { name: /section 2/i });
    const event = fireEvent.click(section2Link);

    expect(event).toBe(false); // Default was prevented
  });

  it("applies active state to correct link", async () => {
    const user = userEvent.setup();
    window.scrollTo = vi.fn();

    render(<ScrollSpyTest />);

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(3);

    // Initially, first link should be active
    expect(links[0]).toHaveAttribute("data-state", "active");
    expect(links[1]).toHaveAttribute("data-state", "inactive");
    expect(links[2]).toHaveAttribute("data-state", "inactive");

    // Click second link
    const secondLink = links[1];
    if (!secondLink) throw new Error("Second link not found");
    await user.click(secondLink);

    await waitFor(() => {
      const updatedLinks = screen.getAllByRole("link");
      expect(updatedLinks[1]).toHaveAttribute("data-state", "active");
    });
  });

  it("supports controlled value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    window.scrollTo = vi.fn();

    const { rerender } = render(
      <ScrollSpyTest value="section1" onValueChange={onValueChange} />,
    );

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(3);
    expect(links[0]).toHaveAttribute("data-state", "active");

    // Click on section 2
    const secondLink = links[1];
    if (!secondLink) throw new Error("Second link not found");
    await user.click(secondLink);
    expect(onValueChange).toHaveBeenCalledWith("section2");

    // Update controlled value
    rerender(<ScrollSpyTest value="section2" onValueChange={onValueChange} />);

    await waitFor(() => {
      expect(links[1]).toHaveAttribute("data-state", "active");
    });
  });

  it("supports uncontrolled value with defaultValue", async () => {
    window.scrollTo = vi.fn();

    render(<ScrollSpyTest defaultValue="section2" />);

    const links = screen.getAllByRole("link");

    await waitFor(() => {
      expect(links[1]).toHaveAttribute("data-state", "active");
    });
  });

  it("generates correct href for links", () => {
    render(<ScrollSpyTest />);

    const links = screen.getAllByRole("link");
    expect(links[0]).toHaveAttribute("href", "#section1");
    expect(links[1]).toHaveAttribute("href", "#section2");
    expect(links[2]).toHaveAttribute("href", "#section3");
  });

  it("sets correct id on sections", () => {
    render(<ScrollSpyTest />);

    const sections = screen.getAllByRole("generic").filter((el) => {
      return el.hasAttribute("data-slot") && el.id;
    });

    const sectionIds = sections.map((s) => s.id);
    expect(sectionIds).toContain("section1");
    expect(sectionIds).toContain("section2");
    expect(sectionIds).toContain("section3");
  });

  it("supports vertical orientation", () => {
    render(<ScrollSpyTest orientation="vertical" />);

    const scrollSpy = screen.getAllByRole("generic").find((el) => {
      return el.hasAttribute("data-slot") && el.dataset.slot === "scroll-spy";
    });

    expect(scrollSpy).toBeDefined();
    expect(scrollSpy).toHaveAttribute("data-orientation", "vertical");
  });

  it("supports horizontal orientation", () => {
    render(<ScrollSpyTest orientation="horizontal" />);

    const scrollSpy = screen.getAllByRole("generic").find((el) => {
      return el.hasAttribute("data-slot") && el.dataset.slot === "scroll-spy";
    });

    expect(scrollSpy).toBeDefined();
    expect(scrollSpy).toHaveAttribute("data-orientation", "horizontal");
  });

  it("calls custom onClick handler on link", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const customOnClick = vi.fn();
    window.scrollTo = vi.fn();

    function CustomScrollSpy() {
      return (
        <ScrollSpy defaultValue="section1" onValueChange={onValueChange}>
          <ScrollSpyNav>
            <ScrollSpyLink value="section1">Section 1</ScrollSpyLink>
            <ScrollSpyLink value="section2" onClick={customOnClick}>
              Section 2
            </ScrollSpyLink>
          </ScrollSpyNav>
          <ScrollSpyViewport>
            <ScrollSpySection value="section1">Content 1</ScrollSpySection>
            <ScrollSpySection value="section2">Content 2</ScrollSpySection>
          </ScrollSpyViewport>
        </ScrollSpy>
      );
    }

    render(<CustomScrollSpy />);

    const section2Link = screen.getByRole("link", { name: /section 2/i });
    await user.click(section2Link);

    expect(customOnClick).toHaveBeenCalled();
    expect(onValueChange).toHaveBeenCalledWith("section2");
  });

  it("handles section registration and unregistration", () => {
    const { unmount } = render(<ScrollSpyTest />);

    const sections = document.querySelectorAll(
      "[data-slot='scroll-spy-section']",
    );
    expect(sections).toHaveLength(3);

    unmount();

    // After unmount, observer should be disconnected
    const sectionsAfter = document.querySelectorAll(
      "[data-slot='scroll-spy-section']",
    );
    expect(sectionsAfter).toHaveLength(0);
  });

  it("supports custom offset", () => {
    const onValueChange = vi.fn();
    window.scrollTo = vi.fn();

    render(<ScrollSpyTest offset={100} onValueChange={onValueChange} />);

    // Offset is used internally for scroll calculations
    // We just verify it renders without errors
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(3);
  });

  it("applies correct data attributes to links", () => {
    render(<ScrollSpyTest />);

    const links = screen.getAllByRole("link");

    links.forEach((link) => {
      expect(link).toHaveAttribute("data-slot", "scroll-spy-link");
      expect(link).toHaveAttribute("data-orientation", "horizontal");
      expect(link).toHaveAttribute("data-state");
    });
  });

  it("applies correct data attributes to sections", () => {
    render(<ScrollSpyTest />);

    const sections = screen.getAllByRole("generic").filter((el) => {
      return (
        el.hasAttribute("data-slot") && el.dataset.slot === "scroll-spy-section"
      );
    });

    sections.forEach((section) => {
      expect(section).toHaveAttribute("data-orientation", "horizontal");
      expect(section).toHaveAttribute("id");
    });
  });

  it("handles multiple sections with same prefix", () => {
    function MultiSectionScrollSpy() {
      return (
        <ScrollSpy defaultValue="intro">
          <ScrollSpyNav>
            <ScrollSpyLink value="intro">Intro</ScrollSpyLink>
            <ScrollSpyLink value="introduction">Introduction</ScrollSpyLink>
            <ScrollSpyLink value="intro-details">Intro Details</ScrollSpyLink>
          </ScrollSpyNav>
          <ScrollSpyViewport>
            <ScrollSpySection value="intro">Intro Content</ScrollSpySection>
            <ScrollSpySection value="introduction">
              Introduction Content
            </ScrollSpySection>
            <ScrollSpySection value="intro-details">
              Intro Details Content
            </ScrollSpySection>
          </ScrollSpyViewport>
        </ScrollSpy>
      );
    }

    render(<MultiSectionScrollSpy />);

    const links = screen.getAllByRole("link");
    expect(links[0]).toHaveAttribute("href", "#intro");
    expect(links[1]).toHaveAttribute("href", "#introduction");
    expect(links[2]).toHaveAttribute("href", "#intro-details");
  });

  it("supports asChild prop on ScrollSpyLink", async () => {
    const user = userEvent.setup();
    window.scrollTo = vi.fn();

    const CustomLinkScrollSpy = () => (
      <ScrollSpy defaultValue="section1">
        <ScrollSpyNav>
          <ScrollSpyLink value="section1" asChild>
            <button type="button">Custom Section 1</button>
          </ScrollSpyLink>
          <ScrollSpyLink value="section2">Section 2</ScrollSpyLink>
        </ScrollSpyNav>
        <ScrollSpyViewport>
          <ScrollSpySection value="section1">Content 1</ScrollSpySection>
          <ScrollSpySection value="section2">Content 2</ScrollSpySection>
        </ScrollSpyViewport>
      </ScrollSpy>
    );

    render(<CustomLinkScrollSpy />);

    const customButton = screen.getByRole("button", {
      name: /custom section 1/i,
    });
    expect(customButton).toBeInTheDocument();
    expect(customButton).toHaveAttribute("data-state", "active");

    await user.click(customButton);
    // Should still work with asChild
    expect(customButton).toHaveAttribute("data-state", "active");
  });

  it("handles empty viewport", () => {
    function EmptyScrollSpy() {
      return (
        <ScrollSpy defaultValue="">
          <ScrollSpyNav>
            <ScrollSpyLink value="section1">Section 1</ScrollSpyLink>
          </ScrollSpyNav>
          <ScrollSpyViewport />
        </ScrollSpy>
      );
    }

    render(<EmptyScrollSpy />);
    expect(screen.getByText("Section 1")).toBeInTheDocument();
  });

  it("updates value when controlled prop changes", async () => {
    window.scrollTo = vi.fn();

    const { rerender } = render(<ScrollSpyTest value="section1" />);

    let links = screen.getAllByRole("link");
    expect(links[0]).toHaveAttribute("data-state", "active");

    rerender(<ScrollSpyTest value="section2" />);

    await waitFor(() => {
      links = screen.getAllByRole("link");
      expect(links[1]).toHaveAttribute("data-state", "active");
    });

    rerender(<ScrollSpyTest value="section3" />);

    await waitFor(() => {
      links = screen.getAllByRole("link");
      expect(links[2]).toHaveAttribute("data-state", "active");
    });
  });
});
