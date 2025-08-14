//Header fetch
document.addEventListener("DOMContentLoaded", function () {
    fetch('./headerNew.html')
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
    fetch('./footer.html')
        .then(response => {
            if (!response.ok) throw new Error(`Failed to fetch footer.html: ${response.statusText}`);
            return response.text();
        })
        .then(data => {
            document.getElementById('footer-placeholder').innerHTML = data;
        })
        .catch(error => console.error('Error fetching footer:', error.message));
});

//Function to generate star icons based on rating
function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += `<i class="bi bi-star${i <= rating ? '-fill' : ''}"></i>`;
    }
    return stars;
}

//mapping radio btn to get color
function getBootstrapColorClass(color) {
    const colorMap = {
        red: 'bg-danger',
        yellow: 'bg-warning',
        black: 'bg-dark',
        blue: 'bg-primary',
        green: 'bg-success'
    };
    return colorMap[color.toLowerCase()] || '';
}

//radio btn propogation color wise
function generateColors(product) {
    if (!product.colors || product.colors.length === 0) return '';

    const colorInputs = product.colors.map((color, index) => {
        return `
            <input 
                class="form-check-input ${index > 0 ? 'ms-2' : ''} rounded-circle ${getBootstrapColorClass(color)}" 
                type="radio" 
                name="color${product.id}" 
                value="${color}">
        `;
    }).join('');

    return `
        <div class="form-check d-flex justify-content-left mt-2">
            ${colorInputs}
        </div>
    `;
}

//update badges in header
function updateBadges() {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');

    // Find heart icon link
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

//Fetch JSON data and populate products, saving to localStorage
function loadProducts() {
    return new Promise((resolve, reject) => {
        const storedProducts = localStorage.getItem('products');
        if (storedProducts) {
            resolve(JSON.parse(storedProducts));
        } else {
            fetch('./products.json')
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
        const productRow = document.getElementById('product-row');
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

        products.forEach(product => {
            const isFavorited = favorites.includes(product.id);
            const heartClass = isFavorited ? 'bi-heart-fill' : 'bi-heart';
            const originalPrice = product.originalPrice ? `<small class="text-muted text-decoration-line-through ms-2">$${product.originalPrice}</small>` : '';
            const priceClass = product.originalPrice ? 'text-danger fw-bold' : 'fw-bold';
            const colors = generateColors(product);
            const imgStyle = product.id === 1 ? '' : 'style="height:220px;object-fit:contain;"';
            const imgClass = product.id === 1 ? 'card-img-top img-fluid p-4' : 'card-img-top bg-white p-4';
            const ratioDivOpen = product.id === 1 ? '<div class="ratio ratio-4x3">' : '';
            const ratioDivClose = product.id === 1 ? '</div>' : '';

            const card = `
                <div class="col-6 col-md-3">
                    <div class="card h-100 position-relative product-card" data-id="${product.id}">
                        
                        <div class="position-absolute top-0 end-0 m-2 d-flex flex-column align-items-center">
                            <span class="bg-white rounded-circle p-1 d-flex align-items-center justify-content-center icon opacity-0">
                                <i class="bi ${heartClass} text-secondary"></i>
                            </span>
                            <span class="bg-white rounded-circle p-1 d-flex align-items-center justify-content-center mt-n1 icon opacity-0">
                                <i class="bi bi-eye text-secondary"></i>
                            </span>
                        </div>
                        ${ratioDivOpen}
                        <img src="${product.image}" class="${imgClass}" alt="${product.name}" ${imgStyle}>
                        ${ratioDivClose}
                        <div class="card-body text-center">
                            <button class="btn btn-dark w-100 mb-2 add-cart opacity-0" data-name="${product.name}">
                                <i class="bi bi-cart-fill me-2"></i> Add To Cart
                            </button>
                            <h6 class="card-title">${product.name}</h6>
                            <p class="mb-1">
                                <span class="${priceClass}">$${product.price}</span>
                                ${originalPrice}
                            </p>
                            <div class="text-warning">
                                ${generateStars(product.rating || 4)}
                                <small class="text-muted ms-2">(${product.reviews || 0})</small>
                            </div>
                        </div>
                        ${colors}
                    </div>
                </div>
            `;
            productRow.innerHTML += card;
        });

        //Hover effects
        document.addEventListener('mouseover', function (e) {
            if (e.target.closest('.product-card')) {
                const card = e.target.closest('.product-card');
                const btns = card.getElementsByClassName('add-cart');
                if (btns.length > 0) {
                    btns[0].classList.remove('opacity-0');
                    btns[0].classList.add('opacity-100');
                    btns[0].style.transition = 'opacity 0.4s';
                }
                const icons = card.getElementsByClassName('icon');
                for (let i = 0; i < icons.length; i++) {
                    icons[i].classList.remove('opacity-0');
                    icons[i].classList.add('opacity-100');
                    icons[i].style.transition = 'opacity 0.4s';
                }
            }
        });

        document.addEventListener('mouseout', function (e) {
            if (e.target.closest('.product-card')) {
                const card = e.target.closest('.product-card');
                const btns = card.getElementsByClassName('add-cart');
                if (btns.length > 0) {
                    btns[0].classList.remove('opacity-100');
                    btns[0].classList.add('opacity-0');
                    btns[0].style.transition = 'opacity 0.4s';
                }
                const icons = card.getElementsByClassName('icon');
                for (let i = 0; i < icons.length; i++) {
                    icons[i].classList.remove('opacity-100');
                    icons[i].classList.add('opacity-0');
                    icons[i].style.transition = 'opacity 0.4s';
                }
            }
        });

        // Add to cart and favorite click events
        document.addEventListener('click', function (e) {
            if (e.target.classList.contains('add-cart')) {
                const card = e.target.closest('.product-card');
                const productId = parseInt(card.getAttribute('data-id'));
                const name = e.target.getAttribute('data-name') || 'product';
                let cart = JSON.parse(localStorage.getItem('cart') || '[]');
                if (!cart.includes(productId)) {
                    cart.push(productId);
                    localStorage.setItem('cart', JSON.stringify(cart));
                    updateBadges();
                } else {
                }
            } else if (e.target.classList.contains('bi-heart') || e.target.classList.contains('bi-heart-fill')) {
                const card = e.target.closest('.product-card');
                const productId = parseInt(card.getAttribute('data-id'));
                let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
                if (e.target.classList.contains('bi-heart-fill')) {
                    e.target.classList.remove('bi-heart-fill');
                    e.target.classList.add('bi-heart');
                    const index = favorites.indexOf(productId);
                    if (index > -1) favorites.splice(index, 1);
                } else {
                    e.target.classList.remove('bi-heart');
                    e.target.classList.add('bi-heart-fill');
                    if (!favorites.includes(productId)) favorites.push(productId);
                }
                localStorage.setItem('favorites', JSON.stringify(favorites));
                updateBadges();
            }
        });
    })
    .catch(error => console.error('Error loading products:', error.message));