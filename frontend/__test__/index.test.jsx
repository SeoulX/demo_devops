import { render, screen } from "@testing-library/react";
import Home from "../pages/index";
import "@testing-library/jest-dom";
import { useRouter } from "next/router";

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

describe("Home Page", () => {
  beforeEach(() => {
    useRouter.mockReturnValue({
      pathname: "/",
    });
  });

  test("renders the header with title", () => {
    render(<Home />);
    expect(screen.getByText("TimeTrack")).toBeInTheDocument();
  });

  test("renders the main heading", () => {
    render(<Home />);
    expect(
      screen.getByText("Track Your Time, Boost Your Productivity")
    ).toBeInTheDocument();
  });

  test("renders feature sections", () => {
    render(<Home />);
    expect(screen.getByText("Time Tracking")).toBeInTheDocument();
    expect(screen.getByText("Team Management")).toBeInTheDocument();
    expect(screen.getByText("Reports")).toBeInTheDocument();
  });

  test("renders footer with copyright", () => {
    render(<Home />);
    expect(screen.getByText(/TimeTrack. All rights reserved./)).toBeInTheDocument();
  });
});
