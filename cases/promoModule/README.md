# Promo Module

Этот кейс демонстрирует расширение со страницами и виджетом, использующее `runEndpoint`.

## Важно

- На стороне CRM модуль запускается в worker-е.
- Сложные расширения со множеством страниц следует писать через `runEndpoint`.

## Публикация через новый рецепт

Новый рецепт публикации: `make publish-case case=promoModule`.

Что делает скрипт:
- читает `cases/promoModule/extensionrc.json`,
- собирает zip-архив `dist/promoModule.zip`,
- отправляет дескриптор в CRM API.

Что должно быть в кейсе:
- `cases/<case>/extensionrc.json` с полями:
  - `code` — код модуля,
  - `name` — название модуля,
  - `uuid` — UUID модуля,
  - `version` — версия модуля,
  - `targets` — массив целей,
  - `stylesheet` — `true` (автоподстановка `/extension/<uuid>/stylesheet`) или строка,
  - `pages` — массив кодов страниц или объектов с меню и переводами (опционально),
  - `baseUrl` — базовый URL модуля (опционально, можно использовать `MODULE_URL` из `.env`).

Также требуются переменные окружения в `.env`:
- `CRM_API_HOST`
- `CRM_API_KEY`
- `MODULE_URL` (или `EXTENSION_BASE_URL`)

Если используется поднятый локально хост этого репозитория через traefik,
рекомендуется задавать `EXTENSION_BASE_URL` и использовать его как базовый URL модуля.

Примечание по `pages`:
- Если указан `menuItemTitle`, то `ru/en/es` должны быть непустыми строками (CRM не принимает `null`).

## Пример дескриптора в CRM

`pages` в дескрипторе может быть массивом строк (коды страниц) или объектов с настройками меню.

```json
{
  "uuid": "8ebe1617-d609-43e4-b35a-fbfae011eee3",
  "targets": [
    "order/card:common.after"
  ],
  "entrypoint": "https://example.com/extension/8ebe1617-d609-43e4-b35a-fbfae011eee3",
  "stylesheet": "https://example.com/extension/8ebe1617-d609-43e4-b35a-fbfae011eee3/stylesheet",
  "pages": [
    {
      "code": "settings",
      "menu": "settings",
      "parentMenuItemCode": null,
      "menuItemOrdering": 100,
      "menuItemTitle": {
        "ru": "Акции",
        "en": "Promotions",
        "es": null
      },
      "pageHelpLink": null
    }
  ]
}
```
