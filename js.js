const cart = document.getElementById("idcart");
const btnSpaceships = document.getElementById("btn1");
const btnCharacters = document.getElementById("btn2");
const searchInput = document.querySelector(".input");
const searchButton = document.querySelector(".btnheder");
const cartTitle = document.querySelector("#idcart p");
const cartInfo = document.querySelector("#idcart span");
const datalist = document.getElementById("suggestions");
const filterSelect = document.getElementById("filter-select");
const randomContainer = document.getElementById("random-container");

let category = "starships";

function updateFilterOptions() {
  filterSelect.innerHTML = "";
  if (category === "starships") {
    filterSelect.innerHTML = `
      <option value="all">Усі кораблі</option>
      <option value="starfighter">Винищувачі (Starfighter)</option>
      <option value="capital">Крейсери (Capital ship)</option>
    `;
  } else {
    filterSelect.innerHTML = `
      <option value="all">Усі гендери</option>
      <option value="male">Чоловіки (male)</option>
      <option value="female">Жінки (female)</option>
      <option value="n/a">Роботи / Інше (n/a)</option>
    `;
  }
}

function loadSuggestionsAndRandoms() {
  fetch("https://swapi.info/api/" + category)
    .then((res) => res.json())
    .then((data) => {
      datalist.innerHTML = "";
      const activeFilter = filterSelect.value;
      let filteredData = data;

      if (activeFilter !== "all") {
        if (category === "starships") {
          filteredData = data.filter(item => item.starship_class && item.starship_class.toLowerCase().includes(activeFilter));
        } else {
          filteredData = data.filter(item => item.gender && item.gender.toLowerCase() === activeFilter);
        }
      }

      filteredData.forEach((item) => {
        let option = document.createElement("option");
        option.value = item.name;
        datalist.appendChild(option);
      });

      randomContainer.innerHTML = "";
      let shuffled = [...filteredData].sort(() => 0.5 - Math.random());
      let randomItems = shuffled.slice(0, 1000);

      randomItems.forEach(item => {
        let miniCard = document.createElement("div");
        miniCard.innerHTML = `<b>${item.name}</b><span>Клікніть для деталей</span>`;
        
        miniCard.onclick = () => {
          searchInput.value = item.name;
          searchButton.click();
        };
        
        randomContainer.appendChild(miniCard);
      });
    })
    .catch((err) => console.error(err));
}

loadSuggestionsAndRandoms();

filterSelect.onchange = () => {
  loadSuggestionsAndRandoms();
};

btnSpaceships.onclick = () => {
  btnSpaceships.classList.add("activ");
  btnCharacters.classList.remove("activ");
  category = "starships";
  searchInput.placeholder = "Наприклад: X-wing";
  searchInput.value = "";
  updateFilterOptions();
  loadSuggestionsAndRandoms();
};

btnCharacters.onclick = () => {
  btnCharacters.classList.add("activ");
  btnSpaceships.classList.remove("activ");
  category = "people";
  searchInput.placeholder = "Наприклад: Luke Skywalker";
  searchInput.value = "";
  updateFilterOptions();
  loadSuggestionsAndRandoms();
};

searchButton.onclick = () => {
  let text = searchInput.value.trim().toLowerCase();

  if (text === "") {
    alert("Будь ласка, введіть текст англійською!");
    return;
  }

  cart.style.display = "block";
  cartTitle.innerText = "Шукаємо у Галактиці...";
  cartInfo.innerText = "Завантаження...";

  fetch("https://swapi.info/api/" + category)
    .then((response) => response.json())
    .then((data) => {
      const activeFilter = filterSelect.value;
      let filteredData = data;

      if (activeFilter !== "all") {
        if (category === "starships") {
          filteredData = data.filter(item => item.starship_class && item.starship_class.toLowerCase().includes(activeFilter));
        } else {
          filteredData = data.filter(item => item.gender && item.gender.toLowerCase() === activeFilter);
        }
      }

      let foundItem = filteredData.find((item) =>
        item.name.toLowerCase().includes(text)
      );

      if (foundItem) {
        cartTitle.innerText = foundItem.name;

        Promise.all(
          foundItem.films.map((url) => fetch(url).then((res) => res.json()))
        ).then((filmsData) => {
          let filmTitles = filmsData.map((film) => film.title).join(", ");

          if (category === "starships") {
            cartInfo.innerHTML =
              "Модель: " + foundItem.model + "<br>" +
              "Виробник: " + foundItem.manufacturer + "<br>" +
              "Клас: " + foundItem.starship_class + "<br>" +
              "Довжина: " + foundItem.length + " м" + "<br>" +
              "Швидкість: " + foundItem.max_atmosphering_speed + "<br>" +
              "Екіпаж: " + foundItem.crew + "<br>" +
              "Пасажири: " + foundItem.passengers + "<br>" +
              "Гіпердвигун: " + foundItem.hyperdrive_rating + "<br>" +
              "Фільми: " + filmTitles;
          } else {
            cartInfo.innerHTML =
              "Зріст: " + foundItem.height + " см" + "<br>" +
              "Маса: " + foundItem.mass + " кг" + "<br>" +
              "Колір волосся: " + foundItem.hair_color + "<br>" +
              "Колір шкіри: " + foundItem.skin_color + "<br>" +
              "Колір очей: " + foundItem.eye_color + "<br>" +
              "Рік народження: " + foundItem.birth_year + "<br>" +
              "Гендер: " + foundItem.gender + "<br>" +
              "Фільми: " + filmTitles;
          }
        });
      } else {
        cartTitle.innerText = "Нічого не знайдено 🌌";
        cartInfo.innerText = "Об'єкт відсутній або не відповідає обраному фільтру.";
      }
    })
    .catch((error) => {
      console.error(error);
      cart.style.display = "block";
      cartTitle.innerText = "Помилка зв'язку ☄️";
      cartInfo.innerText = "Спробуйте відключити VPN, якщо він увімкнений.";
    });
};