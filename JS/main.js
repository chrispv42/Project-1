document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const cartItemCountElement = document.getElementById('cart-item-count');
  const onCartPage =
    location.pathname.endsWith('/cart.html') || location.pathname.includes('cart.html');
  if (cartItemCountElement) {
    const itemCount = localStorage.getItem('cartItemCount');
    if (itemCount && parseInt(itemCount) > 0) {
      cartItemCountElement.textContent = itemCount;
      cartItemCountElement.style.display = 'inline-block';
    } else {
      cartItemCountElement.textContent = onCartPage ? '0' : '';
      cartItemCountElement.style.display = onCartPage ? 'inline-block' : 'none';
    }
  }

  const toggles = document.querySelectorAll('#darkModeToggle, .theme-toggle-button');
  function setToggleLabels(isLight) {
    const label = isLight ? 'Neon Green' : 'Neon Pink';
    toggles.forEach((btn) => (btn.textContent = label));
  }
  function applyTheme(isLight) {
    document.body.classList.toggle('light-mode', isLight);
    localStorage.setItem('lightMode', isLight ? 'true' : 'false');
    setToggleLabels(isLight);
  }
  const initialLight = localStorage.getItem('lightMode') === 'true';
  applyTheme(initialLight);
  toggles.forEach((btn) =>
    btn.addEventListener('click', () => {
      applyTheme(!document.body.classList.contains('light-mode'));
    })
  );

  const order = JSON.parse(localStorage.getItem('neonSliceOrder') || 'null');

  const communityDetailsElement = document.getElementById('communityDetails');
  if (communityDetailsElement && order) {
    communityDetailsElement.innerHTML = `
      <h3 class="neon-text mt-3">Your Order Summary</h3>
      <ul class="list-unstyled">
        <li><strong>Name:</strong> ${order.name || ''}</li>
        <li><strong>Email:</strong> ${order.email || ''}</li>
        <li><strong>Phone:</strong> ${order.phone || ''}</li>
        <li><strong>Method:</strong> ${order.method || ''}</li>
        ${
          order.address
            ? `<li><strong>Address:</strong> ${order.address}, ${order.city || ''}, ${
                order.state || ''
              } ${order.zip || ''}</li>`
            : ''
        }
        <li><strong>Size:</strong> ${order.size || ''}</li>
        <li><strong>Base:</strong> ${order.base || ''}</li>
        <li><strong>Toppings:</strong> ${
          order.toppings && order.toppings.length ? order.toppings.join(', ') : 'None'
        }</li>
        ${order.notes ? `<li><strong>Notes:</strong> ${order.notes}</li>` : ''}
      </ul>
      <ul class="list-unstyled">
        <li><strong>Subtotal:</strong> $${order.subtotal || '0.00'}</li>
        <li><strong>Tax:</strong> $${order.tax || '0.00'}</li>
        <li><strong>Delivery Fee:</strong> $${order.deliveryFee || '0.00'}</li>
        <li><strong>Total:</strong> $${order.total || '0.00'}</li>
      </ul>
    `;
  }

  const cartDetailsElement = document.getElementById('cartDetails');
  const proceedToPaymentButton = document.getElementById('proceedToPayment');
  const clearCartBtn = document.getElementById('clearCart');

  function renderEmptyCart() {
    if (cartDetailsElement) {
      cartDetailsElement.innerHTML = `<p class="text-secondary-emphasis">Your cart is empty. Please place an order first.</p>`;
    }
    if (proceedToPaymentButton) proceedToPaymentButton.disabled = true;
    if (cartItemCountElement) {
      cartItemCountElement.textContent = onCartPage ? '0' : '';
      cartItemCountElement.style.display = onCartPage ? 'inline-block' : 'none';
    }
  }

  if (cartDetailsElement) {
    if (order) {
      cartDetailsElement.innerHTML = `
        <p><strong>Name:</strong> ${order.name || ''}</p>
        <p><strong>Email:</strong> ${order.email || ''}</p>
        <p><strong>Phone:</strong> ${order.phone || ''}</p>
        <p><strong>Method:</strong> ${order.method || ''}</p>
        ${
          order.address
            ? `<p><strong>Address:</strong> ${order.address}, ${order.city || ''}, ${
                order.state || ''
              } ${order.zip || ''}</p>`
            : ''
        }
        <h3 class="neon-text mt-4">Items Ordered:</h3>
        <ul class="list-unstyled">
          <li><strong>Size:</strong> ${order.size || ''}</li>
          <li><strong>Base:</strong> ${order.base || ''}</li>
          <li><strong>Toppings:</strong> ${
            order.toppings && order.toppings.length > 0 ? order.toppings.join(', ') : 'None'
          }</li>
          ${order.notes ? `<li><strong>Notes:</strong> ${order.notes}</li>` : ''}
        </ul>
        <h3 class="neon-text mt-4">Order Summary:</h3>
        <ul class="list-unstyled">
          <li><strong>Subtotal:</strong> $${order.subtotal || '0.00'}</li>
          <li><strong>Tax:</strong> $${order.tax || '0.00'}</li>
          <li><strong>Delivery Fee:</strong> $${order.deliveryFee || '0.00'}</li>
          <li><strong>Total:</strong> $${order.total || '0.00'}</li>
        </ul>
      `;
      if (proceedToPaymentButton) proceedToPaymentButton.disabled = false;
    } else {
      renderEmptyCart();
    }

    if (proceedToPaymentButton) {
      proceedToPaymentButton.addEventListener('click', () => {
        window.location.href = '../payments.html';
      });
    }

    if (clearCartBtn) {
      clearCartBtn.addEventListener('click', () => {
        localStorage.removeItem('neonSliceOrder');
        localStorage.setItem('cartItemCount', '0');
        renderEmptyCart();
      });
    }
  }

  const orderForm =
    document.getElementById('orderForm') || document.querySelector('form[action*="payments.html"]');
  if (orderForm) {
    orderForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(orderForm);
      const nextOrder = {};
      formData.forEach((value, key) => {
        if (nextOrder[key]) {
          if (Array.isArray(nextOrder[key])) nextOrder[key].push(value);
          else nextOrder[key] = [nextOrder[key], value];
        } else {
          nextOrder[key] = value;
        }
      });
      nextOrder.subtotal = 10.0;
      nextOrder.tax = (nextOrder.subtotal * 0.08).toFixed(2);
      nextOrder.deliveryFee = nextOrder.method === 'delivery' ? 3.5 : 0;
      nextOrder.total = (
        parseFloat(nextOrder.subtotal) +
        parseFloat(nextOrder.tax) +
        parseFloat(nextOrder.deliveryFee)
      ).toFixed(2);
      localStorage.setItem('neonSliceOrder', JSON.stringify(nextOrder));
      localStorage.setItem('cartItemCount', '1');
      window.location.href = '../cart.html';
    });
  }

  const orderNumberElement = document.getElementById('orderNumber');
  const orderDetailsElement = document.getElementById('orderDetails');
  if (orderNumberElement && orderDetailsElement) {
    const generateOrderNumber = () => 'NS-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    orderNumberElement.textContent = generateOrderNumber();
    const payOrder = JSON.parse(localStorage.getItem('neonSliceOrder') || 'null');
    if (payOrder) {
      orderDetailsElement.innerHTML = `
        <p><strong>Name:</strong> ${payOrder.name || ''}</p>
        <p><strong>Email:</strong> ${payOrder.email || ''}</p>
        <p><strong>Phone:</strong> ${payOrder.phone || ''}</p>
        <p><strong>Method:</strong> ${payOrder.method || ''}</p>
        ${
          payOrder.address
            ? `<p><strong>Address:</strong> ${payOrder.address}, ${payOrder.city || ''}, ${
                payOrder.state || ''
              } ${payOrder.zip || ''}</p>`
            : ''
        }
        <h3 class="neon-text mt-4">Items Ordered:</h3>
        <ul class="list-unstyled">
          <li><strong>Size:</strong> ${payOrder.size || ''}</li>
          <li><strong>Base:</strong> ${payOrder.base || ''}</li>
          <li><strong>Toppings:</strong> ${
            payOrder.toppings && payOrder.toppings.length > 0
              ? payOrder.toppings.join(', ')
              : 'None'
          }</li>
          ${payOrder.notes ? `<li><strong>Notes:</strong> ${payOrder.notes}</li>` : ''}
        </ul>
        <h3 class="neon-text mt-4">Payment Summary:</h3>
        <ul class="list-unstyled">
          <li><strong>Subtotal:</strong> $${payOrder.subtotal || '0.00'}</li>
          <li><strong>Tax:</strong> $${payOrder.tax || '0.00'}</li>
          <li><strong>Delivery Fee:</strong> $${payOrder.deliveryFee || '0.00'}</li>
          <li><strong>Total:</strong> $${payOrder.total || '0.00'}</li>
        </ul>
      `;
    } else {
      orderDetailsElement.innerHTML = `<p class="text-secondary-emphasis">No order details found. Please place an order first.</p>`;
    }
  }

  const registrationForm = document.getElementById('registrationForm');
  if (registrationForm) {
    registrationForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(registrationForm);
      const userProfile = {};
      formData.forEach((value, key) => (userProfile[key] = value));
      localStorage.setItem('neonUserProfile', JSON.stringify(userProfile));
      window.location.href = '../greetingsRegistration.html';
    });
  }
});
