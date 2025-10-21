from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Go to the login page
    page.goto("http://localhost:3000/login")

    # Fill in the password and login
    page.get_by_label("كلمة المرور").fill("123")
    page.get_by_role("button", name="تسجيل الدخول").click()

    # Go to the students page
    page.goto("http://localhost:3000/admin/students")

    # Wait for the page to load
    page.wait_for_selector("text=الطلاب")

    # Take a screenshot
    page.screenshot(path="jules-scratch/verification/students_page.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
