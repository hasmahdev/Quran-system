from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto("http://localhost:3000/login")
    page.locator("#password").fill("admins1")
    page.get_by_role("button", name="دخول").click()
    page.wait_for_url("http://localhost:3000/admin/students")
    page.screenshot(path="jules-scratch/verification/admin_students.png")
    browser.close()
