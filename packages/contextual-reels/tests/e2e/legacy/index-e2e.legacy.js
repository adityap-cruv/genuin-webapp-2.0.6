describe("Tag should able to load in provided div", () => {
  it("check for page contain .gen-ext div", async () => {
    await page.goto("http://localhost:3000");
    await page.waitForSelector(".gen-ext");
  });

  it("multiple tags are visible", async () => {
    await page.waitForSelector(".__gen__ext__id__1");
    await page.waitForSelector(".__gen__ext__id__2");
  });
});
