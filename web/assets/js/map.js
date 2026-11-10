/* Тонкая обёртка над Яндекс.Картами JS API (v2.1): карта одной точки и карта маршрута с линией.
   Требует подключённый <script src="https://api-maps.yandex.ru/2.1/?apikey=...&lang=ru_RU"></script>
   (скрипт подставляется динамически через document.write в *.html — см. YANDEX_MAPS_API_KEY в assets/js/config.js)
   и готовый к работе window.ymaps. Координаты Яндекс.Карт — [широта, долгота] (в отличие от 2GIS, где было [долгота, широта]). */

(function () {
  "use strict";

  var SPB_CENTER = [59.9343, 30.3351]; // [lat, lon]

  function markerHtml(num, variant) {
    var bg = variant === "unresolved" ? "#b9b2a5" : "#5c1a24";
    var border = variant === "unresolved" ? "#b9b2a5" : "#c9a227";
    var textColor = variant === "unresolved" ? "#716c63" : "#e8d18f";
    return (
      '<div style="' +
      "width:30px;height:30px;border-radius:50%;background:" + bg + ";" +
      "border:2px solid " + border + ";display:flex;align-items:center;justify-content:center;" +
      "font-family:'Playfair Display',Georgia,serif;font-weight:700;font-size:13px;color:" + textColor + ";" +
      'box-shadow:0 2px 5px rgba(0,0,0,0.35);">' + num + "</div>"
    );
  }

  function showMapUnavailable(containerId, reason) {
    var el = document.getElementById(containerId);
    if (!el) return;
    el.style.display = "flex";
    el.style.alignItems = "center";
    el.style.justifyContent = "center";
    el.style.textAlign = "center";
    el.style.padding = "16px";
    el.style.color = "var(--gray)";
    el.innerHTML = "🗺️ Карта недоступна.<br>" + reason;
  }

  function keyConfigured() {
    return !!(window.YANDEX_MAPS_API_KEY && window.YANDEX_MAPS_API_KEY.indexOf("ВСТАВЬТЕ") !== 0);
  }

  function apiReady() {
    return typeof window.ymaps !== "undefined";
  }

  /* Кастомная HTML-метка (та же вёрстка, что была у 2GIS HtmlMarker):
     прозрачная иконка-основа + слой с произвольным HTML поверх неё. */
  function placemark(coordinates, num, variant) {
    return new ymaps.Placemark(coordinates, {}, {
      iconLayout: "default#imageWithContent",
      iconImageHref: "",
      iconImageSize: [0, 0],
      iconImageOffset: [0, 0],
      iconContentLayout: ymaps.templateLayoutFactory.createClass(markerHtml(num, variant)),
      iconContentOffset: [-15, -15],
    });
  }

  /* handle — то, что возвращают init*Map(): у builder.js есть `.destroy()` на результате
     initRouteMap (пересборка карты при выборе мест), а создание самой ymaps.Map идёт
     асинхронно внутри ymaps.ready(), поэтому destroy() должен сработать и до того,
     как карта успела появиться. */
  function makeHandle() {
    return {
      _map: null,
      _destroyed: false,
      destroy: function () {
        this._destroyed = true;
        if (this._map) {
          this._map.destroy();
          this._map = null;
        }
      },
    };
  }

  function initSinglePointMap(containerId, lat, lon, label) {
    var el = document.getElementById(containerId);
    if (!el) return null;

    if (!apiReady()) {
      showMapUnavailable(containerId, "Не загрузился скрипт Яндекс.Карт (нет интернета, устарел/не указан ключ или заблокирован домен api-maps.yandex.ru).");
      return null;
    }
    if (!keyConfigured()) {
      showMapUnavailable(containerId, "Не указан ключ YANDEX_MAPS_API_KEY — впишите его в assets/js/config.js.");
      return null;
    }

    var handle = makeHandle();
    ymaps.ready(function () {
      if (handle._destroyed) return;
      var map = new ymaps.Map(containerId, {
        center: [lat, lon],
        zoom: 16,
        controls: ["zoomControl"],
      });
      map.geoObjects.add(placemark([lat, lon], "•"));
      handle._map = map;
    });

    return handle;
  }

  /**
   * points: [{ lat, lon, label }] — точки без lat/lon пропускаются на карте,
   * но нумерация маркеров сохраняется по исходному порядку списка.
   */
  function initRouteMap(containerId, points) {
    var el = document.getElementById(containerId);
    if (!el) return null;

    if (!apiReady()) {
      showMapUnavailable(containerId, "Не загрузился скрипт Яндекс.Карт (нет интернета, устарел/не указан ключ или заблокирован домен api-maps.yandex.ru).");
      return null;
    }
    if (!keyConfigured()) {
      showMapUnavailable(containerId, "Не указан ключ YANDEX_MAPS_API_KEY — впишите его в assets/js/config.js.");
      return null;
    }

    var valid = [];
    points.forEach(function (pt, idx) {
      if (pt.lat === null || pt.lat === undefined || pt.lon === null || pt.lon === undefined) return;
      valid.push({ coord: [pt.lat, pt.lon], num: idx + 1, label: pt.label });
    });

    var handle = makeHandle();
    ymaps.ready(function () {
      if (handle._destroyed) return;

      var startCenter = valid.length ? valid[0].coord : SPB_CENTER;
      var map = new ymaps.Map(containerId, {
        center: startCenter,
        zoom: 13,
        controls: ["zoomControl"],
      });

      valid.forEach(function (v) {
        map.geoObjects.add(placemark(v.coord, v.num));
      });

      if (valid.length >= 2) {
        var line = new ymaps.Polyline(
          valid.map(function (v) { return v.coord; }),
          {},
          { strokeColor: "#5c1a24", strokeWidth: 3 }
        );
        map.geoObjects.add(line);

        var lats = valid.map(function (v) { return v.coord[0]; });
        var lons = valid.map(function (v) { return v.coord[1]; });
        map.setBounds(
          [
            [Math.min.apply(null, lats), Math.min.apply(null, lons)],
            [Math.max.apply(null, lats), Math.max.apply(null, lons)],
          ],
          { checkZoomRange: true, zoomMargin: 40 }
        );
      } else if (valid.length === 1) {
        map.setCenter(valid[0].coord);
        map.setZoom(15);
      }

      handle._map = map;
    });

    return handle;
  }

  window.DostMap = {
    initSinglePointMap: initSinglePointMap,
    initRouteMap: initRouteMap,
  };
})();

