interface PdfViewerProps {
  pdfUrl: string | null;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ pdfUrl }) => {
  if (!pdfUrl) return <p>No PDF selected</p>;

  const absoluteUrl = pdfUrl.startsWith("/")
    ? pdfUrl
    : `/${pdfUrl}`;

  console.log("PDF URL:", absoluteUrl);

  return (
    <iframe
      src={absoluteUrl}
      title="PDF Viewer"
      width="100%"
      height="500px"
      style={{ border: "1px solid #ccc", borderRadius: 6 }}
    />
  );
};


export default PdfViewer;
