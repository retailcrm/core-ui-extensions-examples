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

В данном примере есть [файл сервера](https://github.com/retailcrm/core-ui-extensions-examples/blob/master/server.mjs), который отдает необходимые ресурсы и после сборки приложения достаточно его запустить с помощью команды ```node server.mjs```.

После этого, на странице заказа в CRM достаточно вызвать в консоли браузера, чтобы инициализировать
один из модулей выше (порядок сохранен):

```javascript
window['CRM'].embed.register({
  "uuid": "a796ad7e-55e8-4653-b328-51a953c4cb18",
  "targets": [
    "customer/card:phone",
    "order/card:customer.phone"
  ],
  "entrypoint": "http://localhost:3000/extension/a796ad7e-55e8-4653-b328-51a953c4cb18",
  "stylesheet": "http://localhost:3000/extension/a796ad7e-55e8-4653-b328-51a953c4cb18/stylesheet"
})

window['CRM'].embed.register({
  "uuid": "db275ab4-9f7e-405d-89a1-f6d56625db7a",
  "targets": [
    "order/card:payment.before",
  ],
  "entrypoint": "http://localhost:3000/extension/db275ab4-9f7e-405d-89a1-f6d56625db7a",
  "stylesheet": "http://localhost:3000/extension/db275ab4-9f7e-405d-89a1-f6d56625db7a/stylesheet"
})

window['CRM'].embed.register({
    "uuid": "62aa8145-ed53-4862-b28f-f1bc6b36a3a3",
    "targets": [
        "order/card:delivery.address"
    ],
    "entrypoint": "http://localhost:3000/extension/62aa8145-ed53-4862-b28f-f1bc6b36a3a3",
    "stylesheet": "http://localhost:3000/extension/62aa8145-ed53-4862-b28f-f1bc6b36a3a3/stylesheet"
})

window['CRM'].embed.register({
    "uuid": "930ab49c-f6a2-4407-b64b-54ffe4c785a2",
    "targets": [
        "order/card:customer.phone"
    ],
    "entrypoint": "http://localhost:3000/extension/930ab49c-f6a2-4407-b64b-54ffe4c785a2"
})

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
        "order/card:payment.before"
    ],
    "entrypoint": "http://localhost:3000/extension/30ff05b5-4473-4b41-a910-1428cc13394e"
})

window['CRM'].embed.register({
    "uuid": "d3301ba9-cca9-46c2-b097-b404419b64ce",
    "targets": [
        "order/card:customer.after"
    ],
    "entrypoint": "http://localhost:3000/extension/d3301ba9-cca9-46c2-b097-b404419b64ce"
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
