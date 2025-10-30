
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:3000/login")
        page.get_by_label("Email").fill("developer@ghars.site")
        page.get_by_label("Password").fill("developer")
        page.get_by_role("button", name="Login").click()
        page.goto("http://localhost:3000/Developer/classes")
        page.screenshot(path="jules-scratch/verification/classes_page.png")
        browser.close()

run()
