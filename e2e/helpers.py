from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC

from config import BASE_URL


def register(driver, wait, user):
    driver.get(f"{BASE_URL}/register")

    driver.find_element(By.CSS_SELECTOR, '[data-testid="register-username"]').send_keys(
        user["username"]
    )
    driver.find_element(By.CSS_SELECTOR, '[data-testid="register-email"]').send_keys(
        user["email"]
    )
    driver.find_element(By.CSS_SELECTOR, '[data-testid="register-password"]').send_keys(
        user["password"]
    )
    driver.find_element(
        By.CSS_SELECTOR, '[data-testid="register-password-confirm"]'
    ).send_keys(user["password"])
    driver.find_element(By.CSS_SELECTOR, '[data-testid="register-submit"]').click()

    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, '[data-testid="new-task-button"]')))


def login(driver, wait, user):
    driver.get(f"{BASE_URL}/login")

    driver.find_element(By.CSS_SELECTOR, '[data-testid="login-username"]').send_keys(
        user["username"]
    )
    driver.find_element(By.CSS_SELECTOR, '[data-testid="login-password"]').send_keys(
        user["password"]
    )
    driver.find_element(By.CSS_SELECTOR, '[data-testid="login-submit"]').click()

    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, '[data-testid="new-task-button"]')))


def create_task(driver, wait, title):
    driver.find_element(By.CSS_SELECTOR, '[data-testid="new-task-button"]').click()
    wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, '[data-testid="task-title-input"]')))

    driver.find_element(By.CSS_SELECTOR, '[data-testid="task-title-input"]').send_keys(title)
    driver.find_element(By.CSS_SELECTOR, '[data-testid="task-save-button"]').click()

    wait.until(
        EC.text_to_be_present_in_element(
            (By.CSS_SELECTOR, '[data-testid="task-title"]'), title
        )
    )
