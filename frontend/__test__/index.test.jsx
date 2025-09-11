import { render, screen, fireEvent } from "@testing-library/react";
import Home from "../pages/index";
import "@testing-library/jest-dom";
import { useRouter } from "next/router";

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

describe("Home Page", () => {
  beforeEach(() => {
    useRouter.mockReturnValue({
      push: jest.fn(),
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
  });

  test("renders footer with copyright", () => {
    render(<Home />);
    expect(screen.getByText(/TimeTrack. All rights reserved./)).toBeInTheDocument();
  });

  test("redirects to the correct page if user is logged in", () => {
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn((key) => {
          if (key === "access_token") return "mock_token";
          if (key === "role") return "Admin";
          return null;
        }),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });

    render(<Home />);
    expect(useRouter().push).toHaveBeenCalledWith("/admin");
  });

  test("redirects to the dashboard for non-admin users", () => {
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn((key) => {
          if (key === "access_token") return "mock_token";
          if (key === "role") return "User";
          return null;
        }),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });

    render(<Home />);

    expect(useRouter().push).toHaveBeenCalledWith("/dashboard");
  });

  test("does not redirect if the user is not logged in", () => {
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(() => null),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });

    render(<Home />);
    expect(useRouter().push).not.toHaveBeenCalled();
  });

  console.log("hala", screen.debug());

  test("renders 'Get Started' and 'Login' buttons", () => {
    render(<Home />);
    expect(screen.getByText("Get Started")).toBeInTheDocument();
    ;});
});
