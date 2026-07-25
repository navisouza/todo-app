from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC


def test_criar_categoria_aparece_na_sidebar(logged_in_driver, wait):
    name = "Trabalho"

    logged_in_driver.find_element(
        By.CSS_SELECTOR, '[data-testid="new-category-input"]'
    ).send_keys(name)
    logged_in_driver.find_element(
        By.CSS_SELECTOR, '[data-testid="new-category-submit"]'
    ).click()

    wait.until(EC.text_to_be_present_in_element((By.TAG_NAME, "body"), name))
    assert name in logged_in_driver.page_source
