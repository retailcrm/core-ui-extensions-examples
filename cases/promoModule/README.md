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

Важно про URL страниц:
- прямой URL страницы в CRM имеет вид `/modules/<moduleCode>/<pageCode>`,
- `moduleCode` — это `code` интеграционного модуля (из `extensionrc.json`), а не `uuid` расширения.
Например, для `code=promoModule` и `pageCode=settings` корректный адрес — `/modules/promoModule/settings`.

## Меню

Поля `menu` и `parentMenuItemCode` определяют, где появится пункт меню модуля.

Что указывать в `menu`:
- это код корневого меню CRM (в текущей CRM-конфигурации это `activity_main_menu` и `private_main_menu`),
- значение берется из ключей верхнего уровня в `crm/src/Intaro/CRMBundle/Resources/config/navigation.yml`.

Что указывать в `parentMenuItemCode`:
- это код пункта меню внутри выбранного корневого меню,
- если `parentMenuItemCode` не указан, модуль создаст собственный корневой пункт меню,
- можно указывать `page:<code>` чтобы привязать страницу как подпункт к странице модуля.

Примеры кодов (по `navigation.yml`, могут зависеть от фич и прав):
- `activity_main_menu`: `orders`, `customers`, `communications`, `managers`.
- `private_main_menu`: `sites`, `dictionaries`, `statuses`, `message_templates`, `integration_list`, `integration`, `settings`, `logs`.

Важно:
- подпункт добавится только если у родительского пункта уже есть подменю (для системных пунктов без детей подпункт не добавляется),
- видимость пунктов меню зависит от прав пользователя и фич-тогглов CRM.

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
      "menu": "private_main_menu",
      "parentMenuItemCode": "settings",
      "menuItemOrdering": 100,
      "menuItemTitle": {
        "ru": "Акции",
        "en": "Promotions",
        "es": "Promociones"
      },
      "pageHelpLink": null
    }
  ]
}
```
