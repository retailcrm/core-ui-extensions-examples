# Orders Processing Module

Этот кейс демонстрирует page-case с kanban-доской обработки заказов менеджерами.

## Что показывает пример

- загрузку колонок канбана через backend endpoint-ы модуля;
- реальный список менеджеров и CRM-статусов как отдельные фильтры;
- собственный workflow-статус обработки заказа;
- синхронизацию фильтров страницы в `query string`;
- догрузку карточек в футере каждой колонки;
- простое JSON-хранилище server-side без отдельной базы данных.

## Публикация через новый рецепт

Рецепт публикации:

```bash
make publish-case case=ordersProcessingModule
```

Что делает скрипт:

- читает `cases/ordersProcessingModule/extensionrc.json`;
- собирает zip-архив `dist/ordersProcessingModule.zip`;
- отправляет дескриптор модуля в CRM API.

Для `ordersProcessingModule` включен режим `entrypoint: "script"`.
Это значит:

- в `dist/ordersProcessingModule.zip` поле `manifest.json.entrypoint` будет указывать на собранный JS-файл;
- в CRM по умолчанию уйдет `integrations.embedJs.entrypoint = "/extension/f1f66f07-6f07-4fbb-a8db-9e2543be5f28/script"`.

Также требуются переменные окружения в `.env`:

- `CRM_API_HOST`
- `CRM_API_KEY`
- `MODULE_URL` или `EXTENSION_BASE_URL`

Если нужно, чтобы demo-backend кейса пытался читать реальные данные CRM API v5, можно дополнительно включить:

- `ORDERS_PROCESSING_USE_REAL_API=true`

## URL страницы

`%crm-url%/modules/ordersProcessingModule/board`

## URL страницы и меню

Важно про URL страниц:

- прямой URL страницы в CRM имеет вид `/modules/<moduleCode>/<pageCode>`;
- `moduleCode` — это `code` интеграционного модуля, а не `uuid`.

Для этого кейса корректный адрес страницы:

`%crm-url%/modules/ordersProcessingModule/board`

Страница публикуется в меню:

- корневое меню: `activity_main_menu`;
- порядок: `17`;
- заголовок пункта: `Обработка заказов`.

## Дескриптор страницы

В этом кейсе `pages` описан объектом с настройками меню:

```json
{
  "code": "ordersProcessingModule",
  "name": "Обработка заказов",
  "uuid": "f1f66f07-6f07-4fbb-a8db-9e2543be5f28",
  "version": "0.1.0",
  "entrypoint": "script",
  "stylesheet": true,
  "pages": [
    {
      "code": "board",
      "menu": "activity_main_menu",
      "menuItemOrdering": 17,
      "menuItemTitle": {
        "ru": "Обработка заказов",
        "en": "Order processing",
        "es": "Procesamiento de pedidos"
      },
      "pageHelpLink": null
    }
  ]
}
```

## Особенности демо-backend

- server-side логика вынесена в каталог `server/*`;
- processing state хранится в `server/data/orders-processing-state.json`;
- для демо используется локальный mock catalog заказов и менеджеров;
- при `ORDERS_PROCESSING_USE_REAL_API=true` backend пытается читать менеджеров, CRM-статусы, типы заказов и сами заказы через CRM API v5;
- при ошибке обращения к CRM API backend автоматически откатывается в mock режим;
- в production такой кейс должен использовать полноценный backend-адаптер и нормальное persistence-хранилище вместо локального JSON-файла.
