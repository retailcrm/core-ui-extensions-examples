Примеры JS-модулей для RetailCRM / Simla.com.

[Документация по разработке JS-модулей](https://docs.retailcrm.ru/Developers/modules/PublishingModuleMarketplace/JsModules).

## Описание примеров

Во всех примерах используется библиотека `vue-i18n` и тексты компонентов выводятся на языке системы.
В разрабатываемых модулях требуется использовать тот же подход, подготавливая переводы на русском, английском и испанском.

### 1. Кнопки перехода в мессенджеры `cases/customerPhone`

Пример позволяет добавить рядом с номером телефона клиента на странице заказа и клиента кнопки перехода в мессенджеры по этому номеру.

В данном примере можно увидеть, как встраивать модуль в таргеты с разным контекстом и корректно читать данные из него.

### 2. Чеки в блоке Оплата `cases/fiscalReceipts`

Данный пример:
* выводит кнопку «Фискальные чеки» в блоке «Оплата» 
* подтягивает с бекенда модуля количество чеков, выбитых по заказу, и показывает в кнопке
* по нажатию на кнопку открывает шторку, в которой загружается с бекенда модуля и отображается перечень чеков с их детализацией

По данному примеру можно понять, как взаимодействовать с бекендом модуля и отображать данные из сторонней системы в шторке.
Также в примере можно увидеть обработку ответа на http-вызов к бекенду и вывод ошибки.
Кроме того в примере показано, как передавать данные заказа в http-вызове и обрабатывать на стороне бекенда.

_Данный пример полноценно работает при регистрации в виде интеграционного модуля_.

### 3. Адрес на карте `cases/yandexMap`

Пример представляет собой модальное окно с интерактивной картой от Яндекса. Маркер можно перетаскивать и тем самым изменять адрес.
Используется JavaScript API Яндекс Карт и Геокодер версии 3.0. При первоначальной отрисовке позиционирование маркера происходит
исходя из адреса в поле "Адрес" заказа. Далее при перетаскивании маркера адрес выбирается исходя из текущих координат маркера, выбирается
ближайший адрес к текущим координатам.

В данном примере можно понять, как выводить модальные окна с дополнительной информацией и применять к полю в форме данные, выбранные в модальном окне.

### 4. Кнопка рядом с полем Телефон в заказе `cases/phoneReactive`

Пример выводит кнопку рядом с полем телефона в заказе.

В примере видно, как надпись на кнопке реактивно меняется в зависимости от введенного номера телефона.
По клику на кнопку в поле Телефон подставляется некоторое значение и система подсвечивает измененное поле.

### 5. Добавление элементов во всех target-ы страницы заказа `cases/allTargetsButton`

Данный модуль выводить кнопки и ссылки во всех доступных target-ах страницы заказа.

Пример помогает увидеть все доступные места встраивания страницы заказа. Реакция на клик для кнопок и ссылок не предусмотрена.

### 6. Запись клиента на встречу через Calendly `cases/recordToCalendly`

Модуль выводить кнопку «Записать на встречу» в блоке Клиент карточки заказа.
По клику на кнопку открывается модальное окно с виджетом Calendly, встроенном через iframe, в котором можно выбрать время и дату встречи.
На последнем шаге виджета в поле Name и Email подставляются данные блока Клиент.

Пример помогает понять, как встраивать сторонние виджеты в модуль и передавать данные из карточки заказа в сторонний виджет.

### 7. Заметки к заказу `cases/orderNotes`

Модуль выводить кнопку «Заметки к заказу» в блоке Основное карточки заказа.
По клику на кнопку открывается боковая панель с ранее внесенными заметками к заказу и формой отправки новой заметки.
При отправке заметки фиксируется id заказа, к которому привязана новая заметка, а также фамилия и имя пользователя, который ее оставил.

Пример демонстрирует использование и передачу данных заказа и пользователя на бекенд модуля, а также обработку формы.

> [!IMPORTANT]
> Данный пример полноценно работает при регистрации в виде интеграционного модуля.

### 8. Акции к заказу `cases/orderPromo`

Модуль выводит кнопку «Акции» сразу под списком товарных позиций.
Подгружает с backend список акций и выводит в кнопке их количество в скобках.
На время загрузки списка отображает в кнопке индикатор загрузки.
По клику на кнопку открывается боковая панель, отображающая список акций с возможностью
выбора одной из них, нажав на кнопку «Применить», далее, в зависимости от выбранной акции, происходит одно из:

* подгружается список торговых предложений, и одно случайное, которого еще нет в заказе, добавляется в список с ценой 1 рубль.
* всем товарным позициям присваивается скидка в 5%;
* на каждые две единицы товарной позиции добавляется третья.

Далее боковая панель закрывается, рядом с кнопкой (слева) выводится примененная акция.

Пример демонстрирует работу с товарными позициями: чтение списка, модификация данных с помощью объекта действий.

> [!IMPORTANT]
> Данный пример полноценно работает при регистрации в виде интеграционного модуля. Вам также нужно создать
> в корне репозитория файл `.env` по примеру файла `.env.dist` и указать там адрес CRM и API ключ, чтобы
> backend модуля мог делать запросы к API v5 CRM

### 9. Поиск реквизитов по ИНН `cases/customerINN`

Модуль отслеживает изменения в поле company.INN и опрашивает backend на предмет наличия информации о компании по INN. Если информация найдена, то появляется кнопка "Дополнить из компании <Компания>", по клику на которую все поля реквизитов заполняются найденной информацией, и кнопка скрывается.

_Пример демонстрационный, информация находится, если ввести ИНН "1234567890"_.

_Данный пример полноценно работает при регистрации в виде интеграционного модуля_.

### 10. Просмотр пользовательских полей `cases/customFieldViewer`

Модуль получает данные по пользовательским полям заказа, позволяет выбрать поле с помощью группы
радио-кнопок и просмотреть его значение. Также можно изменить значение поля, если он редактируемое.

## Tooling и IDE

В проект добавлен `@omnicajs/vue-remote/tooling`, подключенный через `vueCompilerOptions.plugins` в `tsconfig.json`.
Он нужен для корректной типизации remote-SFC в шаблонах Vue:

* native `ref` внутри remote-компонентов типизируются как remote proxy, а не как `HTMLElement`;
* `useTemplateRef(...)`, `ref(null)` и `shallowRef(null)` корректно работают на стороне remote-runtime;
* для remote-SFC используйте marker `<script lang="ts" remote setup>`.

### WebStorm / PhpStorm

Рекомендуемые настройки:

* `Settings | Languages & Frameworks | TypeScript`
* в поле `TypeScript` выберите версию из проекта: `node_modules/typescript`
* включите `TypeScript Language Service`
* включите `Enable service-powered type engine`

Для Vue:

* `Settings | Languages & Frameworks | TypeScript | Vue`
* выберите `Vue Language Server (Volar)`
* укажите project package: `node_modules/@vue/language-server`
* включите `Vue Language Server 3.x Preview`
* если после этого типы в шаблонах не обновились, перезапустите `Vue` и `TypeScript` services или IDE

Что означает `Vue Language Server 3.x Preview`:

* в актуальных версиях PhpStorm / WebStorm этот флажок включает новый Vue TypeScript tooling для language server;
* без него IDE может корректно запускать `@vue/language-server`, но не использовать server-side типы для шаблонов;
* симптом такого состояния: `useTemplateRef(...)` в remote-SFC подсвечивается как `Readonly<Ref<unknown, unknown> ...>`, хотя `yarn typecheck` проходит.

Как проверить, что используется именно локальный language server из проекта:

* в `.idea/workspace.xml` должен быть сохранен путь `packageName="$PROJECT_DIR$/node_modules/@vue/language-server"`;
* если этот путь выбран, PhpStorm / WebStorm запускает project-local `@vue/language-server`, а не bundled пакет IDE.

### VS Code

Рекомендуемые настройки:

* установите расширение `Vue - Official`
* если установлен `Vetur`, отключите его для этого workspace
* в командной палитре выполните `TypeScript: Select TypeScript Version`
* выберите `Use Workspace Version`

При проблемах с подсветкой или типами:

* выполните `Developer: Reload Window`
* затем `Vue: Restart Vue Server`
* при необходимости перезапустите `TypeScript: Restart TS Server`

### Что проверять, если типы не подхватились

* в `package.json` должны быть установлены совместимые версии `vue-tsc` и `@vue/language-server`
* в `tsconfig.json` должен быть подключен `@omnicajs/vue-remote/tooling`
* remote-компонент должен быть помечен как `<script lang="ts" remote setup>`
* в PhpStorm / WebStorm должен быть включен `Vue Language Server 3.x Preview`

## Запуск

### Начальное развертывание

Установка зависимостей
```bash
yarn install
```

Сборка приложения
```bash
yarn build
```

Для инициализации приложения внутри CRM необходимо выполнить его сборку (```yarn build```), а затем предоставить html страницу с подключенными скриптами сборки в качестве значения ```entrypoint```, а так же файл стилей в качестве значения ```stylesheet``` объекта конфигурации.

В данном примере есть [файл сервера](https://github.com/retailcrm/core-ui-extensions-examples/blob/master/server.mjs), который отдает необходимые ресурсы и endpoint-ы для обработки HTTP-вызовов. 
После сборки приложения достаточно его запустить с помощью команды ```node server.mjs```.

После этого, на странице заказа в CRM достаточно вызвать в консоли браузера, чтобы инициализировать
один из модулей выше (порядок сохранен):

```javascript
// customerPhone
window['CRM'].embed.register({
  "uuid": "a796ad7e-55e8-4653-b328-51a953c4cb18",
  "targets": [
    "customer/card:phone",
    "order/card:customer.phone"
  ],
  "entrypoint": "http://localhost:3000/extension/a796ad7e-55e8-4653-b328-51a953c4cb18",
  "stylesheet": "http://localhost:3000/extension/a796ad7e-55e8-4653-b328-51a953c4cb18/stylesheet"
})

// fiscalReceipts
window['CRM'].embed.register({
  "uuid": "db275ab4-9f7e-405d-89a1-f6d56625db7a",
  "targets": [
    "order/card:payment.before",
  ],
  "entrypoint": "http://localhost:3000/extension/db275ab4-9f7e-405d-89a1-f6d56625db7a",
  "stylesheet": "http://localhost:3000/extension/db275ab4-9f7e-405d-89a1-f6d56625db7a/stylesheet"
})

// yandexMap
window['CRM'].embed.register({
    "uuid": "62aa8145-ed53-4862-b28f-f1bc6b36a3a3",
    "targets": [
        "order/card:delivery.address"
    ],
    "entrypoint": "http://localhost:3000/extension/62aa8145-ed53-4862-b28f-f1bc6b36a3a3",
    "stylesheet": "http://localhost:3000/extension/62aa8145-ed53-4862-b28f-f1bc6b36a3a3/stylesheet"
})

// phoneReactive
window['CRM'].embed.register({
    "uuid": "930ab49c-f6a2-4407-b64b-54ffe4c785a2",
    "targets": [
        "order/card:customer.phone"
    ],
    "entrypoint": "http://localhost:3000/extension/930ab49c-f6a2-4407-b64b-54ffe4c785a2"
})

// allTargetsButton
window['CRM'].embed.register({
    "uuid": "30ff05b5-4473-4b41-a910-1428cc13394e",
    "targets": [
        "order/card:common.before",
        "order/card:common.after",
        "order/card:customer.before",
        "order/card:customer.after",
        "order/card:customer.email",
        "order/card:customer.phone",
        "order/card:list.before",
        "order/card:list.after",
        "order/card:store.before",
        "order/card:dimensions.before",
        "order/card:dimensions.before",
        "order/card:delivery.before",
        "order/card:delivery.after",
        "order/card:delivery.address",
        "order/card:payment.before",
        "order/card:comment.manager.before"
    ],
    "entrypoint": "http://localhost:3000/extension/30ff05b5-4473-4b41-a910-1428cc13394e"
})

// recordToCalendly
window['CRM'].embed.register({
    "uuid": "d3301ba9-cca9-46c2-b097-b404419b64ce",
    "targets": [
        "order/card:customer.after"
    ],
    "entrypoint": "http://localhost:3000/extension/d3301ba9-cca9-46c2-b097-b404419b64ce"
})

// orderNotes
window['CRM'].embed.register({
    "uuid": "2f34c0a1-7004-4c57-831b-7269ac2b257c",
    "targets": [
        "order/card:common.before"
    ],
    "entrypoint": "https://localhost:3000/extension/2f34c0a1-7004-4c57-831b-7269ac2b257c",
    "stylesheet": "https://localhost:3000/extension/2f34c0a1-7004-4c57-831b-7269ac2b257c/stylesheet"
})

// orderPromo
window['CRM'].embed.register({
    "uuid": "43b2d18a-80a8-488f-b337-493bef474b92",
    "targets": [
        "order/card:list.after"
    ],
    "entrypoint": "localhost:3000/extension/43b2d18a-80a8-488f-b337-493bef474b92",
    "stylesheet": "localhost:3000/extension/43b2d18a-80a8-488f-b337-493bef474b92/stylesheet"
})

// customerINN
window['CRM'].embed.register({
    "uuid": "c212cb60-5650-433a-82db-09f0f604056a",
    "targets": [
        "order/card:customer.after"
    ],
    "entrypoint": "https://localhost:3000/extension/c212cb60-5650-433a-82db-09f0f604056a"
})

// customFieldViewer
window['CRM'].embed.register({
  "uuid": "dca0afa1-f765-442a-8958-01230d87098f",
  "targets": [
    "order/card:common.after"
  ],
  "entrypoint": "https://localhost:3000/extension/dca0afa1-f765-442a-8958-01230d87098f",
  "stylesheet": "https://localhost:3000/extension/dca0afa1-f765-442a-8958-01230d87098f/stylesheet"
})
```

## Регистрация как интеграционного модуля в аккаунте RetailCRM

Собрав модуль, вы можете инициализировать его не через консоль браузера, а как интеграционный модуль в аккаунте RetailCRM.

Для этого вам необходимо внести информацию о модуле в файл `cases.json`:
* `uuid` — уникальный идентификатор модуля (произвольный)
* `name` — символьный код модуля (должен соответствовать названию папки сборки модуля в `dist/`)
* `targets` — точки встраивания
* `entrypoint` — относительный путь к js-файлу, как указано в ключе `dist/manifest.json`
* `stylesheet` — относительный путь к css-файлу, как указано в ключе `dist/manifest.json`, если у модуля есть стили

После чего выполнить:
```bash
make register
```

При вызове команды `make register` требуется интерактивно указать:
* адрес аккаунта RetailCRM, например `https://demo.retailcrm.ru`
* API-ключ для работы с REST API аккаунта
* название модуля (как указано в `cases.json`), например `yandexMap`
* базовый адрес модуля, например `https://my-module.tech` — это может быть адрес прокси (аля ngrok), который проксирует запросы на ваш локальный сервер

## Сборка архива

Перед сборкой архива выполните сборку модуля с помощью `make build` или `yarn build`.

После этого выполните:
```bash
make zip-archive
```

При вызове команды `make zip-archive` требуется интерактивно указать:
* название папки со сборкой модуля из `dist/`
* версию модуля
* список target-ов, в которые будет встраиваться модуль, через запятую

На снове введенных данных будет сгенерирован `manifest.json` и создан архив с модулем в папке `dist/`.
