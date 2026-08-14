import DocumentsPage, {
  metadata,
} from "@/app/(documents)/documents/page";

import { verifySession } from "@/lib/dal/auth";

jest.mock("@/lib/dal/auth", () => ({
  verifySession: jest.fn(),
}));

jest.mock("@/features/docs/components/DocumentsHeader", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@/features/docs/components/DocumentList", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@/features/docs/components/DocumentListSkeleton", () => ({
  __esModule: true,
  DocumentListSkeleton: () => null,
}));

describe("DocumentsPage", () => {
  const mockVerifySession =
    verifySession as jest.MockedFunction<typeof verifySession>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("authentication", () => {
    it("calls verifySession when the page is rendered", async () => {
      mockVerifySession.mockResolvedValue(undefined as never);

      await DocumentsPage();

      expect(mockVerifySession).toHaveBeenCalledTimes(1);
    });

    it("calls verifySession before rendering the page", async () => {
      mockVerifySession.mockResolvedValue(undefined as never);

      const tree = await DocumentsPage();

      expect(mockVerifySession).toHaveBeenCalled();
      expect(tree).toBeDefined();
    });
  });

  describe("page structure", () => {
    it("renders the main element", async () => {
      mockVerifySession.mockResolvedValue(undefined as never);

      const tree = await DocumentsPage();

      expect(tree.type).toBe("main");
    });

    it("renders the inner container", async () => {
      mockVerifySession.mockResolvedValue(undefined as never);

      const tree = await DocumentsPage();

      const container = tree.props.children;

      expect(container.type).toBe("div");
    });

    it("renders DocumentsHeader", async () => {
      mockVerifySession.mockResolvedValue(undefined as never);

      const tree = await DocumentsPage();

      const container = tree.props.children;

      const header = container.props.children[0];

      expect(header).toBeDefined();
    });

    it("renders the DocumentList inside Suspense", async () => {
      mockVerifySession.mockResolvedValue(undefined as never);

      const tree = await DocumentsPage();

      const container = tree.props.children;

      const suspense = container.props.children[1];

      expect(suspense.type).toBe(require("react").Suspense);
    });

    it("provides a Suspense fallback for DocumentList", async () => {
      mockVerifySession.mockResolvedValue(undefined as never);

      const tree = await DocumentsPage();

      const container = tree.props.children;

      const suspense = container.props.children[1];

      expect(suspense.props.fallback).toBeDefined();
    });

    it("renders DocumentList as the Suspense child", async () => {
      mockVerifySession.mockResolvedValue(undefined as never);

      const tree = await DocumentsPage();

      const container = tree.props.children;

      const suspense = container.props.children[1];

      expect(suspense.props.children).toBeDefined();
    });
  });
});