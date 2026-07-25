from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC

from helpers import create_task


def _find_card(driver, title):
    return driver.find_element(
        By.XPATH,
        f'//*[@data-testid="task-title" and text()="{title}"]'
        '/ancestor::*[starts-with(@data-testid, "task-card-")]',
    )


def test_criar_tarefa_aparece_na_lista(logged_in_driver, wait):
    create_task(logged_in_driver, wait, "Revisar PR do time")
    assert "Revisar PR do time" in logged_in_driver.page_source


def test_marcar_tarefa_como_concluida(logged_in_driver, wait):
    title = "Tarefa a concluir"
    create_task(logged_in_driver, wait, title)

    card = _find_card(logged_in_driver, title)
    card.find_element(By.CSS_SELECTOR, '[data-testid="task-checkbox"]').click()

    title_el = card.find_element(By.CSS_SELECTOR, '[data-testid="task-title"]')
    wait.until(lambda d: title_el.value_of_css_property("text-decoration-line") == "line-through")


def test_excluir_tarefa_remove_da_lista(logged_in_driver, wait):
    title = "Tarefa a excluir"
    create_task(logged_in_driver, wait, title)

    card = _find_card(logged_in_driver, title)
    card.find_element(By.CSS_SELECTOR, '[aria-label="Excluir"]').click()

    wait.until_not(lambda d: title in d.page_source)
    assert title not in logged_in_driver.page_source
