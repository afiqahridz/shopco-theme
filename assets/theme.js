/*
  SHOP.CO — Theme JS
  keeping this vanilla, no jquery needed for this

  note to self: test cart on mobile before submitting
*/

// =============================================
// ANNOUNCEMENT BAR
// =============================================

(function() {
  var bar = document.getElementById('announcement-bar');
  var closeBtn = document.getElementById('announcement-close');

  if (!bar || !closeBtn) return;

  // don't show if already closed this session
  if (sessionStorage.getItem('ann_closed')) {
    bar.style.display = 'none';
    return;
  }

  closeBtn.addEventListener('click', function() {
    bar.style.display = 'none';
    sessionStorage.setItem('ann_closed', '1');
  });
})();


// =============================================
// MOBILE MENU
// =============================================

(function() {
  var openBtn = document.getElementById('mobile-menu-open');
  var closeBtn = document.getElementById('mobile-menu-close');
  var menu = document.getElementById('mobile-menu');
  var overlay = document.getElementById('menu-overlay');

  if (!menu) return;

  function open() {
    menu.classList.add('open');
    overlay && overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    openBtn && openBtn.setAttribute('aria-expanded', 'true');
  }

  function close() {
    menu.classList.remove('open');
    overlay && overlay.classList.remove('open');
    document.body.style.overflow = '';
    openBtn && openBtn.setAttribute('aria-expanded', 'false');
  }

  openBtn && openBtn.addEventListener('click', open);
  closeBtn && closeBtn.addEventListener('click', close);
  overlay && overlay.addEventListener('click', close);

  // close on escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && menu.classList.contains('open')) close();
  });
})();


// =============================================
// PRODUCT GALLERY — thumbnail click to swap
// =============================================

(function() {
  var thumbs = document.querySelectorAll('.product-thumb');
  var mainImg = document.getElementById('main-product-image');

  if (!thumbs.length || !mainImg) return;

  thumbs.forEach(function(thumb) {
    thumb.addEventListener('click', function() {
      // remove active from all
      thumbs.forEach(function(t) { t.classList.remove('active'); });
      this.classList.add('active');

      var newSrc = this.dataset.src;
      if (!newSrc) return;

      // simple fade swap
      mainImg.style.opacity = '0';
      mainImg.style.transition = 'opacity 0.2s ease';

      setTimeout(function() {
        mainImg.src = newSrc;
        mainImg.style.opacity = '1';
      }, 180);
    });
  });
})();


// =============================================
// QUANTITY SELECTORS (works for product + cart)
// =============================================

function initQtySelectors() {
  document.querySelectorAll('[data-qty-wrap]').forEach(function(wrap) {
    var input = wrap.querySelector('[data-qty-input]');
    var minus = wrap.querySelector('[data-qty-minus]');
    var plus = wrap.querySelector('[data-qty-plus]');

    if (!input) return;

    minus && minus.addEventListener('click', function() {
      var val = parseInt(input.value) || 1;
      if (val > 1) {
        input.value = val - 1;
        input.dispatchEvent(new Event('change'));
      }
    });

    plus && plus.addEventListener('click', function() {
      var val = parseInt(input.value) || 1;
      input.value = val + 1;
      input.dispatchEvent(new Event('change'));
    });
  });
}

initQtySelectors();


// =============================================
// CART COUNT — fetch and update badge
// =============================================

function updateCartCount() {
  fetch('/cart.js')
    .then(function(r) { return r.json(); })
    .then(function(cart) {
      var badge = document.querySelector('.cart-count');
      if (!badge) return;
      badge.textContent = cart.item_count;
      badge.style.display = cart.item_count > 0 ? 'flex' : 'none';
    })
    .catch(function() {
      // silently fail - not critical
    });
}

// run on page load
document.addEventListener('DOMContentLoaded', updateCartCount);


// =============================================
// ADD TO CART — AJAX form submit
// =============================================

(function() {
  var form = document.getElementById('product-form');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    var addBtn = form.querySelector('[data-add-to-cart]');
    var variantId = form.querySelector('input[name="id"]').value;
    var qty = parseInt(form.querySelector('[data-qty-input]')?.value) || 1;

    if (!variantId) return;

    // disable button while adding
    if (addBtn) {
      addBtn.disabled = true;
      addBtn.textContent = 'Adding...';
    }

    fetch('/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        items: [{ id: parseInt(variantId), quantity: qty }]
      })
    })
    .then(function(r) {
      if (!r.ok) throw new Error('Add to cart failed');
      return r.json();
    })
    .then(function() {
      showToast('Added to cart!');
      updateCartCount();
    })
    .catch(function() {
      showToast('Something went wrong, please try again.');
    })
    .finally(function() {
      if (addBtn) {
        addBtn.disabled = false;
        addBtn.textContent = 'Add to Cart';
      }
    });
  });
})();


// =============================================
// QUICK ADD (product cards)
// =============================================

document.querySelectorAll('[data-quick-add]').forEach(function(btn) {
  btn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();

    var variantId = this.dataset.variantId;
    if (!variantId) return;

    var originalText = this.textContent;
    this.textContent = 'Adding...';

    fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [{ id: parseInt(variantId), quantity: 1 }] })
    })
    .then(function(r) { return r.json(); })
    .then(function() {
      showToast('Added to cart!');
      updateCartCount();
    })
    .catch(function() {
      showToast('Could not add item.');
    })
    .finally(function() {
      btn.textContent = originalText;
    });
  });
});