/* ==================== СТАРАЯ РЕАЛИЗАЦИЯ: 2GIS MapGL JS API ====================
   Ключ MAPGL_API_KEY истёк (2026-11). Оставлено на случай возврата к 2GIS —
   чтобы восстановить: раскомментировать блок ниже, закомментировать блок выше,
   вернуть <script src="https://mapgl.2gis.com/api/js/v1"> в *.html (см. там же
   закомментированную старую версию) и вписать свежий ключ в config.js.

(function () {
  "use strict";

  var SPB_CENTER = [30.3351, 59.9343]; // [lon, lat]

  function markerHtml(num, variant) {
    var bg = variant === "unresolved" ? "#b9b2a5" : "#5c1a24";
    var border = variant === "unresolved" ? "#b9b2a5" : "#c9a227";
    var textColor = variant === "unresolved" ? "#716c63" : "#e8d18f";
    return (
      '<div style="' +
      "width:30px;height:30px;border-radius:50%;background:" + bg + ";" +
      "border:2px solid " + border + ";display:flex;align-items:center;justify-content:center;" +
      "font-family:'Playfair Display',Georgia,serif;font-weight:700;font-size:13px;color:" + textColor + ";" +
      'box-shadow:0 2px 5px rgba(0,0,0,0.35);">' + num + "</div>"
    );
  }

  function showMapUnavailable(containerId, reason) {
    var el = document.getElementById(containerId);
    if (!el) return;
    el.style.display = "flex";
    el.style.alignItems = "center";
    el.style.justifyContent = "center";
    el.style.textAlign = "center";
    el.style.padding = "16px";
    el.style.color = "var(--gray)";
    el.innerHTML = "🗺️ Карта недоступна.<br>" + reason;
  }

  function keyConfigured() {
    return !!(window.MAPGL_API_KEY && window.MAPGL_API_KEY.indexOf("ВСТАВЬТЕ") !== 0);
  }

  function apiReady() {
    return typeof window.mapgl !== "undefined";
  }

  function initSinglePointMap(containerId, lat, lon, label) {
    var el = document.getElementById(containerId);
    if (!el) return null;

    if (!apiReady()) {
      showMapUnavailable(containerId, "Не загрузился скрипт 2GIS MapGL (нет интернета или заблокирован домен mapgl.2gis.com).");
      return null;
    }
    if (!keyConfigured()) {
      showMapUnavailable(containerId, "Не указан ключ MAPGL_API_KEY — впишите его в assets/js/config.js.");
      return null;
    }

    var map = new mapgl.Map(containerId, {
      center: [lon, lat],
      zoom: 16,
      key: window.MAPGL_API_KEY,
    });

    new mapgl.HtmlMarker(map, {
      coordinates: [lon, lat],
      html: markerHtml("•"),
      anchor: [15, 15],
    });

    return map;
  }

  function initRouteMap(containerId, points) {
    var el = document.getElementById(containerId);
    if (!el) return null;

    if (!apiReady()) {
      showMapUnavailable(containerId, "Не загрузился скрипт 2GIS MapGL (нет интернета или заблокирован домен mapgl.2gis.com).");
      return null;
    }
    if (!keyConfigured()) {
      showMapUnavailable(containerId, "Не указан ключ MAPGL_API_KEY — впишите его в assets/js/config.js.");
      return null;
    }

    var valid = [];
    points.forEach(function (pt, idx) {
      if (pt.lat === null || pt.lat === undefined || pt.lon === null || pt.lon === undefined) return;
      valid.push({ coord: [pt.lon, pt.lat], num: idx + 1, label: pt.label });
    });

    var startCenter = valid.length ? valid[0].coord : SPB_CENTER;
    var map = new mapgl.Map(containerId, {
      center: startCenter,
      zoom: 13,
      key: window.MAPGL_API_KEY,
    });

    valid.forEach(function (v) {
      new mapgl.HtmlMarker(map, {
        coordinates: v.coord,
        html: markerHtml(v.num),
        anchor: [15, 15],
      });
    });

    if (valid.length >= 2) {
      new mapgl.Polyline(map, {
        coordinates: valid.map(function (v) {
          return v.coord;
        }),
        width: 3,
        color: "#5c1a24",
      });

      var lons = valid.map(function (v) { return v.coord[0]; });
      var lats = valid.map(function (v) { return v.coord[1]; });
      map.fitBounds(
        [
          [Math.min.apply(null, lons), Math.min.apply(null, lats)],
          [Math.max.apply(null, lons), Math.max.apply(null, lats)],
        ],
        { padding: { top: 40, bottom: 40, left: 40, right: 40 } }
      );
    } else if (valid.length === 1) {
      map.setCenter(valid[0].coord);
      map.setZoom(15);
    }

    return map;
  }

  window.DostMap = {
    initSinglePointMap: initSinglePointMap,
    initRouteMap: initRouteMap,
  };
})();

==================== /СТАРАЯ РЕАЛИЗАЦИЯ ==================== */
