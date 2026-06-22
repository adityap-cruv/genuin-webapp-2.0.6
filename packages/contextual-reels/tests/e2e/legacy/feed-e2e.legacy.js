describe("Check Feed is loaded", () => {
  it("check for page contain .gen-ext div", async () => {
    await page.goto("http://localhost:3000/cxr-experiment");
    await page.waitForSelector(".gen-ext");
  });

  it("check for feed length is equal to loaded slides", async () => {
    const slide_selector = ".__gen__ext__id__1 > div.swiper-container > div > .swiper-wrapper > .swiper-slide";
    await page.waitForSelector(slide_selector);
    const slides = await page.$$(slide_selector);
    expect(slides.length).toBe(6);
  });
});
