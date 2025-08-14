//Header fetch
document.addEventListener("DOMContentLoaded", function () {
  fetch('headerNew.html')
    .then(response => {
      if (!response.ok) throw new Error(`Failed to fetch headerNew.html: ${response.statusText}`);
      return response.text();
    })
    .then(data => {
      document.getElementById('headerNew-placeholder').innerHTML = data;
      updateBadges();
    })
    .catch(error => console.error('Error fetching header:', error.message));
});

//Footer fetch
document.addEventListener("DOMContentLoaded", function () {
  fetch('footer.html')
    .then(response => {
      if (!response.ok) throw new Error(`Failed to fetch footer.html: ${response.statusText}`);
      return response.text();
    })
    .then(data => {
      document.getElementById('footer-placeholder').innerHTML = data;
    })
    .catch(error => console.error('Error fetching footer:', error.message));
});

//update badges in header
function updateBadges() {
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');

  const heartLink = document.querySelector('.nav-link .bi-heart').parentNode;
  let favoriteBadge = heartLink.querySelector('.badge');
  if (!favoriteBadge) {
    favoriteBadge = document.createElement('span');
    favoriteBadge.className = 'badge bg-danger rounded-pill position-absolute';
    favoriteBadge.style = 'top: -5px; right: -5px;';
    heartLink.appendChild(favoriteBadge);
  }
  favoriteBadge.innerText = favorites.length > 0 ? favorites.length : '';

  const cartLink = document.querySelector('.nav-link .bi-cart3').parentNode;
  let cartBadge = cartLink.querySelector('.badge');
  if (!cartBadge) {
    cartBadge = document.createElement('span');
    cartBadge.className = 'badge bg-danger rounded-pill position-absolute';
    cartBadge.style = 'top: -5px; right: -5px;';
    cartLink.appendChild(cartBadge);
  }
  cartBadge.innerText = cart.length > 0 ? cart.length : '';
}

//Fetch JSON data and populate products
function loadProducts() {
  return new Promise((resolve, reject) => {
    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
      resolve(JSON.parse(storedProducts));
    } else {
      fetch('products.json')
        .then(response => {
          if (!response.ok) throw new Error(`Failed to fetch products.json: ${response.statusText}`);
          return response.json();
        })
        .then(data => {
          localStorage.setItem('products', JSON.stringify(data));
          resolve(data);
        })
        .catch(error => reject(error));
    }
  });
}

