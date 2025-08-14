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

//Fetch JSON Products
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

//Update Cart
function updateCart() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    loadProducts().then(products => {
        const cartBody = document.getElementById('cart-body');
        cartBody.innerHTML = '';
        let totalAmount = 0;

        cart.forEach(id => {
            const product = products.find(p => p.id === id);
            if (product) {
                let quantity = 1;
                const row = document.createElement('tr');
                row.innerHTML = `
                      <td class="d-flex align-items-center">
                          <button type="button" class="btn btn-danger btn-sm rounded-circle me-3 remove-item" style="width: 30px; height: 30px; line-height: 30px; text-align: center; padding: 0;" data-id="${product.id}">
                              <span aria-hidden="true">&times;</span>
                          </button>
                          <img src="${product.image}" alt="${product.name}" class="img-fluid rounded me-3" style="width: 40px; height: 40px; object-fit: cover;">
                          ${product.name}
                      </td>
                      <td>$${product.price}</td>
                      <td>
                          <input type="number" class="form-control text-center" min="1" max="99" value="1" style="width: 60px;" inputmode="numeric" data-id="${product.id}">
                      </td>
                      <td class="subtotal" data-id="${product.id}">$${product.price}</td>
                  `;
                cartBody.appendChild(row);
                totalAmount += product.price;

                //fetching the items form local storage
                const cartItems = JSON.parse(localStorage.getItem('cartItems') || '{}');
                if (cartItems[id]) {
                    quantity = cartItems[id];
                    row.querySelector('input').value = quantity;
                    const subtotal = product.price * quantity;
                    row.querySelector('.subtotal').textContent = `$${subtotal}`;
                    totalAmount += (subtotal - product.price);
                }

                //Quantity changing event
                row.querySelector('input').addEventListener('change', function () {
                    quantity = parseInt(this.value) || 1;
                    if (quantity < 1) quantity = 1;
                    if (quantity > 99) quantity = 99;
                    this.value = quantity;
                    const subtotal = product.price * quantity;
                    row.querySelector('.subtotal').textContent = `$${subtotal}`;
                    updateCartTotal();
                    saveCartItem(id, quantity);
                });
            }
        });

        //Remove item event
        cartBody.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', function () {
                const productId = parseInt(this.getAttribute('data-id'));
                let cart = JSON.parse(localStorage.getItem('cart') || '[]');
                const index = cart.indexOf(productId);
                if (index > -1) {
                    cart.splice(index, 1);
                    localStorage.setItem('cart', JSON.stringify(cart));
                    deleteCartItem(productId);
                    updateCart();
                    updateBadges();
                }
            });
        });

        updateCartTotal();
    });
}

function updateCartTotal() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    loadProducts().then(products => {
        let subtotal = 0;
        cart.forEach(id => {
            const product = products.find(p => p.id === id);
            const cartItems = JSON.parse(localStorage.getItem('cartItems') || '{}');
            const quantity = cartItems[id] || 1;
            subtotal += product.price * quantity;
        });
        document.getElementById('subtotal').textContent = `$${subtotal}`;
        document.getElementById('shipping').textContent = subtotal > 0 ? 'Free' : '$0';
        document.getElementById('total').textContent = `$${subtotal}`;
        document.getElementById('discount-row').style.display = 'none';
        document.getElementById('discount-amount').textContent = '$0';
    });
}

function saveCartItem(id, quantity) {
    let cartItems = JSON.parse(localStorage.getItem('cartItems') || '{}');
    cartItems[id] = quantity;
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
}

function deleteCartItem(id) {
    let cartItems = JSON.parse(localStorage.getItem('cartItems') || '{}');
    delete cartItems[id];
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
}

document.addEventListener('DOMContentLoaded', updateCart);
document.getElementById('update-cart').addEventListener('click', updateCart);

//apply coupon logic
document.getElementById('apply-coupon').addEventListener('click', function () {
    const couponCodeInput = document.getElementById('coupon-code').value;
    const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
    const firstName = loginResponse.profile ? loginResponse.profile.firstName.slice(0, 4).toUpperCase() : '';

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const financialYear = currentMonth >= 4 ? `${currentYear.toString().slice(-2)}${(currentYear + 1).toString().slice(-2)}` : `${(currentYear - 1).toString().slice(-2)}${currentYear.toString().slice(-2)}`;
    const monthAbbr = now.toLocaleString('default', { month: 'short' }).toUpperCase();

    const generatedCoupon = `${firstName}DEVIT${financialYear}${monthAbbr}`;

    if (couponCodeInput === generatedCoupon) {
        let subtotal = parseFloat(document.getElementById('subtotal').textContent.replace('$', ''));
        let discount = subtotal * 0.3; 
        let total = subtotal - discount;

        document.getElementById('discount-row').style.display = 'flex';
        document.getElementById('discount-amount').textContent = `$${discount.toFixed(0)}`;
        document.getElementById('total').textContent = `$${total.toFixed(0)}`;
        localStorage.setItem('cartTotal', total.toFixed(0));
        document.getElementById('coupon-code').style.border = '2px solid green';
    } else {
        document.getElementById('coupon-code').style.border = '2px solid red';
    }
});

document.getElementById('process-checkout').addEventListener('click', function () {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartItems = JSON.parse(localStorage.getItem('cartItems') || '{}');
    const total = document.getElementById('total').textContent.replace('$', '');
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    localStorage.setItem('cartTotal', total);
    window.location.href = '../components/check-out.html';
});