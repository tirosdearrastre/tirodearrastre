// ======= CONFIGURA AQUÍ TU NÚMERO DE WHATSAPP =======
// Formato: código de país + número, sin espacios ni signos. Ej: Colombia = 57 + número
const WSP_NUMBER = "573000000000"; // <-- REEMPLAZA por tu número real

document.getElementById("year").textContent = new Date().getFullYear();

function wspLink(message) {
  return `https://wa.me/${WSP_NUMBER}?text=${encodeURIComponent(message)}`;
}

// Enlaces generales de WhatsApp (nav, flotante, contacto)
const generalMsg = "Hola, quiero información sobre tiros de arrastre y portabicicletas.";
["wspNavBtn", "wspFloat", "wspContactBtn"].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.href = wspLink(generalMsg);
});

// Menú móvil
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
menuToggle.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", isOpen);
});
mainNav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
  mainNav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
}));

// Formato de precio en pesos colombianos
const priceFmt = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

let allProducts = [];
let activeCategory = "todos";
let activeBrand = "todas";

function renderBrandFilters() {
  const brands = ["todas", ...new Set(allProducts.map(p => p.marca))];
  const container = document.getElementById("brandFilters");
  container.innerHTML = brands.map(b =>
    `<button class="filter-btn${b === activeBrand ? " active" : ""}" data-brand="${b}">${b === "todas" ? "Todas las marcas" : b}</button>`
  ).join("");
  container.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      activeBrand = btn.dataset.brand;
      renderBrandFilters();
      renderProducts();
    });
  });
}

function renderProducts() {
  const grid = document.getElementById("productGrid");
  const filtered = allProducts.filter(p =>
    (activeCategory === "todos" || p.categoria === activeCategory) &&
    (activeBrand === "todas" || p.marca === activeBrand)
  );

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="empty-state">No hay productos con este filtro todavía. Escríbenos y te confirmamos disponibilidad.</div>`;
    return;
  }

  grid.innerHTML = filtered.map(p => {
    const msg = `Hola, estoy interesado en: ${p.nombre} (${p.marca}). ¿Me confirmas disponibilidad y compatibilidad con mi vehículo?`;
    return `
    <article class="card" itemscope itemtype="https://schema.org/Product">
      <div class="card-photo">
        <span class="badge-brand">${p.marca}</span>
        <img src="${p.imagen}" alt="${p.nombre} - ${p.marca}" loading="lazy" itemprop="image">
      </div>
      <div class="card-body">
        <h3 itemprop="name">${p.nombre}</h3>
        <p class="card-note">${p.nota}${p.capacidad ? " · " + p.capacidad : ""}</p>
        <div class="card-footer">
          <span class="price" itemprop="offers" itemscope itemtype="https://schema.org/Offer">
            <span itemprop="price" content="${p.precio}">${priceFmt.format(p.precio)}</span>
            <meta itemprop="priceCurrency" content="COP">
          </span>
          <a class="btn-card" href="${wspLink(msg)}" target="_blank" rel="noopener">Cotizar</a>
        </div>
      </div>
    </article>`;
  }).join("");
}

document.querySelectorAll("#categoryFilters .filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#categoryFilters .filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeCategory = btn.dataset.filter;
    renderProducts();
  });
});

fetch("products.json")
  .then(res => res.json())
  .then(data => {
    allProducts = data;
    renderBrandFilters();
    renderProducts();
  })
  .catch(() => {
    document.getElementById("productGrid").innerHTML =
      `<div class="empty-state">No se pudo cargar el catálogo. Verifica que products.json esté en la misma carpeta.</div>`;
  });