loadProducts()
  .then(products => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const wishlistRow = document.getElementById('wishlist-row');
    const wishlistCount = document.getElementById('wishlist-count');
    wishlistCount.innerHTML = `<strong>Wishlist (${favorites.length})</strong>`;

    //Populate wishlist
    favorites.forEach(id => {
      const product = products.find(p => p.id === id);
      if (product) {
        const discountBadge = product.discount ? `<span class="badge bg-danger position-absolute top-0 start-0 m-2">${product.discount}</span>` : '';
        const originalPrice = product.originalPrice ? `<small class="text-muted text-decoration-line-through ms-2">$${product.originalPrice}</small>` : '';
        const priceClass = product.originalPrice ? 'text-danger fw-bold' : 'fw-bold';

        const card = `
                        <div class="col">
                          <div class="card h-100 position-relative" data-id="${product.id}">
                            ${discountBadge}
                            <div class="position-absolute top-0 end-0 m-2 d-flex flex-column align-items-center">
                              <span class="bg-white rounded-circle p-2 mb-1 trash-icon">
                                <i class="bi bi-trash text-secondary"></i>
                              </span>
                              <span class="bg-white rounded-circle p-2 eye-icon">
                                <i class="bi bi-eye text-secondary"></i>
                              </span>
                            </div>
                            <img src="${product.image}" class="card-img-top p-3" alt="${product.name}" style="object-fit: contain; height: 200px;">
                            <div class="card-body text-center">
                              <h6 class="card-title">${product.name}</h6>
                              <p class="mb-2">
                                <span class="${priceClass}">$${product.price}</span>
                                ${originalPrice}
                              </p>
                              <button class="btn btn-dark w-100 add-cart"><i class="bi bi-cart-fill me-2"></i> Add To Cart</button>
                            </div>
                          </div>
                        </div>
                    `;
        wishlistRow.innerHTML += card;
      }
    });

    //adding just for you wich are remaining form the dashboard
    const justForYouRow = document.getElementById('just-for-you-row');
    const nonWishlisted = products.filter(p => !favorites.includes(p.id)).slice(0, 4);
    nonWishlisted.forEach(product => {
      const discountBadge = product.discount ? `<span class="badge bg-danger position-absolute top-0 start-0 m-2">${product.discount}</span>` : product.isNew ? '<span class="badge bg-success position-absolute top-0 start-0 m-2">NEW</span>' : '';
      const originalPrice = product.originalPrice ? `<small class="text-muted text-decoration-line-through ms-2">$${product.originalPrice}</small>` : '';
      const priceClass = product.originalPrice ? 'text-danger fw-bold' : 'fw-bold';

      const card = `
                    <div class="col">
                      <div class="card h-100 position-relative">
                        ${discountBadge}
                        <div class="position-absolute top-0 end-0 m-2 d-flex flex-column align-items-center">
                          <span class="bg-white rounded-circle p-2">
                            <i class="bi bi-eye text-secondary"></i>
                          </span>
                        </div>
                        <img src="${product.image}" class="card-img-top p-3" alt="${product.name}" style="object-fit: contain; height: 200px;">
                        <div class="card-body text-center">
                          <h6 class="card-title">${product.name}</h6>
                          <p class="mb-2">
                            <span class="${priceClass}">$${product.price}</span>
                            ${originalPrice}
                          </p>
                          <button class="btn btn-dark w-100 mb-2 add-cart"><i class="bi bi-cart-fill me-2"></i> Add To Cart</button>
                          <div class="text-warning">
                            ${generateStars(product.rating || 4)}
                            <small class="text-muted ms-2">(${product.reviews || 0})</small>
                          </div>
                        </div>
                      </div>
                    </div>
                `;
      justForYouRow.innerHTML += card;
    });

    //Function to generate star icons
    function generateStars(rating) {
      let stars = '';
      for (let i = 1; i <= 5; i++) {
        stars += `<i class="bi bi-star${i <= rating ? '-fill' : ''}"></i>`;
      }
      return stars;
    }

    //Event listeners for wishlist and Just For You actions
    document.addEventListener('click', function (e) {
      if (e.target.closest('.add-cart')) {
        const card = e.target.closest('.card');
        const productId = parseInt(card.getAttribute('data-id'));
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        if (!cart.includes(productId)) {
          cart.push(productId);
          localStorage.setItem('cart', JSON.stringify(cart));
          updateBadges();
        } else {
        }
      } else if (e.target.closest('.trash-icon')) {
        const card = e.target.closest('.card');
        const productId = parseInt(card.getAttribute('data-id'));
        let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        const index = favorites.indexOf(productId);
        if (index > -1) {
          favorites.splice(index, 1);
          localStorage.setItem('favorites', JSON.stringify(favorites));
          card.closest('.col').remove();
          wishlistCount.innerHTML = `<strong>Wishlist (${favorites.length})</strong>`;
          updateBadges();
          // Refresh Just For You after removal
          justForYouRow.innerHTML = '';
          const nonWishlisted = products.filter(p => !favorites.includes(p.id)).slice(0, 4);
          nonWishlisted.forEach(product => {
            const discountBadge = product.discount ? `<span class="badge bg-danger position-absolute top-0 start-0 m-2">${product.discount}</span>` : product.isNew ? '<span class="badge bg-success position-absolute top-0 start-0 m-2">NEW</span>' : '';
            const originalPrice = product.originalPrice ? `<small class="text-muted text-decoration-line-through ms-2">$${product.originalPrice}</small>` : '';
            const priceClass = product.originalPrice ? 'text-danger fw-bold' : 'fw-bold';

            const justForYouCard = `
                                <div class="col">
                                  <div class="card h-100 position-relative">
                                    ${discountBadge}
                                    <div class="position-absolute top-0 end-0 m-2 d-flex flex-column align-items-center">
                                      <span class="bg-white rounded-circle p-2">
                                        <i class="bi bi-eye text-secondary"></i>
                                      </span>
                                    </div>
                                    <img src="${product.image}" class="card-img-top p-3" alt="${product.name}" style="object-fit: contain; height: 200px;">
                                    <div class="card-body text-center">
                                      <h6 class="card-title">${product.name}</h6>
                                      <p class="mb-2">
                                        <span class="${priceClass}">$${product.price}</span>
                                        ${originalPrice}
                                      </p>
                                      <button class="btn btn-dark w-100 mb-2 add-cart"><i class="bi bi-cart-fill me-2"></i> Add To Card</button>
                                      <div class="text-warning">
                                        ${generateStars(product.rating || 4)}
                                        <small class="text-muted ms-2">(${product.reviews || 0})</small>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                            `;
            justForYouRow.innerHTML += justForYouCard;
          });
        }
      } else if (e.target.closest('.eye-icon')) {
        alert('Viewed product.');
      }
    });

    //Move all to bag
    document.getElementById('move-all-to-bag').addEventListener('click', function () {
      let cart = JSON.parse(localStorage.getItem('cart') || '[]');
      let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      favorites.forEach(id => {
        if (!cart.includes(id)) {
          cart.push(id);
        }
      });
      localStorage.setItem('cart', JSON.stringify(cart));
      localStorage.setItem('favorites', JSON.stringify([]));
      wishlistRow.innerHTML = '';
      wishlistCount.innerHTML = `<strong>Wishlist (0)</strong>`;
      updateBadges();
    });
  })
  .catch(error => console.error('Error loading products:', error.message));