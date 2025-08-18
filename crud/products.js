document.addEventListener('DOMContentLoaded', function() {
    const productsDB = new LocalStorageDB('products');
    const categoriesDB = new LocalStorageDB('categories');
    let currentProductId = null;
    let deleteProductId = null;
    let currentPage = 1;
    const itemsPerPage = 5;
    let filteredProducts = [];

    // DOM Elements
    const productsTable = document.getElementById('productsTable');
    const productForm = document.getElementById('productForm');
    const searchInput = document.getElementById('searchProducts');
    const filterCategory = document.getElementById('filterCategory');
    const saveProductBtn = document.getElementById('saveProduct');
    const confirmDeleteBtn = document.getElementById('confirmDelete');
    const modalTitle = document.getElementById('modalTitle');
    const showingEntries = document.getElementById('showingEntries');
    const pagination = document.getElementById('pagination');
    const addNewBtn = document.getElementById('addNewBtn');

    // Initialize
    loadCategories();
    loadProducts();
    setupEventListeners();

    function loadCategories() {
        const categories = categoriesDB.getAll();
        const categorySelects = document.querySelectorAll('#productCategory, #filterCategory');
        
        categorySelects.forEach(select => {
            select.innerHTML = '<option value="">All Categories</option>' + 
                categories.map(cat => 
                    `<option value="${cat.id}">${cat.name}</option>`
                ).join('');
        });
    }

    function loadProducts() {
        const allProducts = productsDB.getAll();
        filteredProducts = [...allProducts];
        renderProducts();
        updatePagination();
    }

    function renderProducts() {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);
        
        productsTable.innerHTML = paginatedProducts.map(product => {
            const category = categoriesDB.getById(product.category);
            return `
                <tr>
                    <td>${product.id}</td>
                    <td>
                        ${product.image ? 
                            `<img src="${product.image}" alt="${product.name}" width="50">` : 
                            '<i class="bi bi-image" style="font-size: 1.5rem;"></i>'}
                    </td>
                    <td>${product.name}</td>
                    <td>${category ? category.name : 'Uncategorized'}</td>
                    <td>${Utils.formatCurrency(product.price)}</td>
                    <td>${product.stock}</td>
                    <td>${product.description || '-'}</td>
                    <td>
                        <button class="btn btn-sm btn-primary edit-product" data-id="${product.id}" 
                                data-bs-toggle="tooltip" title="Edit">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-danger delete-product" data-id="${product.id}"
                                data-bs-toggle="tooltip" title="Delete">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        // Update showing entries text
        const start = startIndex + 1;
        const end = Math.min(startIndex + itemsPerPage, filteredProducts.length);
        showingEntries.textContent = `Showing ${start} to ${end} of ${filteredProducts.length} entries`;

        // Initialize tooltips for new buttons
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }

    function updatePagination() {
        const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
        pagination.innerHTML = '';

        if (totalPages <= 1) return;

        // Previous button
        pagination.innerHTML += `
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage - 1}">Previous</a>
            </li>
        `;

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            pagination.innerHTML += `
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `;
        }

        // Next button
        pagination.innerHTML += `
            <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage + 1}">Next</a>
            </li>
        `;
    }

    function setupEventListeners() {
        // Add New Product Button
        addNewBtn.addEventListener('click', function() {
            currentProductId = null;
            modalTitle.textContent = 'Add New Product';
            productForm.reset();
            document.getElementById('errorAlert').classList.add('d-none');
            document.getElementById('imagePreview').innerHTML = '';
            
            const modal = new bootstrap.Modal(document.getElementById('productModal'));
            modal.show();
        });

        // Search functionality
        searchInput.addEventListener('input', Utils.debounce(function(e) {
            const searchTerm = e.target.value.toLowerCase();
            filterProducts(searchTerm, filterCategory.value);
        }, 300));

        // Category filter
        filterCategory.addEventListener('change', function(e) {
            filterProducts(searchInput.value.toLowerCase(), e.target.value);
        });

        // Pagination
        pagination.addEventListener('click', function(e) {
            e.preventDefault();
            if (e.target.tagName === 'A') {
                currentPage = parseInt(e.target.getAttribute('data-page'));
                renderProducts();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });

        // Edit product buttons
        productsTable.addEventListener('click', function(e) {
            if (e.target.closest('.edit-product')) {
                const productId = parseInt(e.target.closest('.edit-product').getAttribute('data-id'));
                editProduct(productId);
            } else if (e.target.closest('.delete-product')) {
                const productId = parseInt(e.target.closest('.delete-product').getAttribute('data-id'));
                showDeleteModal(productId);
            }
        });

        // Save product
        saveProductBtn.addEventListener('click', saveProduct);

        // Confirm delete
        confirmDeleteBtn.addEventListener('click', deleteProduct);

        // Image preview
        document.getElementById('productImage').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const preview = document.getElementById('imagePreview');
                    preview.innerHTML = `<img src="${event.target.result}" class="img-thumbnail">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    function filterProducts(searchTerm, categoryId) {
        const allProducts = productsDB.getAll();
        
        filteredProducts = allProducts.filter(product => {
            const matchesSearch = !searchTerm || 
                product.name.toLowerCase().includes(searchTerm) || 
                product.description.toLowerCase().includes(searchTerm);
            
            const matchesCategory = !categoryId || product.category === parseInt(categoryId);
            
            return matchesSearch && matchesCategory;
        });

        currentPage = 1;
        renderProducts();
        updatePagination();
    }

    function editProduct(id) {
        const product = productsDB.getById(id);
        if (product) {
            currentProductId = id;
            modalTitle.textContent = 'Edit Product';
            
            // Fill form
            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productStock').value = product.stock;
            document.getElementById('productDescription').value = product.description || '';
            document.getElementById('productCategory').value = product.category || '';
            document.getElementById('productStatus').value = product.status || 'active';
            
            // Image preview
            const preview = document.getElementById('imagePreview');
            preview.innerHTML = product.image ? 
                `<img src="${product.image}" class="img-thumbnail">` : 
                '<div class="text-muted">No image</div>';
            
            // Show modal
            const modal = new bootstrap.Modal(document.getElementById('productModal'));
            modal.show();
        }
    }

    function saveProduct() {
        // Get form values
        const name = document.getElementById('productName').value.trim();
        const price = parseFloat(document.getElementById('productPrice').value);
        const stock = parseInt(document.getElementById('productStock').value);
        const category = document.getElementById('productCategory').value;
        const description = document.getElementById('productDescription').value.trim();
        const status = document.getElementById('productStatus').value;
        const imageFile = document.getElementById('productImage').files[0];
        
        // Validation
        if (!name || isNaN(price) || isNaN(stock) || !category) {
            Utils.showAlert('Please fill in all required fields with valid data');
            return;
        }
        
        // Handle image
        function saveToDB(imageUrl) {
            const productData = {
                name,
                price,
                stock,
                category: parseInt(category), // Parse category as integer
                description,
                status,
                image: imageUrl
            };

            if (currentProductId) {
                productsDB.update(currentProductId, productData);
            } else {
                productsDB.create(productData);
            }

            bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();
            loadProducts();
            Utils.showAlert(`Product ${currentProductId ? 'updated' : 'added'} successfully!`, 'success');
            document.dispatchEvent(new Event('productSaved')); // Dispatch event after saving
        }

        if (imageFile) {
            const reader = new FileReader();
            reader.onload = function(event) {
                saveToDB(event.target.result);
            };
            reader.readAsDataURL(imageFile);
        } else if (currentProductId) {
            const existingProduct = productsDB.getById(currentProductId);
            saveToDB(existingProduct.image || '');
        } else {
            saveToDB('');
        }
    }

    function showDeleteModal(id) {
        deleteProductId = id;
        const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
        modal.show();
    }

    function deleteProduct() {
        if (deleteProductId) {
            productsDB.delete(deleteProductId);
            bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide();
            loadProducts();
            Utils.showAlert('Product deleted successfully!', 'success');
            deleteProductId = null;
        }
    }
});