# Возвраты

## Что нужно сделать

Нужно добавить в раздел `Продажи` новый подраздел `Возвраты`, расположив его сразу после `Заказы`.

В разделе `Возвраты` должна быть кнопка `Создать возврат`.

### Список возвратов

На странице списка возвратов должны быть доступны фильтры:

- Дата
- Статус
- Заказ по номеру
- Сумма

В списке возвратов нужно вывести данные так, чтобы записей хватало минимум на несколько страниц пагинации. Для каждого возврата отображаются:

- Дата
- Статус
- Заказ
- Сумма
- Список товаров в формате, аналогичном отображению товаров в списке заказов

### Query string

При открытии создания или редактирования возврата состояние интерфейса должно отражаться в `query string`. В `query string` также должны сохраняться фильтры и пагинация списка.

По клику на возврат должна открываться шторка редактирования. При этом в `query string` списка должен передаваться `id=<return_id>`.

### Шторка редактирования

Состав полей в шторке редактирования:

- Дата: только для просмотра, без редактирования
- Статус
- Заказ: по умолчанию отображается номер выбранного заказа, при необходимости заказ можно заменить через поиск по номеру
- Товары: в режиме редактирования поле отображается только для просмотра

### Шторка создания

Состав полей в шторке создания:

- Дата
- Статус
- Заказ с возможностью поиска по номеру

Поле `Товары` в шторке создания не выводится.

## План реализации

### 1. Завести новый кейс страницы

Создать новый кейс, условно `cases/returnsModule`, не как обычный виджет через `createWidgetEndpoint`, а как модуль со страницей через `runEndpoint` и `definePageRunner`.

Опорный код:

- [cases/promoModule/index.ts](cases/promoModule/index.ts)
- [cases/promoModule/extensionrc.json](cases/promoModule/extensionrc.json)
- [cases/promoModule/README.md](cases/promoModule/README.md)

Почему так:

- `promoModule` уже показывает правильный шаблон для кейса, где одновременно есть endpoint и страница;
- для страницы в меню это ближе к реальной целевой архитектуре, чем обычные карточные виджеты.

### 2. Подключить страницу в меню CRM правильно

Страницу нужно публиковать через `pages` в `extensionrc.json`, а не пытаться встраивать её как target карточки.

Опорный код:

- [cases/promoModule/extensionrc.json](cases/promoModule/extensionrc.json)
- [scripts/publish-extension.js](scripts/publish-extension.js)
- [/home/kirill/Workspace/Simla/crm/src/Intaro/CRMIntegrationBundle/Tests/Controller/NativeEmbedJsApiTest.php](/home/kirill/Workspace/Simla/crm/src/Intaro/CRMIntegrationBundle/Tests/Controller/NativeEmbedJsApiTest.php)

Что важно учесть:

- `pages` уходят в CRM API через `integrations.embedJs.pages`, это видно в [scripts/publish-extension.js](scripts/publish-extension.js);
- у страницы должны быть `code`, `menu`, `menuItemOrdering`, `menuItemTitle`;
- для нашего случая корневое меню должно быть `activity_main_menu`.

### 3. Поставить пункт меню именно после "Заказы"

Здесь важна не только декларация `menu`, но и способ встраивания в структуру меню CRM.

Опорный код:

- [/home/kirill/Workspace/Simla/crm/src/Intaro/CRMBundle/Resources/config/navigation.yml](/home/kirill/Workspace/Simla/crm/src/Intaro/CRMBundle/Resources/config/navigation.yml)
- [/home/kirill/Workspace/Simla/crm/src/Intaro/CRMIntegrationBundle/EmbedJs/MenuRouteProvider.php](/home/kirill/Workspace/Simla/crm/src/Intaro/CRMIntegrationBundle/EmbedJs/MenuRouteProvider.php)
- [/home/kirill/Workspace/Simla/crm/src/Intaro/CRMIntegrationBundle/Tests/EmbedJs/MenuRouteProviderTest.php](/home/kirill/Workspace/Simla/crm/src/Intaro/CRMIntegrationBundle/Tests/EmbedJs/MenuRouteProviderTest.php)

Практический вывод для реализации:

- `orders` в `activity_main_menu` имеет приоритет `10`, `customers` имеет приоритет `20`;
- если нужен отдельный пункт верхнего уровня сразу после `Заказы`, логично поставить `menuItemOrdering: 15`;
- `parentMenuItemCode: "orders"` здесь не подходит, потому что `orders` в CRM не имеет дочернего меню, а [MenuRouteProvider](/home/kirill/Workspace/Simla/crm/src/Intaro/CRMIntegrationBundle/EmbedJs/MenuRouteProvider.php) не добавляет подпункты в системные пункты без детей.

То есть для этой задачи нужен именно новый корневой пункт в `activity_main_menu`, а не подпункт у `orders`.

### 4. Реализовать страницу списка возвратов как embed page

Нужно сделать полноценную страницу модуля с таблицей, фильтрами, пагинацией и шторкой.

Опорный код:

- [/home/kirill/Workspace/Simla/crm/src/Intaro/CRMIntegrationBundle/Controller/EmbedJsController.php](/home/kirill/Workspace/Simla/crm/src/Intaro/CRMIntegrationBundle/Controller/EmbedJsController.php)
- [/home/kirill/Workspace/Simla/crm/src/Intaro/CRMIntegrationBundle/Resources/views/EmbedJs/modulePage.html.twig](/home/kirill/Workspace/Simla/crm/src/Intaro/CRMIntegrationBundle/Resources/views/EmbedJs/modulePage.html.twig)
- [/home/kirill/Workspace/Simla/crm/web/js_entry/embed_page.js](/home/kirill/Workspace/Simla/crm/web/js_entry/embed_page.js)
- [cases/promoModule/SettingsPage.vue](cases/promoModule/SettingsPage.vue)

Что это нам говорит:

- CRM монтирует страницу в контейнер `#embed-page`;
- в страницу прокидываются `data-module-code` и `data-page-code`;
- сам маршрут страницы формируется CRM как `/modules/<moduleCode>/<pageCode>`, а не как target виджета;
- `moduleCode` здесь — это `code` интеграционного модуля, а не `uuid`;
- для нашего кейса корректный адрес страницы после публикации: `%crm-url%/modules/returnsModule/returns`.

### 5. Продумать состояние страницы через query string

Для страницы нужно сразу заложить единый слой состояния URL:

- фильтры;
- номер страницы пагинации;
- режим шторки: создание или редактирование;
- `id` выбранного возврата.

Для этого лучше использовать штатный API хоста из `embed-ui`, а не работать с `window.history` напрямую.

Опорный код по структуре page-case:

- [cases/promoModule/index.ts](cases/promoModule/index.ts)
- [node_modules/@retailcrm/embed-ui/index.d.ts](node_modules/@retailcrm/embed-ui/index.d.ts)
- [node_modules/@retailcrm/embed-ui-v1-types/host.d.ts](node_modules/@retailcrm/embed-ui-v1-types/host.d.ts)
- [/home/kirill/Workspace/Simla/crm/web/js_entry/embed_page.js](/home/kirill/Workspace/Simla/crm/web/js_entry/embed_page.js)

Что есть в API `useHost()`:

- `getLocation(): HostLocation` возвращает `pathname`, `search`, `hash` и разобранный `query`;
- `replaceQuery(query, options?)` заменяет `query string`;
- `pushQuery(query, options?)` добавляет запись в историю;
- `preserveExisting?: boolean` позволяет обновлять query без потери существующих параметров.

Практический вывод:

- начальное состояние страницы нужно читать через `host.getLocation().query`;
- изменения фильтров и пагинации удобнее обновлять через `host.replaceQuery(...)`;
- открытие отдельного возврата или переходы, которые должны оставаться в истории браузера, можно делать через `host.pushQuery(...)`.

Нюанс реализации:

- методы `useHost()` асинхронные, это нормально для нашей задачи;
- при разработке логики нужно сразу строить работу с query string через `await host.getLocation()`, `await host.replaceQuery(...)` и `await host.pushQuery(...)`;
- локальное состояние страницы стоит синхронизировать с учетом того, что обновление query происходит не мгновенно.

### 6. Смоделировать backend через `server.mjs`

Backend для кейса нужно симулировать локально в [server.mjs](server.mjs), по аналогии с уже существующими примерами.

Опорный код:

