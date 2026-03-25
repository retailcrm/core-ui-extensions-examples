# Tasks Module

Этот кейс демонстрирует page-case с kanban-доской задач, которые назначаются на пользователей CRM.

## Что показывает пример

- публикацию страницы модуля через `pages` в `extensionrc.json`;
- использование sortable-компонентов из `@omnicajs/vue-remote/remote`;
- локальную kanban-доску с перестановкой карточек между статусами;
- отображение нагрузки по исполнителям прямо на странице.

## Публикация

```bash
make publish-case case=tasksModule
```

Для `tasksModule` включен режим `entrypoint: "script"`, поэтому страница публикуется как JS endpoint.

## URL страницы и меню

Страница доступна по адресу:

`%crm-url%/modules/tasksModule/board`

Пункт меню:

- корневое меню: `activity_main_menu`;
- порядок: `16`;
- заголовок: `Задачи CRM`.