// =============================================
// CART PAGE — live quantity update + remove
// =============================================

// quantity change on cart page
document.querySelectorAll('[data-qty-input][data-line]').forEach(function(input) {
  var debounceTimer;

  input.addEventListener('change', function() {
    var line = parseInt(this.dataset.line);
    var qty = parseInt(this.value);

    // debounce so we don't fire on every keypress
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function() {
      fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ line: line, quantity: qty < 0 ? 0 : qty })
      })
      .then(function() { window.location.reload(); })
      .catch(function() { showToast('Could not update cart.'); });
    }, 500);
  });
});

// remove buttons
document.querySelectorAll('[data-cart-remove]').forEach(function(btn) {
  btn.addEventListener('click', function() {
    var line = parseInt(this.dataset.line);

    fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ line: line, quantity: 0 })
    })
    .then(function() { window.location.reload(); })
    .catch(function() { showToast('Something went wrong.'); });
  });
});


// =============================================
// REVIEWS SLIDER
// =============================================

(function() {
  var track = document.getElementById('reviews-track');
  var prevBtn = document.getElementById('reviews-prev');
  var nextBtn = document.getElementById('reviews-next');

  if (!track) return;

  var currentOffset = 0;
  // card width + gap
  var step = 404;

  function getMaxOffset() {
    return track.scrollWidth - track.parentElement.offsetWidth;
  }

  nextBtn && nextBtn.addEventListener('click', function() {
    var max = getMaxOffset();
    currentOffset = Math.min(currentOffset + step, max);
    track.style.transform = 'translateX(-' + currentOffset + 'px)';
  });

  prevBtn && prevBtn.addEventListener('click', function() {
    currentOffset = Math.max(currentOffset - step, 0);
    track.style.transform = 'translateX(-' + currentOffset + 'px)';
  });
})();


// =============================================
// TABS
// =============================================

document.querySelectorAll('[data-tabs]').forEach(function(tabGroup) {
  tabGroup.querySelectorAll('.tab-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var target = this.dataset.tab;

      // update buttons
      tabGroup.querySelectorAll('.tab-btn').forEach(function(b) {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      this.classList.add('active');
      this.setAttribute('aria-selected', 'true');

      // update panels
      tabGroup.querySelectorAll('.tab-panel').forEach(function(p) {
        p.classList.remove('active');
      });

      var panel = tabGroup.querySelector('[data-panel="' + target + '"]');
      if (panel) panel.classList.add('active');
    });
  });
});


// =============================================
// COLOUR / SIZE OPTION SELECTION
// =============================================

// colour swatches
document.querySelectorAll('.color-swatch').forEach(function(swatch) {
  swatch.addEventListener('click', function() {
    var group = this.closest('.color-swatches');
    if (group) {
      group.querySelectorAll('.color-swatch').forEach(function(s) {
        s.classList.remove('active');
      });
    }
    this.classList.add('active');
  });
});

// size chips
document.querySelectorAll('.size-chip').forEach(function(chip) {
  chip.addEventListener('click', function() {
    var group = this.closest('.size-chips');
    if (group) {
      group.querySelectorAll('.size-chip').forEach(function(c) {
        c.classList.remove('active');
      });
    }
    this.classList.add('active');
  });
});


// =============================================
// FILTER SIDEBAR — mobile slide in
// =============================================

(function() {
  var toggleBtn = document.getElementById('filter-toggle');
  var sidebar = document.getElementById('filters-sidebar');
  var overlay = document.getElementById('menu-overlay');

  if (!toggleBtn || !sidebar) return;

  toggleBtn.addEventListener('click', function() {
    sidebar.classList.toggle('open');
    overlay && overlay.classList.toggle('open');
    document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
  });

  // close when overlay clicked
  overlay && overlay.addEventListener('click', function() {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  });
})();


// =============================================
// PRICE RANGE SLIDER
// =============================================

(function() {
  var slider = document.getElementById('price-range');
  var display = document.getElementById('price-display');

  if (!slider || !display) return;

  slider.addEventListener('input', function() {
    display.textContent = '$' + this.value;
  });
})();


// =============================================
// NEWSLETTER FORM
// =============================================

(function() {
  var form = document.getElementById('newsletter-form');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    // Shopify handles the actual submission via the action URL
    // but we want a nice confirmation for now
    showToast('Thanks for subscribing!');
    form.reset();
  });
})();


// =============================================
// TOAST NOTIFICATION
// =============================================

function showToast(message) {
  var toast = document.getElementById('toast-notification');

  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-notification';
    toast.className = 'toast';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add('show');

  // hide after 2.8s
  setTimeout(function() {
    toast.classList.remove('show');
  }, 2800);
}


// =============================================
// SCROLL ANIMATIONS
// =============================================

(function() {
  // bail if IntersectionObserver not supported (old browsers)
  if (!window.IntersectionObserver) return;

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // only animate once
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('[data-animate]').forEach(function(el) {
    el.classList.add('animate-ready');
    observer.observe(el);
  });
})();


// =============================================
// WISHLIST BUTTON — toggle heart
// =============================================

document.querySelectorAll('.wishlist-btn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    var isWishlisted = this.dataset.wishlisted === 'true';

    if (isWishlisted) {
      this.dataset.wishlisted = 'false';
      this.style.background = '';
      this.style.color = '';
      showToast('Removed from wishlist');
    } else {
      this.dataset.wishlisted = 'true';
      this.style.background = '#000';
      this.style.color = '#fff';
      showToast('Added to wishlist!');
    }
  });
});
