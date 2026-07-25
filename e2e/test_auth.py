from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC

from config import BASE_URL
from helpers import login, register


def test_registro_redireciona_para_tela_de_tarefas(driver, wait, new_user):
    register(driver, wait, new_user)
    assert "Minhas tarefas" in driver.page_source


def test_login_com_credenciais_validas(driver, wait, new_user):
    register(driver, wait, new_user)

    driver.find_element(By.CSS_SELECTOR, '[data-testid="logout-button"]').click()
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, '[data-testid="login-username"]')))

    login(driver, wait, new_user)
    assert "Minhas tarefas" in driver.page_source


def test_login_com_senha_errada_mostra_erro(driver, wait, new_user):
    register(driver, wait, new_user)
    driver.find_element(By.CSS_SELECTOR, '[data-testid="logout-button"]').click()
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, '[data-testid="login-username"]')))

    driver.get(f"{BASE_URL}/login")
    driver.find_element(By.CSS_SELECTOR, '[data-testid="login-username"]').send_keys(
        new_user["username"]
    )
    driver.find_element(By.CSS_SELECTOR, '[data-testid="login-password"]').send_keys(
        "senha-errada-de-proposito"
    )
    driver.find_element(By.CSS_SELECTOR, '[data-testid="login-submit"]').click()

    wait.until(EC.text_to_be_present_in_element((By.TAG_NAME, "body"), "inválidos"))
    assert "Usuário ou senha inválidos" in driver.page_source
