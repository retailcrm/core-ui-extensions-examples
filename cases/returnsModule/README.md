# Returns Module

Этот кейс демонстрирует page-case для раздела `Продажи`, публикуемый через `pages` в `extensionrc.json`.

## Что показывает пример

- добавление страницы модуля в меню CRM;
- публикацию page-case через новый рецепт `make publish-case`;
- использование `entrypoint: "script"` для страницы на `runEndpoint`;
- хранение фильтров и пагинации в `query string`;
- загрузку списка возвратов и сохранение через `host.httpCall()`;
- поиск заказа по номеру в шторке создания и редактирования.

## Публикация через новый рецепт

Рецепт публикации:

```bash
make publish-case case=returnsModule
```

Что делает скрипт:
- читает `cases/returnsModule/extensionrc.json`;
- собирает zip-архив `dist/returnsModule.zip`;
- отправляет дескриптор модуля в CRM API.

Для `returnsModule` включен режим `entrypoint: "script"`.
Это значит:
- в `dist/returnsModule.zip` поле `manifest.json.entrypoint` будет указывать на собранный JS-файл;
- в CRM по умолчанию уйдет `integrations.embedJs.entrypoint = "/extension/79aa7a7a-3b66-4e85-b623-f7c1fef97bc7/script"`.

Также требуются переменные окружения в `.env`:
- `CRM_API_HOST`
- `CRM_API_KEY`
- `MODULE_URL` или `EXTENSION_BASE_URL`

## URL страницы и меню

Важно про URL страниц:
- прямой URL страницы в CRM имеет вид `/modules/<moduleCode>/<pageCode>`;
- `moduleCode` — это `code` интеграционного модуля, а не `uuid`.

Для этого кейса корректный адрес страницы:

`%crm-url%/modules/returnsModule/returns`

Страница публикуется в меню:
- корневое меню: `activity_main_menu`;
- порядок: `15`;
- заголовок пункта: `Возвраты`.

## Дескриптор страницы

В этом кейсе `pages` описан объектом с настройками меню:

```json
{
  "code": "returnsModule",
  "name": "Возвраты",
  "uuid": "79aa7a7a-3b66-4e85-b623-f7c1fef97bc7",
  "version": "0.1.0",
  "entrypoint": "script",
  "stylesheet": true,
  "pages": [
    {
      "code": "returns",
      "menu": "activity_main_menu",
      "menuItemOrdering": 15,
      "menuItemTitle": {
        "ru": "Возвраты",
        "en": "Returns",
        "es": "Devoluciones"
      },
      "pageHelpLink": null
    }
  ]
}
```
