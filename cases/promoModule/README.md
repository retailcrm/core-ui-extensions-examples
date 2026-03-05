# Promo Module

Этот кейс демонстрирует расширение со страницами и виджетом, использующее `runEndpoint`.

## Важно

- На стороне CRM модуль запускается в worker-е.
- Сложные расширения со множеством страниц следует писать через `runEndpoint`.

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
