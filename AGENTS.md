# AGENTS.md

## Purpose

Этот файл задает рабочие правила для AI-ассистентов в репозитории
`core-ui-extensions-examples`.

Главная цель: если задача связана с extension UI, examples, screen composition
или подбором компонентов из `@retailcrm`, ассистент должен сначала читать
инструкции установленного пакета `@retailcrm/embed-ui-v1-components`,
а уже потом генерировать код.

## Repository Shape

- Это examples-репозиторий для UI-расширений.
- Основные кейсы лежат в `cases/*`.
- Если пользователь просит "создать пример", обычно нужно:
  - либо дополнить существующий кейс в `cases/*`,
  - либо добавить новый самостоятельный example-case в `cases/*`.

## UI Instruction Source Of Truth

Если задача касается UI на `@retailcrm/embed-ui-v1-components`, читать в таком порядке:

1. `node_modules/@retailcrm/embed-ui-v1-components/docs/AI.md`
2. `node_modules/@retailcrm/embed-ui-v1-components/docs/COMPONENTS.md`
3. нужный профиль из `node_modules/@retailcrm/embed-ui-v1-components/docs/profiles/*`

Если нужного профиля нет:

1. использовать `COMPONENTS.md` как карту;
2. опираться на публичный API пакета;
3. смотреть существующие примеры в `cases/*`;
4. не додумывать private API и internal imports.

## Rules For UI Tasks

- Для extension UI code использовать только публичные импорты из
  `@retailcrm/embed-ui-v1-components/remote`.
- Для иконок и статики использовать только публичные пути
  `@retailcrm/embed-ui-v1-components/assets/...`.
- Не импортировать из `host`, `src/*`, `dist/*` и других внутренних путей пакета,
  если это не запрошено явно.
- Если профиль компонента существует, считать его основным usage guide.
- Если поведение не описано в профиле, явно опираться на public API и текущие examples,
  а inference обозначать как inference.
- При сборке экранов сначала выбрать подходящие компоненты по инструкциям,
  потом собирать layout и interactions.

## Default Mental Model

- `UiField` использовать для labeled form controls.
- `UiTextbox`, `UiSelect`, `UiCheckbox`, `UiSwitch` использовать как базовые form primitives.
- `UiPageHeader` использовать для page-level titles и section-level headers.
- `UiButton`, `UiToolbarButton`, `UiToolbarLink`, `UiLink` использовать для действий и навигации.
- Если можно собрать экран на готовых публичных компонентах, не заменять их самодельной версткой.

## How To Read Short User Requests

Если пользователь пишет коротко, например:

- "добавь на страницу следующие элементы"
- "создай пример"
- "собери экран настроек"

ассистент должен по умолчанию интерпретировать это так:

1. найти подходящий кейс или создать новый example-case;
2. подобрать компоненты через инструкции `@retailcrm/embed-ui-v1-components`;
3. использовать только public API;
4. собрать рабочий пример с адекватными default states;
5. задавать уточняющие вопросы только если без них есть реальный риск собрать не тот экран.

## Best Task Format

Самый удобный формат постановки UI-задачи в этом репозитории:

```md
Сделай example/page для <feature>.

Цель:
- что должен показывать экран

Структура:
- что сверху
- что в контенте
- что в actions

Поведение:
- editable / readonly / invalid / loading / empty
- что происходит по клику

Ограничения:
- только public API @retailcrm
- использовать существующие patterns examples-репозитория
```

Но если пользователь пишет короче, ассистент должен сам достроить разумную структуру
по инструкциям и существующим examples.

## User Request Examples

Примеры запросов, которые ассистент должен понимать без дополнительных уточнений:

```md
Создай example страницы сегментов.

Нужно:
- UiPageHeader с editable title
- рядом ссылка "Свернуть фильтр"
- справа кнопка "Действия"
- ниже форма с UiField + UiTextbox и UiField + UiSelect
- внизу primary и secondary actions

Поведение:
- заголовок обязателен
- если пустой, показать invalid state
- использовать только public API @retailcrm
```

```md
Добавь на страницу настроек следующие элементы:
- UiPageHeader
- блок с предупреждением через UiAlert
- поле названия через UiField и UiTextbox
- переключатель через UiSwitch
- кнопку сохранения

Собери это как аккуратный example в стиле существующих cases.
```

```md
Создай новый example для настроек уведомлений.

Цель:
- показать типовой settings screen на embed-ui components

Ограничения:
- не использовать внутренние импорты
- сначала опираться на инструкции пакета
- если подходящий компонент не найден, скажи об этом явно
```

## Copy-Paste Template

Шаблон, который пользователь может просто копировать и заполнять:

```md
Сделай example/page для: <название фичи или экрана>

Цель:
- <что пользователь должен увидеть или сделать>

Где делать:
- <новый example в cases/* или доработка существующего case>

Нужно добавить:
- <компонент или блок 1>
- <компонент или блок 2>
- <компонент или блок 3>

Структура:
- сверху: <header / filters / actions>
- контент: <form / table / cards / alert / empty state>
- снизу: <buttons / footer actions>

Поведение:
- <что editable>
- <что required>
- <что происходит по клику>
- <нужны ли loading / invalid / empty states>

Ограничения:
- использовать только public API `@retailcrm/embed-ui-v1-components`
- сначала опираться на package instructions
- <другие ограничения проекта, если есть>

Ожидаемый результат:
- <что именно должно появиться в example>
```

## Fallback Sources

Если после чтения package docs информации не хватает, использовать:

- существующие example-cases в `cases/*`;
- локальные типы и код этого репозитория;
- package public types из `node_modules/@retailcrm/embed-ui-v1-components`.

При этом examples в этом репозитории являются вспомогательным источником,
а не заменой package instructions.

## Validation

Перед завершением UI-задачи по возможности прогонять релевантные проверки:

- `yarn lint`
- `yarn typecheck`
- `yarn build`

Если проверка не запускалась или уперлась в окружение, это нужно явно сообщать.
