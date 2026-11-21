var trips = [
  { id: 1, destination: "Lisbon", type: "Holiday", transport: "Flight", hotel: true, cost: 540 },
  { id: 2, destination: "Galway", type: "Work", transport: "Train", hotel: false, cost: 180 }
];

var packingItems = [
  { id: 1, name: "Passport", packed: true },
  { id: 2, name: "Charger", packed: false }
];

function renderTrips(list) {
  var box = document.getElementById("trip-list");
  if (!box) return;
  box.innerHTML = "";

  for (var i = 0; i < list.length; i++) {
    var t = list[i];
    var div = document.createElement("div");
    div.className = "trip-item";
    div.innerHTML = "<p><strong>" + t.destination + "</strong> (" + t.type + ", " + t.transport + ", Hotel: " + (t.hotel ? "Yes" : "No") + ") - &euro;" + t.cost + "</p>";

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn-danger";
    btn.textContent = "Delete";
    (function(id) {
      btn.addEventListener("click", function() {
        trips = trips.filter(function(item) { return item.id !== id; });
        renderTrips(trips);
      });
    })(t.id);

    div.appendChild(btn);
    box.appendChild(div);
  }
}

function getWeather() {
  var input = document.getElementById("city-input");
  var out = document.getElementById("weather-output");
  if (!input || !out || !input.value.trim()) return;

  out.innerHTML = "<p>Loading...</p>";
  var city = encodeURIComponent(input.value.trim());

  fetch("https://geocoding-api.open-meteo.com/v1/search?name=" + city + "&count=1")
    .then(function(r) { return r.json(); })
    .then(function(g) {
      if (!g.results || !g.results[0]) {
        out.innerHTML = "<p>Not found.</p>";
        return null;
      }
      var p = g.results[0];
      return fetch("https://api.open-meteo.com/v1/forecast?latitude=" + p.latitude + "&longitude=" + p.longitude + "&current=temperature_2m")
        .then(function(r) { return r.json(); })
        .then(function(w) {
          out.innerHTML = "<p>" + p.name + ": " + w.current.temperature_2m + "&deg;C</p>";
        });
    })
    .catch(function() {
      out.innerHTML = "<p>Error loading weather.</p>";
    });
}

function renderPacking() {
  var ul = document.getElementById("packing-list");
  if (!ul) return;
  ul.innerHTML = "";

  for (var i = 0; i < packingItems.length; i++) {
    var item = packingItems[i];
    var li = document.createElement("li");
    if (item.packed) li.className = "packed";

    var span = document.createElement("span");
    span.textContent = item.name;
    (function(id) {
      span.addEventListener("click", function() {
        packingItems = packingItems.map(function(x) {
          return x.id === id ? { id: x.id, name: x.name, packed: !x.packed } : x;
        });
        renderPacking();
      });
    })(item.id);

    var del = document.createElement("button");
    del.type = "button";
    del.className = "btn btn-danger";
    del.textContent = "Remove";
    (function(id) {
      del.addEventListener("click", function() {
        packingItems = packingItems.filter(function(x) { return x.id !== id; });
        renderPacking();
      });
    })(item.id);

    li.appendChild(span);
    li.appendChild(del);
    ul.appendChild(li);
  }
}

document.addEventListener("DOMContentLoaded", function() {
  var wBtn = document.getElementById("fetch-weather-btn");
  if (wBtn) {
    getWeather();
    wBtn.addEventListener("click", getWeather);
  }

  if (document.getElementById("trip-list")) {
    renderTrips(trips);

    var search = document.getElementById("search-trips");
    if (search) {
      search.addEventListener("input", function() {
        var q = search.value.trim().toLowerCase();
        var filtered = trips.filter(function(t) {
          return t.destination.toLowerCase().indexOf(q) !== -1;
        });
        renderTrips(filtered);
      });
    }

    var clearBtn = document.getElementById("clear-search-btn");
    if (clearBtn && search) {
      clearBtn.addEventListener("click", function() {
        search.value = "";
        renderTrips(trips);
      });
    }

    if (window.jQuery && $.fn.validate && $("#simpleTripForm").length) {
      $("#simpleTripForm").validate({
        rules: {
          cityName: { required: true },
          tripType: { required: true },
          transport: { required: true },
          cost: { required: true, number: true }
        },
        submitHandler: function(form) {
          trips.push({
            id: Date.now(),
            destination: document.getElementById("cityName").value.trim(),
            type: document.getElementById("tripType").value,
            transport: document.querySelector('input[name="transport"]:checked').value,
            hotel: document.getElementById("needHotel").checked,
            cost: Number(document.getElementById("cost").value)
          });
          renderTrips(trips);
          form.reset();
        }
      });
    }
  }

  if (document.getElementById("packing-list")) {
    renderPacking();
    var addBtn = document.getElementById("add-packing-btn");
    var pInput = document.getElementById("packing-input");
    if (addBtn && pInput) {
      addBtn.addEventListener("click", function() {
        if (!pInput.value.trim()) return;
        packingItems.push({ id: Date.now(), name: pInput.value.trim(), packed: false });
        pInput.value = "";
        renderPacking();
      });
    }
  }
});