- [server.mjs](server.mjs)
- [cases/orderNotes/WidgetApp.vue](cases/orderNotes/WidgetApp.vue)
- [cases/orderPromo/WidgetApp.vue](cases/orderPromo/WidgetApp.vue)
- [cases/fiscalReceipts/WidgetApp.vue](cases/fiscalReceipts/WidgetApp.vue)

Что уже есть в репозитории:

- `orderNotes` использует `host.httpCall('/notes')` и `host.httpCall('/notes/new')`, а mock-обработчики лежат в [server.mjs](server.mjs);
- `orderPromo` использует `host.httpCall('/promos')`;
- `fiscalReceipts` показывает похожий сценарий "счетчик + список + шторка".

Для `returnsModule` логично сразу заложить такие mock endpoint-ы:

- `/returns-count`
- `/returns`
- `/return`
- `/returns/save`
- `/orders/search`

Названия можно скорректировать по мере реализации, но сам подход должен быть таким же: страница общается только через `host.httpCall()`, а `server.mjs` отдает демонстрационные данные.

### 7. Учесть, как `host.httpCall()` реально ходит через CRM

Для понимания границ интеграции полезно помнить, что `host.httpCall()` не идет напрямую из браузера в наш mock-сервер: запрос идет через GraphQL-мутацию CRM, а уже CRM делает backend-вызов по конфигурации интеграции.

Опорный код:

- [/home/kirill/Workspace/Simla/crm/web-next/src/api/mutations/makeEmbedJsHttpCall.ts](/home/kirill/Workspace/Simla/crm/web-next/src/api/mutations/makeEmbedJsHttpCall.ts)
- [/home/kirill/Workspace/Simla/crm/src/Intaro/CRMIntegrationBundle/GraphQL/Mutation/EmbedJsMutation.php](/home/kirill/Workspace/Simla/crm/src/Intaro/CRMIntegrationBundle/GraphQL/Mutation/EmbedJsMutation.php)
- [/home/kirill/Workspace/Simla/crm/src/Intaro/CRMIntegrationBundle/Resources/config/graphql/AppMutation.types.yml](/home/kirill/Workspace/Simla/crm/src/Intaro/CRMIntegrationBundle/Resources/config/graphql/AppMutation.types.yml)

Практический вывод:

- фронт кейса должен пользоваться именно `host.httpCall()`;
- для локальной отладки сервер модуля должен быть доступен CRM по `baseUrl`;
- mock API в `server.mjs` нужно проектировать как backend-методы модуля, а не как внутренние фронтовые заглушки.

### 8. Зарегистрировать кейс в этом репозитории

Чтобы новый кейс полноценно жил в этом репозитории, недостаточно только папки в `cases/`.

Опорный код:

- [webpack.config.js](webpack.config.js)
- [cases.json](cases.json)
- [README.md](README.md)

Что потребуется:

- добавить новую папку `cases/returnsModule`;
- завести `index.ts`, `package.json`, `extensionrc.json` и компоненты страницы;
- добавить запись в [cases.json](cases.json), чтобы локальный [server.mjs](server.mjs) умел отдавать `/extension/:uuid`, `/script` и `/stylesheet`;
- убедиться, что кейс автоматически подхватывается сборкой через `cases/*/index.ts`, как это уже сделано в [webpack.config.js](webpack.config.js).

### 9. Порядок выполнения

Предлагаю делать в таком порядке:

1. Создать каркас `cases/returnsModule` по образцу `promoModule`.
2. Завести `extensionrc.json` с `pages` для `activity_main_menu` и `menuItemOrdering: 15`.
3. Собрать пустую страницу и убедиться, что она открывается из меню.
4. Добавить локальное состояние `query string`.
5. Реализовать mock API в `server.mjs`.
6. Подключить загрузку списка, фильтры, пагинацию и открытие шторки.
7. Добавить сценарии создания и редактирования.
8. Прогнать `yarn typecheck` и ручную проверку страницы в CRM.

## Рабочие допущения

- Новый кейс называем `returnsModule`, если по коду не понадобится более короткое имя.
- Пункт `Возвраты` добавляем как самостоятельный корневой пункт в `Продажи`, а не как подпункт `Заказы`.
- В демо-версии данные возвратов и поиска заказов полностью мокируются через `server.mjs`.
