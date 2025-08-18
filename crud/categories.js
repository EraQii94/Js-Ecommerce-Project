document.addEventListener('DOMContentLoaded', function() {
    let currentCategoryId = null;
    let deleteCategoryId = null;
    let currentPage = 1;
    const itemsPerPage = 5;
    let filteredCategories = [];
    let allProducts = [];

    // DOM Elements
    const categoriesTable = document.getElementById('categoriesTable');
    const categoryForm = document.getElementById('categoryForm');
    const searchInput = document.getElementById('searchCategories');
    const saveCategoryBtn = document.getElementById('saveCategory');
    const confirmDeleteBtn = document.getElementById('confirmDeleteCategory');
    const modalTitle = document.getElementById('modalCategoryTitle');
    const showingEntries = document.getElementById('showingEntriesCat');
    const pagination = document.getElementById('paginationCat');
    const addCategoryBtn = document.getElementById('addCategoryBtn');

    // Initialize
    loadCategories();
    loadProducts();
    setupEventListeners();

    // Listen for the productSaved event
    document.addEventListener('productSaved', function() {
        loadProducts();
        loadCategories(); // This will re-render the categories with updated counts
    });

    function loadCategories() {
        filteredCategories = JSON.parse(localStorage.getItem('categories')) || [];
        renderCategories();
        updatePagination();
    }

    function loadProducts() {
        allProducts = JSON.parse(localStorage.getItem('products')) || [];
    }

    function renderCategories() {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const paginatedCategories = filteredCategories.slice(startIndex, startIndex + itemsPerPage);

        categoriesTable.innerHTML = paginatedCategories.map(category => {
            const productCount = allProducts.filter(p => p.category === category.id).length;
            return `
                <tr>
                    <td>${category.id}</td>
                    <td>${category.name}</td>
                    <td>${productCount}</td>
                    <td>
                        <span class="badge bg-${category.status === 'active' ? 'success' : 'secondary'}">
                            ${category.status}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-primary edit-category" data-id="${category.id}" 
                                data-bs-toggle="tooltip" title="Edit">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-danger delete-category" data-id="${category.id}"
                                data-bs-toggle="tooltip" title="Delete">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        // Update showing entries text
        const start = startIndex + 1;
        const end = Math.min(startIndex + itemsPerPage, filteredCategories.length);
        showingEntries.textContent = `Showing ${start} to ${end} of ${filteredCategories.length} entries`;

        // Initialize tooltips for new buttons
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }

    function updatePagination() {
        const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
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
        addCategoryBtn.addEventListener('click', function() {
            currentCategoryId = null;
            modalTitle.textContent = 'Add New Category';
            categoryForm.reset();
            document.getElementById('errorAlertCat').classList.add('d-none');
            const myModal = new bootstrap.Modal(document.getElementById('categoryModal'));
            myModal.show();
        });

        searchInput.addEventListener('input', Utils.debounce(function(e) {
            const searchTerm = e.target.value.toLowerCase();
            filterCategories(searchTerm);
        }, 300));

        pagination.addEventListener('click', function(e) {
            e.preventDefault();
            if (e.target.tagName === 'A') {
                currentPage = parseInt(e.target.getAttribute('data-page'));
                renderCategories();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });

        categoriesTable.addEventListener('click', function(e) {
            if (e.target.closest('.edit-category')) {
                const categoryId = parseInt(e.target.closest('.edit-category').getAttribute('data-id'));
                editCategory(categoryId);
            } else if (e.target.closest('.delete-category')) {
                const categoryId = parseInt(e.target.closest('.delete-category').getAttribute('data-id'));
                showDeleteModal(categoryId);
            }
        });

        saveCategoryBtn.addEventListener('click', saveCategory);

        confirmDeleteBtn.addEventListener('click', deleteCategory);
    }

    function filterCategories(searchTerm) {
        const allCategories = JSON.parse(localStorage.getItem('categories')) || [];
        filteredCategories = allCategories.filter(category => {
            return !searchTerm ||
                category.name.toLowerCase().includes(searchTerm) ||
                category.status.toLowerCase().includes(searchTerm);
        });
        currentPage = 1;
        renderCategories();
        updatePagination();
    }

    function editCategory(id) {
        const allCategories = JSON.parse(localStorage.getItem('categories')) || [];
        const category = allCategories.find(c => c.id === id);
        if (category) {
            currentCategoryId = id;
            modalTitle.textContent = 'Edit Category';
            document.getElementById('categoryId').value = category.id;
            document.getElementById('categoryName').value = category.name;
            document.getElementById('categoryStatus').value = category.status || 'active';
            const modal = new bootstrap.Modal(document.getElementById('categoryModal'));
            modal.show();
        }
    }

    function saveCategory() {
        const name = document.getElementById('categoryName').value.trim();
        const status = document.getElementById('categoryStatus').value;

        if (!name) {
            Utils.showAlert('Please fill in all required fields', 'danger', 'errorAlertCat');
            return;
        }

        let allCategories = JSON.parse(localStorage.getItem('categories')) || [];
        if (currentCategoryId) {
            // Edit existing
            allCategories = allCategories.map(category => {
                if (category.id === currentCategoryId) {
                    return { ...category, name, status };
                }
                return category;
            });
        } else {
            // Add new
            const newId = allCategories.length ? Math.max(...allCategories.map(c => c.id)) + 1 : 1;
            allCategories.push({ id: newId, name, status });
        }
        localStorage.setItem('categories', JSON.stringify(allCategories));
        bootstrap.Modal.getInstance(document.getElementById('categoryModal')).hide();
        loadCategories();
        Utils.showAlert(`Category ${currentCategoryId ? 'updated' : 'added'} successfully!`, 'success', 'errorAlertCat');
        // Dispatch a custom event to notify categories.js to refresh
        document.dispatchEvent(new Event('productSaved'));
    }

    function showDeleteModal(id) {
        deleteCategoryId = id;
        const modal = new bootstrap.Modal(document.getElementById('deleteCategoryModal'));
        modal.show();
    }

    function deleteCategory() {
        let allCategories = JSON.parse(localStorage.getItem('categories')) || [];
        allCategories = allCategories.filter(category => category.id !== deleteCategoryId);
        localStorage.setItem('categories', JSON.stringify(allCategories));
        bootstrap.Modal.getInstance(document.getElementById('deleteCategoryModal')).hide();
        loadCategories();
        Utils.showAlert('Category deleted successfully!', 'success', 'errorAlertCat');
        deleteCategoryId = null;
    }
});


//  Button trigger modal 
// The Add Category button should be placed in your HTML file, not in this JS file.