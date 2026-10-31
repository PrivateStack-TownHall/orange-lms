const {
  createCertificateBuffer,
  makeCertificateId,
} = require("../src/services/certificate.service");

describe("certificate service", () => {
  const history = {
    id: 7,
    ClassId: 12,
    createdAt: new Date("2026-10-31T00:00:00.000Z"),
    completedAt: new Date("2026-10-31T00:00:00.000Z"),
    User: { name: "Jane Doe" },
    Class: { name: "Full Stack Web Development" },
  };

  it("creates a stable certificate identifier", () => {
    expect(makeCertificateId(history)).toBe("OK-2026-012-0007");
  });

  it("generates a PDF certificate in memory", async () => {
    const { buffer, certificateId } = await createCertificateBuffer(history);

    expect(certificateId).toBe("OK-2026-012-0007");
    expect(buffer.subarray(0, 4).toString()).toBe("%PDF");
    expect(buffer.length).toBeGreaterThan(1000);
  });
});
