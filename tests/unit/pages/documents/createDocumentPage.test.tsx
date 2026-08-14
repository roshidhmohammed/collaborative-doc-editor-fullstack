import CreateDocumentPage from "@/app/(documents)/create-document/page";



jest.mock("@/features/docs/components/CreateDocuments", () => {
  const MockCreateDocument = () => null;

  return {
    __esModule: true,
    default: MockCreateDocument,
  };
});

describe("CreateDocumentPage", () => {
  it("renders the page root", async () => {
    const tree = await CreateDocumentPage();

    expect(tree.type).toBe("div");
  });

  it("renders the CreateDocument component", async () => {
    const tree = await CreateDocumentPage();
    expect(tree.props.children).toBeDefined();
    expect(tree.props.children.type).toBeDefined();
  });

  it("does not pass props to CreateDocument", async () => {
    const tree = await CreateDocumentPage();

    const child = tree.props.children;

    expect(child).toBeDefined();
    expect(child.props).toEqual({});
  });
});