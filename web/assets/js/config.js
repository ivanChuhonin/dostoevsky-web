/* Ключ для 2GIS MapGL JS API (интерактивная карта).
   Это ОТДЕЛЬНЫЙ ключ от TGIS_API_KEY в боте (тот — для Static Maps API,
   для JS-карты он может не подойти). Получить/обновить ключ: https://dev.2gis.com/
   (раздел "MapGL JS API" → создать проект → скопировать ключ сюда). */
window.MAPGL_API_KEY = "d90bb0c3-0b04-4d52-bd04-42337d610385";

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
