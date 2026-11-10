/* Ключ для Яндекс.Карт JS API (интерактивная карта на сайте). Именно ключ продукта
   "JavaScript API" — не ключ Геокодера (тот сайту не нужен, адреса не геокодируются
   на лету, координаты уже в site-data.js). Получить/обновить: https://developer.tech.yandex.ru/
   → "JavaScript API" → создать ключ. Секрет/подпись запросов не требуются — для
   клиентского JS API достаточно значения ключа в URL скрипта. */
window.YANDEX_MAPS_API_KEY = "3047c993-f3df-4d4e-9f8d-72f6e7cbecfe";

/* Старый ключ 2GIS MapGL JS API — истёк (2026-11), карта на сайте переведена на Яндекс
   (см. assets/js/map.js). Оставлено на случай возврата к 2GIS: раскомментировать строку
   ниже и вписать свежий ключ с https://dev.2gis.com/ ("MapGL JS API" → создать проект).
window.MAPGL_API_KEY = "d90bb0c3-0b04-4d52-bd04-42337d610385";
*/

/* Форма обратной связи (about.html) — отправка в Google Форму, ответы падают в Google-таблицу.
   Как получить оба значения ниже:
   1. Создайте Google Форму с одним вопросом (тип "Абзац" / длинный текст) — например, "Сообщение".
   2. Откройте форму для заполнения (не редактирования) — кнопка "Отправить" → значок "<>" (вставить на сайт)
      либо просто откройте публичную ссылку формы.
   3. Откройте DevTools (F12) → вкладка Elements/Elements → найдите тег <form ...>,
      его атрибут action и будет FEEDBACK_FORM_ACTION (оканчивается на /formResponse).
   4. В том же DevTools найдите <textarea> или <input> вашего вопроса — у него есть
      атрибут name="entry.XXXXXXXXXX" — это число и есть FEEDBACK_FORM_ENTRY.
   Пока здесь плейсхолдеры — форма на сайте работает как болванка (просто показывает "Отправлено"). */
window.FEEDBACK_FORM_ACTION = "https://docs.google.com/forms/d/e/1FAIpQLSf5ZAOQZ0epdD6R0SOd65Qc3RW4a9NIXxGwb9G4x2BFfVSyWg/formResponse";
window.FEEDBACK_FORM_ENTRY = "entry.223878463";
