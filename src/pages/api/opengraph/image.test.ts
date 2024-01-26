import axios, { AxiosResponse } from "axios";

// TODO: add this to github CI; will need to ensure the server is running beforehand
describe("/pages/api/opengraph/image", () => {
  describe("clicking Next on first token in carousel", () => {
    let response: AxiosResponse;
    let html: string;
    beforeAll(async () => {
      response = await axios.post(
        "http://localhost:3001/api/opengraph/image?path=%2Fopengraph%2Fcollection%2F2BLlDN7mVFHs8R1NhD11PTLojF5%2Ffcframe&fallback=https%3A%2F%2Fstorage.googleapis.com%2Fgallery-prod-325303.appspot.com%2Fgallery_full_logo_v2.1.png",
        {
          untrustedData: { buttonIndex: 1 },
        }
      );

      html = response.data;
    });

    it("should return 200", () => {
      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toBe("text/html");
    });

    it("should provide Next and Previous button options", () => {
      expect(html).toContain('<meta property="fc:frame" content="vNext">');
      expect(html).toContain('<meta property="fc:frame:button:1" content="←">');
      expect(html).toContain('<meta property="fc:frame:button:2" content="→">');
    });

    it("should increment the position parameter", () => {
      expect(html).toContain(
        '<meta property="fc:frame:image" content="https://gallery-opengraph.vercel.app/api/opengraph/image?path=%2Fopengraph%2Fcollection%2F2BLlDN7mVFHs8R1NhD11PTLojF5%2Ffcframe&fallback=https%3A%2F%2Fstorage.googleapis.com%2Fgallery-prod-325303.appspot.com%2Fgallery_full_logo_v2.1.png&position=1">'
      );
    });
  });

  describe("clicking Next on second token", () => {
    let response: AxiosResponse;
    let html: string;
    beforeAll(async () => {
      response = await axios.post(
        "http://localhost:3001/api/opengraph/image?path=%2Fopengraph%2Fcollection%2F2BLlDN7mVFHs8R1NhD11PTLojF5%2Ffcframe&fallback=https%3A%2F%2Fstorage.googleapis.com%2Fgallery-prod-325303.appspot.com%2Fgallery_full_logo_v2.1.png&position=1",
        {
          untrustedData: { buttonIndex: 2 },
        }
      );

      html = response.data;
    });

    it("should return 200", () => {
      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toBe("text/html");
    });

    it("should provide Next and Previous button options", () => {
      expect(html).toContain('<meta property="fc:frame" content="vNext">');
      expect(html).toContain('<meta property="fc:frame:button:1" content="←">');
      expect(html).toContain('<meta property="fc:frame:button:2" content="→">');
    });

    it("should increment the position parameter", () => {
      expect(html).toContain(
        '<meta property="fc:frame:image" content="https://gallery-opengraph.vercel.app/api/opengraph/image?path=%2Fopengraph%2Fcollection%2F2BLlDN7mVFHs8R1NhD11PTLojF5%2Ffcframe&fallback=https%3A%2F%2Fstorage.googleapis.com%2Fgallery-prod-325303.appspot.com%2Fgallery_full_logo_v2.1.png&position=2">'
      );
    });
  });

  describe("clicking Previous on second token", () => {
    let response: AxiosResponse;
    let html: string;
    beforeAll(async () => {
      response = await axios.post(
        "http://localhost:3001/api/opengraph/image?path=%2Fopengraph%2Fcollection%2F2BLlDN7mVFHs8R1NhD11PTLojF5%2Ffcframe&fallback=https%3A%2F%2Fstorage.googleapis.com%2Fgallery-prod-325303.appspot.com%2Fgallery_full_logo_v2.1.png&position=1",
        {
          untrustedData: { buttonIndex: 1 },
        }
      );

      html = response.data;
    });

    it("should return 200", () => {
      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toBe("text/html");
    });

    it("should only provide Next button, and not a Previous button", () => {
      expect(html).toContain('<meta property="fc:frame" content="vNext">');
      expect(html).not.toContain(
        '<meta property="fc:frame:button:1" content="←">'
      );
      expect(html).toContain('<meta property="fc:frame:button:1" content="→">');
    });

    it("should not include a position parameter", () => {
      expect(html).toContain(
        '<meta property="fc:frame:image" content="https://gallery-opengraph.vercel.app/api/opengraph/image?path=%2Fopengraph%2Fcollection%2F2BLlDN7mVFHs8R1NhD11PTLojF5%2Ffcframe&fallback=https%3A%2F%2Fstorage.googleapis.com%2Fgallery-prod-325303.appspot.com%2Fgallery_full_logo_v2.1.png">'
      );
    });
  });
});
