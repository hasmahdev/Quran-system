import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)

        try:
            await page.goto("https://quran-system-swart.vercel.app/", timeout=60000)

            await page.get_by_label("username").fill("developer")
            await page.get_by_label("password").fill("admins1")
            await page.get_by_role("button", name="login").click()

            await page.wait_for_url("**/Developer/classes", timeout=30000)

            await page.screenshot(path="jules-scratch/verification/verification.png")

        except Exception as e:
            print(f"An error occurred: {e}")
            await page.screenshot(path="jules-scratch/verification/error_screenshot.png")
        finally:
            await browser.close()

        if console_errors:
            print("\\n--- Console Errors ---")
            for error in console_errors:
                print(error)

if __name__ == "__main__":
    asyncio.run(main())
