import time

import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait

from config import BASE_URL


@pytest.fixture
def driver():
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--window-size=1280,900")
    options.add_argument("--no-sandbox")

    # Selenium 4.6+ resolve o chromedriver sozinho (Selenium Manager),
    # não precisa apontar o binário na mão nem baixar via lib separada.
    drv = webdriver.Chrome(options=options)
    drv.implicitly_wait(3)

    yield drv

    drv.quit()


@pytest.fixture
def wait(driver):
    return WebDriverWait(driver, 10)


@pytest.fixture
def new_user():
    """Gera credenciais únicas pra não colidir com usuários de execuções anteriores."""
    stamp = str(int(time.time() * 1000))
    return {
        "username": f"selenium_{stamp}",
        "email": f"selenium_{stamp}@example.com",
        "password": "SenhaForte123!",
    }


@pytest.fixture
def logged_in_driver(driver, wait, new_user):
    """Registra um usuário novo e deixa o driver já na tela de tarefas."""
    from helpers import register

    register(driver, wait, new_user)
    return driver
