# Основная идея

Данный репозиторий демонстрирует как встраивать внешние приложения в CRM. 
Основная идея - предоставить функционал для реализации удаленных приложений, используя который разработчики могут написать собственные реализации виджетов (или любое другое приложение) расширяющее функционал ядра не затрагивая и не ломая функционал CRM.
Для этого выбран подход с удаленным рендерингом. Код удаленного приложения выполняется в изолированной среде - iFrame,
что позволяет загружать расширения безопасным и надежным способом, в то время как хост (код, который отображает пользовательский интерфейс) является частью основного приложения.
Связь между удаленным приложением и хостом осуществляется через [postMessage](https://developer.mozilla.org/ru/docs/Web/API/Window/postMessage).

Удаленное приложение содержит ограничения на используемый функционал Vue и JS. 
Ниже описаны компоненты, api ядра и тд., что доступно и недоступно в рамках реализации собственных приложений.
Более подробно об архитектуре и api библиотеки для удаленного рендеринга можно прочитать в документации [@omnicajs/vue-remote](https://github.com/omnicajs/vue-remote/)

## Используемые технологии

* В качестве UI фреймворка используется Vue 3. Компоненты ниже основаны на нем
* [@omnicajs/vue-remote](https://github.com/omnicajs/vue-remote/) используется для рендеринга удаленного приложения и коммуницаии с host приложением
* [@remote-ui/rpc](https://www.npmjs.com/package/@remote-ui/rpc) используется для создания канала коммуникации между host и remote приложениями

## Ядро предоставляет следующие компоненты:

```text
    UiButton,
    UiError,
    UiLink,
    UiLoader,
    UiMenuItem,
    UiMenuItemGroup,
    UiModalSidebar,
    UiModalWindow,
    UiModalWindowSurface,
    UiScrollbar,
    UiTag,
    UiTransition,
    CrmYandexMap
```

Более подробно познакомиться с этими компонентами можно на [витрине](https://design.retailcrm.tech/omnica-vue3/index.html).

Доступны props, слоты (дефолтные и именнованные). Методы компонентов, компонент Transition, scoped slots, refs, директивы (кроме v-if/v-show) и модификаторы на данный момент недоступны.

Доступны события:
```javascript
    InputEvent,
    DragEvent,
    FocusEvent,
    KeyboardEvent,
    PointerEvent,
    WheelEvent,
    MouseEvent,
    TouchEvent
```

Актуальный список событий можно посмотреть [тут](https://github.com/omnicajs/vue-remote/blob/main/src/vue/host/events.ts#L142)

## В ядре доступно встраивание удаленных приложений в следующих местах(scope):
1. Карточка просмотра клиента (физ лицо) `customer-card`
2. Карточка редактирования клиента (физ лицо) `customer-form`
3. Карточка заказа `order-card`

Только для карточки заказа доступно api.

## API Ядра в карточке заказа

```javascript
api.getCustomerEmail 
```
Возвращает значение `string`
Значение поля "Email"

```javascript
api.setCustomerEmail
```
Принимает значение `(): string | null`
Устанавливает переданное значение в поле "Email"

```javascript
api.getCustomerPhone 
```
Возвращает значение `string`
Значение поля "Телефон"

```javascript
api.setCustomerPhone
```
Принимает значение `(): string | null`
Устанавливает переданное значение в поле "Телефон"

```javascript
api.getDeliveryAddress 
```
Возвращает значение `string`
Значение поля "Адрес"

```javascript
api.setDeliveryAddress
```
Принимает значение `(): string | null`
Устанавливает переданное значение в поле "Адрес"

```javascript
api.parseDeliveryAddress
```
Парсит адрес в соответствующем поле

Стили должны быть модульными

## В удаленном приложении нужно описать используемые компоненты
```typescript
const CrmYandexMap = defineRemoteComponent('CrmYandexMap', [
    'change',
] as unknown as { 'change': (address: string) => void })

export { UiButton, UiModalWindow, CrmYandexMap }
```
Более подробно можно посмотреть в документации [@omnicajs/vue-remote](https://github.com/omnicajs/vue-remote/)

## Инициализация расширения
В CRM доступна функция `extensionsInit`, которую можно вызвать в консоли для инициализации расширения.
В качестве параметра функция принимает массив объектов вида:

```javascript
[{
    entrypoint: 'extension-url',
    placement: 'delivery-address',
    scope: 'order-card',
    stylesheet: 'stylesheet-url',
    uuid: '1'
}]
```

`extension-url` - адрес страницы с подключаемыми скриптами сборки расширения.
`stylesheet-url` - файл стилей расширения.

В текущем расширении сервер, возвращающий перечисленные ресурсы, описан в файле [server.mjs](https://github.com/retailcrm/core-ui-extensions-examples/blob/master/server.mjs).

# Пример удаленного приложения на основе @omnicajs/vue-remote

## Описание примера

Пример представляет собой модальное окно с интерактивной картой от Яндекса. Маркер можно перетаскивать и тем самым изменять адрес.
Используется JavaScript API Яндекс Карт и Геокодер версии 3.0. При первоначальной отрисовке позиционирование маркера происходит
исходя из адреса в поле "Адрес", далее при перетаскивании маркера адрес выбирается исходя из текущих координат маркера, выбирается
ближайший адрес к текущим координатам. При нажатии кнопки "Выбрать", происходит заполнение или обновление адреса в поле
"Адрес".

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

После этого, на странице заказа в CRM достаточно вызвать в консоли браузера метод ```extensionsInit```:

```javascript
extensionsInit([{
    entrypoint: 'http://localhost:3000/extension/62aa8145-ed53-4862-b28f-f1bc6b36a3a3',
    placement: 'delivery-address',
    scope: 'order-card',
    stylesheet: 'http://localhost:3000/extension/62aa8145-ed53-4862-b28f-f1bc6b36a3a3/stylesheet',
    uuid: '1'
}])
```

В секции "Отгрузка и доставка" под полем "Адрес" должна появиться кнопка "На карте". При клике на кнопку открывается модальное окно с картой.
Для работы карты нужен api ключ.
