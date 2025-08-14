// Header fetch
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

// Footer fetch
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

// Populate order summary
function populateOrderSummary() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartItems = JSON.parse(localStorage.getItem('cartItems') || '{}');
    loadProducts().then(products => {
        const orderSummary = document.getElementById('order-summary');
        orderSummary.innerHTML = '';
        let subtotal = 0;

        cart.forEach(id => {
            const product = products.find(p => p.id === id);
            if (product) {
                const quantity = cartItems[id] || 1;
                const itemSubtotal = product.price * quantity;
                subtotal += itemSubtotal;
                const summaryItem = `
                            <div class="d-flex align-items-center mb-2">
                                <img src="${product.image}" alt="${product.name}" class="mr-2 img-fluid" style="width: 50px;">
                                <span>${product.name}</span>
                                <span class="ml-auto">$${itemSubtotal}</span>
                            </div>
                        `;
                orderSummary.innerHTML += summaryItem;
            }
        });

        //Checking logic of the discount applied 
        const cartTotal = parseFloat(localStorage.getItem('cartTotal') || subtotal);
        const discountApplied = subtotal !== cartTotal;
        if (discountApplied) {
            const discount = subtotal - cartTotal;
            document.getElementById('discount-row').style.display = 'flex';
            document.getElementById('discount-amount').innerText = `$${discount.toFixed(0)}`;
            document.getElementById('subtotal').innerText = `$${subtotal}`;
            document.getElementById('total').innerText = `$${cartTotal}`;
            document.getElementById('coupon-section').style.display = 'none';
        } else {
            document.getElementById('subtotal').innerText = `$${subtotal}`;
            document.getElementById('total').innerText = `$${subtotal}`;
            document.getElementById('discount-row').style.display = 'none';
            document.getElementById('coupon-section').style.display = 'block';
        }
    });
}

//Apply coupon logic
document.getElementById('apply-coupon').addEventListener('click', function () {
    const couponCodeInput = document.getElementById('coupon-code').value;
    const loginResponse = JSON.parse(localStorage.getItem('loginResponse') || '{}');
    const firstName = loginResponse.profile ? loginResponse.profile.firstName.slice(0, 4).toUpperCase() : '';

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // January is 0
    const financialYear = currentMonth >= 4 ? `${currentYear.toString().slice(-2)}${(currentYear + 1).toString().slice(-2)}` : `${(currentYear - 1).toString().slice(-2)}${currentYear.toString().slice(-2)}`;
    const monthAbbr = now.toLocaleString('default', { month: 'short' }).toUpperCase();

    const generatedCoupon = `${firstName}DEVIT${financialYear}${monthAbbr}`;

    if (couponCodeInput === generatedCoupon) {
        const subtotal = parseFloat(document.getElementById('subtotal').innerText.replace('$', ''));
        const discount = subtotal * 0.3;
        const total = subtotal - discount;

        document.getElementById('discount-row').style.display = 'flex';
        document.getElementById('discount-amount').innerText = `$${discount.toFixed(0)}`;
        document.getElementById('total').innerText = `$${total.toFixed(0)}`;
        localStorage.setItem('cartTotal', total.toFixed(0));
        document.getElementById('coupon-section').style.display = 'none'; 
        document.getElementById('coupon-code').style.border = '2px solid green';
    } else {
        document.getElementById('coupon-code').style.border = '2px solid red';
    }
});

//Saving billing details to localStorage
document.getElementById('place-order').addEventListener('click', function () {
    const billingDetails = {
        firstName: document.getElementById('first-name').value,
        companyName: document.getElementById('company-name').value,
        streetAddress: document.getElementById('street-address').value,
        apartment: document.getElementById('apartment').value,
        townCity: document.getElementById('town-city').value,
        phoneNumber: document.getElementById('phone-number').value,
        emailAddress: document.getElementById('email-address').value,
        saveInfo: document.getElementById('saveInfo').checked
    };
    localStorage.setItem('billingDetails', JSON.stringify(billingDetails));
    alert('Order placed and billing details saved!');
});

document.addEventListener('DOMContentLoaded', populateOrderSummary);