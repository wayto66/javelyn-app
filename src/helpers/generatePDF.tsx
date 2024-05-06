import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const generatePDF = (element: HTMLElement | null) => {
  const doc = new jsPDF();

  if (!element) return null;

  const newElement = (
    <>
      <div className=""></div>
    </>
  );

  // Create a temporary React component with the JSON data

  // Convert the React component to an image using html2canvas
  html2canvas(element)
    .then((canvas) => {
      const imgData = canvas.toDataURL("image/png");

      // Add the image to the PDF
      doc.addImage(imgData, "PNG", 10, 10, 190, 277); // Adjust width and height as needed

      // Save the PDF
      doc.save("output.pdf");
    })
    .catch((error) => {
      console.error("Error generating PDF:", error);
    });
};

export default generatePDF;
