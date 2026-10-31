const PDFDocument = require("pdfkit");

const ORANGE = "#F97316";
const INK = "#111827";
const PAPER = "#FFFDF8";

const makeCertificateId = (history) => {
  const year = new Date(history.completedAt || history.createdAt).getFullYear();
  return `OK-${year}-${String(history.ClassId).padStart(3, "0")}-${String(history.id).padStart(4, "0")}`;
};

const formatDate = (value) =>
  new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));

const fitText = (doc, text, maxWidth, initialSize, minSize = 20) => {
  let size = initialSize;
  doc.fontSize(size);

  while (doc.widthOfString(text) > maxWidth && size > minSize) {
    size -= 1;
    doc.fontSize(size);
  }

  return size;
};

const drawBrand = (doc) => {
  doc.save();
  doc.strokeColor(ORANGE).lineWidth(5).lineCap("round");
  doc.moveTo(346, 62).lineTo(330, 77).lineTo(346, 92).stroke();
  doc.moveTo(380, 60).lineTo(365, 95).stroke();
  doc.moveTo(399, 62).lineTo(415, 77).lineTo(399, 92).stroke();
  doc.restore();

  doc.font("Helvetica-Bold").fontSize(20);
  const orangeWidth = doc.widthOfString("ORANGE") + 14;
  const kodeWidth = doc.widthOfString("KODE");
  const start = (842 - orangeWidth - kodeWidth) / 2;
  doc.fillColor(ORANGE).text("ORANGE", start, 106, { characterSpacing: 2 });
  doc.fillColor(INK).text("KODE", start + orangeWidth, 106, { characterSpacing: 2 });
};

const drawCornerCode = (doc, x, y, direction = 1) => {
  const mirror = (value) => x + value * direction;
  doc.save().opacity(0.1).strokeColor(ORANGE).lineWidth(14).lineCap("round");
  doc.moveTo(mirror(24), y).lineTo(mirror(0), y + 23).lineTo(mirror(24), y + 46).stroke();
  doc.moveTo(mirror(54), y - 4).lineTo(mirror(34), y + 51).stroke();
  doc.moveTo(mirror(66), y).lineTo(mirror(90), y + 23).lineTo(mirror(66), y + 46).stroke();
  doc.restore();
};

const drawSeal = (doc) => {
  const x = 730;
  const y = 470;

  doc.save().strokeColor(ORANGE).lineWidth(2);
  doc.circle(x, y, 47).stroke();
  doc.circle(x, y, 40).stroke();
  doc.fillColor(ORANGE).font("Helvetica-Bold").fontSize(26).text("</>", x - 25, y - 15, {
    width: 50,
    align: "center",
  });
  doc.moveTo(x - 24, y + 42).lineTo(x - 38, y + 83).lineTo(x - 6, y + 64).lineTo(x + 8, y + 85).lineTo(x + 27, y + 43).fill(ORANGE);
  doc.restore();
};

const createCertificateBuffer = (history) =>
  new Promise((resolve, reject) => {
    const document = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margin: 0,
      info: {
        Title: `Orange Kode Certificate - ${history.User.name}`,
        Author: "Orange Kode",
      },
    });
    const chunks = [];
    const certificateId = makeCertificateId(history);

    document.on("data", (chunk) => chunks.push(chunk));
    document.on("end", () => resolve({ buffer: Buffer.concat(chunks), certificateId }));
    document.on("error", reject);

    const name = history.User.name.toUpperCase();
    const className = history.Class.name.toUpperCase();
    const completedAt = history.completedAt || history.createdAt;

    document.rect(0, 0, 842, 595).fill(PAPER);
    document.lineWidth(5).strokeColor(ORANGE).rect(16, 16, 810, 563).stroke();
    document.lineWidth(1.5).strokeColor(ORANGE).rect(26, 26, 790, 543).stroke();

    drawCornerCode(document, 42, 52, 1);
    drawCornerCode(document, 800, 52, -1);
    drawCornerCode(document, 42, 487, 1);

    drawBrand(document);
    document.font("Times-Bold").fontSize(42).fillColor(INK).text("CERTIFICATE OF COMPLETION", 0, 167, {
      width: 842,
      align: "center",
    });
    document.font("Times-Roman").fontSize(18).fillColor(INK).text("This certificate is proudly presented to", 0, 229, {
      width: 842,
      align: "center",
    });

    document.strokeColor(ORANGE).lineWidth(2).moveTo(198, 297).lineTo(644, 297).stroke();
    fitText(document, name, 560, 32);
    document.font("Times-Bold").fillColor(INK).text(name, 141, 307, { width: 560, align: "center" });

    document.font("Times-Roman").fontSize(18).fillColor(INK).text("for successfully completing", 0, 359, {
      width: 842,
      align: "center",
    });
    fitText(document, className, 620, 27, 18);
    document.font("Times-Bold").fillColor(ORANGE).text(className, 111, 388, {
      width: 620,
      align: "center",
    });

    document.font("Times-Roman").fontSize(13).fillColor(INK).text(`Completed on ${formatDate(completedAt)}`, 0, 429, {
      width: 842,
      align: "center",
    });
    document.font("Helvetica").fontSize(10).fillColor(INK).text(`Certificate ID: ${certificateId}`, 0, 536, {
      width: 842,
      align: "center",
      characterSpacing: 1,
    });

    document.strokeColor(INK).lineWidth(0.7).moveTo(174, 487).lineTo(334, 487).stroke();
    document.font("Times-Roman").fontSize(12).text("Program Director", 174, 496, { width: 160, align: "center" });
    document.strokeColor(INK).lineWidth(0.7).moveTo(490, 487).lineTo(650, 487).stroke();
    document.font("Times-Roman").fontSize(12).text("Lead Instructor", 490, 496, { width: 160, align: "center" });
    drawSeal(document);
    document.end();
  });

module.exports = {
  createCertificateBuffer,
  makeCertificateId,
};
