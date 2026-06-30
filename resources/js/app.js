import './bootstrap';

const api = window.axios.create({
    baseURL: '/api',
    headers: { Accept: 'application/json' },
});

const emptyVariant = () => ({
    name: '',
    sku: '',
    price: '',
    cost: 0,
    quantity: 0,
    description: '',
    attributeValueIds: [],
});

const state = {
    view: 'products',
    products: [],
    productVariants: [],
    attributeTypes: [],
    attributeValues: [],
    productVariantValues: [],
    productDraftVariants: [emptyVariant()],
    editing: null,
};

const viewMeta = {
    products: { title: 'المنتجات', eyebrow: 'Catalog' },
    variants: { title: 'متغيرات المنتجات', eyebrow: 'Inventory' },
    attributes: { title: 'خصائص المنتجات', eyebrow: 'Attributes' },
};

const els = {
    root: document.querySelector('#viewRoot'),
    metrics: document.querySelector('#metrics'),
    title: document.querySelector('#viewTitle'),
    eyebrow: document.querySelector('#viewEyebrow'),
    message: document.querySelector('#message'),
    status: document.querySelector('#connectionStatus'),
    refresh: document.querySelector('#refreshButton'),
};

function escapeHtml(value = '') {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function money(value) {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(Number(value || 0));
}

function optionList(items, label, selected) {
    return items
        .map((item) => `<option value="${item.id}" ${String(item.id) === String(selected || '') ? 'selected' : ''}>${escapeHtml(label(item))}</option>`)
        .join('');
}

function showMessage(text, type = 'success') {
    els.message.className = `message ${type}`;
    els.message.textContent = text;
    window.setTimeout(() => els.message.classList.add('hidden'), 3200);
}

function setConnection(ok) {
    els.status.textContent = ok ? 'متصل بالـ API' : 'تعذر الاتصال';
    els.status.className = `status-pill ${ok ? 'online' : 'offline'}`;
}

async function loadData() {
    try {
        const [products, variants, types, values, variantValues] = await Promise.all([
            api.get('/products'),
            api.get('/product-variants'),
            api.get('/attribute-types'),
            api.get('/attribute-values'),
            api.get('/product-variant-values'),
        ]);

        state.products = products.data.products || [];
        state.productVariants = variants.data.productVariants || [];
        state.attributeTypes = types.data.attributeTypes || [];
        state.attributeValues = values.data.attributeValues || [];
        state.productVariantValues = variantValues.data.productVariantValues || [];
        setConnection(true);
        render();
    } catch (error) {
        setConnection(false);
        showMessage(error.response?.data?.message || error.response?.data?.error || 'فشل تحميل البيانات من الـ backend.', 'error');
        render();
    }
}

function renderMetrics() {
    const stock = state.productVariants.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    const inventoryValue = state.productVariants.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);

    els.metrics.innerHTML = [
        ['المنتجات', state.products.length, 'عدد المنتجات المسجلة'],
        ['المتغيرات', state.productVariants.length, `${stock} قطعة بالمخزون`],
        ['قيمة المخزون', money(inventoryValue), 'حسب سعر البيع'],
        ['الخصائص', state.attributeValues.length, `${state.attributeTypes.length} أنواع خصائص`],
    ].map(([label, value, hint]) => `
        <article class="metric-card">
            <span>${label}</span>
            <strong>${value}</strong>
            <small>${hint}</small>
        </article>
    `).join('');
}

function renderProducts() {
    const current = state.editing?.type === 'product' ? state.editing.item : {};
    const isEditing = Boolean(current.id);

    els.root.innerHTML = `
        <div class="split-layout product-builder-layout">
            <form class="panel form-panel product-builder" data-form="product">
                <div class="inline-head">
                    <h3>${isEditing ? 'تعديل منتج' : 'إضافة منتج مع المتغيرات'}</h3>
                    ${!isEditing ? '<button class="ghost-button" data-add-product-variant type="button">إضافة متغير</button>' : ''}
                </div>

                <label>اسم المنتج<input name="name" required value="${escapeHtml(current.name || '')}" placeholder="مثال: قميص قطني"></label>
                <label>الوصف<textarea name="description" rows="4" placeholder="وصف مختصر للمنتج">${escapeHtml(current.description || '')}</textarea></label>

                ${isEditing ? '' : renderProductVariantBuilder()}

                <div class="form-actions">
                    <button class="primary-button" type="submit">${isEditing ? 'حفظ التعديل' : 'حفظ المنتج والمتغيرات'}</button>
                    ${isEditing ? '<button class="ghost-button" data-cancel type="button">إلغاء</button>' : ''}
                </div>
            </form>

            <div class="panel list-panel">
                ${state.products.length ? state.products.map(renderProductCard).join('') : emptyState('لا توجد منتجات بعد')}
            </div>
        </div>
    `;
}

function renderProductVariantBuilder() {
    return `
        <section class="builder-section">
            <div>
                <h4>متغيرات المنتج</h4>
                <p>كل متغير يمكن ربطه بأكثر من خاصية، مثل: اللون أحمر + المقاس L.</p>
            </div>

            ${state.productDraftVariants.map((variant, index) => `
                <article class="variant-builder">
                    <div class="variant-builder-head">
                        <strong>متغير ${index + 1}</strong>
                        ${state.productDraftVariants.length > 1 ? `<button data-remove-product-variant="${index}" type="button">حذف المتغير</button>` : ''}
                    </div>

                    <div class="field-grid">
                        <label>اسم المتغير<input data-draft-variant="${index}" data-field="name" required value="${escapeHtml(variant.name)}" placeholder="مثال: أحمر / L"></label>
                        <label>SKU<input data-draft-variant="${index}" data-field="sku" value="${escapeHtml(variant.sku)}" placeholder="SKU-001"></label>
                        <label>سعر البيع<input data-draft-variant="${index}" data-field="price" required type="number" step="0.01" min="0" value="${escapeHtml(variant.price)}"></label>
                        <label>التكلفة<input data-draft-variant="${index}" data-field="cost" type="number" step="0.01" min="0" value="${escapeHtml(variant.cost)}"></label>
                        <label>الكمية<input data-draft-variant="${index}" data-field="quantity" type="number" min="0" value="${escapeHtml(variant.quantity)}"></label>
                    </div>

                    <label>وصف المتغير<textarea data-draft-variant="${index}" data-field="description" rows="3">${escapeHtml(variant.description)}</textarea></label>

                    <div class="attribute-picker">
                        ${state.attributeTypes.length ? state.attributeTypes.map((type) => `
                            <div class="attribute-picker-group">
                                <span>${escapeHtml(type.name)}</span>
                                <div class="chips selectable">
                                    ${valuesForType(type.id).map((value) => `
                                        <label class="choice-chip">
                                            <input type="checkbox" data-draft-variant="${index}" data-attribute-value="${value.id}" ${variant.attributeValueIds.includes(String(value.id)) ? 'checked' : ''}>
                                            <span>${escapeHtml(value.name)}</span>
                                        </label>
                                    `).join('') || '<small>لا توجد قيم لهذا النوع</small>'}
                                </div>
                            </div>
                        `).join('') : emptyState('أضف أنواع وقيم الخصائص أولاً من تبويب الخصائص')}
                    </div>
                </article>
            `).join('')}
        </section>
    `;
}

function renderProductCard(product) {
    const variants = state.productVariants.filter((variant) => Number(variant.product_id) === Number(product.id));

    return `
        <article class="list-item product-card">
            <div>
                <strong>${escapeHtml(product.name)}</strong>
                <p>${escapeHtml(product.description || 'بدون وصف')}</p>
                <small>${variants.length} متغير</small>
                ${variants.length ? `
                    <div class="mini-variant-list">
                        ${variants.map((variant) => `
                            <span>${escapeHtml(variant.name)} ${variantAttributes(variant.id) ? `- ${escapeHtml(variantAttributes(variant.id))}` : ''}</span>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
            <div class="item-actions">
                <button data-edit-product="${product.id}" type="button">تعديل</button>
                <button data-delete-product="${product.id}" type="button">حذف</button>
            </div>
        </article>
    `;
}

function renderVariants() {
    const current = state.editing?.type === 'variant' ? state.editing.item : {};
    const canCreate = state.products.length > 0;

    els.root.innerHTML = `
        <div class="split-layout wide">
            <form class="panel form-panel" data-form="variant">
                <h3>${current.id ? 'تعديل متغير' : 'إضافة متغير'}</h3>
                ${canCreate ? `
                    <label>المنتج<select name="product_id" required>${optionList(state.products, (item) => item.name, current.product_id)}</select></label>
                    <div class="field-grid">
                        <label>اسم المتغير<input name="name" required value="${escapeHtml(current.name || '')}" placeholder="مثال: أحمر / L"></label>
                        <label>SKU<input name="sku" value="${escapeHtml(current.sku || '')}" placeholder="SKU-001"></label>
                        <label>سعر البيع<input name="price" required type="number" step="0.01" min="0" value="${escapeHtml(current.price || '')}"></label>
                        <label>التكلفة<input name="cost" type="number" step="0.01" min="0" value="${escapeHtml(current.cost || 0)}"></label>
                        <label>الكمية<input name="quantity" type="number" min="0" value="${escapeHtml(current.quantity || 0)}"></label>
                    </div>
                    <label>الوصف<textarea name="description" rows="4">${escapeHtml(current.description || '')}</textarea></label>
                    <div class="form-actions">
                        <button class="primary-button" type="submit">${current.id ? 'حفظ التعديل' : 'إضافة المتغير'}</button>
                        ${current.id ? '<button class="ghost-button" data-cancel type="button">إلغاء</button>' : ''}
                    </div>
                ` : emptyState('أضف منتجاً أولاً قبل إنشاء المتغيرات')}
            </form>

            <div class="stack">
                <div class="panel table-panel">
                    ${state.productVariants.length ? `
                        <table>
                            <thead><tr><th>المتغير</th><th>المنتج</th><th>الخصائص</th><th>السعر</th><th>المخزون</th><th></th></tr></thead>
                            <tbody>
                                ${state.productVariants.map((variant) => `
                                    <tr>
                                        <td><strong>${escapeHtml(variant.name)}</strong><small>${escapeHtml(variant.sku || 'بدون SKU')}</small></td>
                                        <td>${escapeHtml(variant.product?.name || productName(variant.product_id))}</td>
                                        <td>${escapeHtml(variantAttributes(variant.id) || 'بدون خصائص')}</td>
                                        <td>${money(variant.price)}</td>
                                        <td>${variant.quantity || 0}</td>
                                        <td class="row-actions">
                                            <button data-edit-variant="${variant.id}" type="button">تعديل</button>
                                            <button data-delete-variant="${variant.id}" type="button">حذف</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    ` : emptyState('لا توجد متغيرات بعد')}
                </div>

                <div class="panel">
                    <div class="inline-head">
                        <h3>ربط الخصائص بالمتغيرات</h3>
                        <small>${state.productVariantValues.length} روابط</small>
                    </div>
                    ${state.productVariants.length && state.attributeValues.length ? `
                        <form class="inline-form" data-form="variantValue">
                            <label>المتغير<select name="product_variant_id" required>${optionList(state.productVariants, (item) => `${item.name} - ${productName(item.product_id)}`)}</select></label>
                            <label>قيمة الخاصية<select name="attribute_value_id" required>${optionList(state.attributeValues, attributeValueLabel)}</select></label>
                            <button class="primary-button" type="submit">ربط</button>
                        </form>
                    ` : emptyState('أضف متغيراً وقيمة خاصية أولاً')}

                    <div class="assignment-list">
                        ${state.productVariantValues.length ? state.productVariantValues.map((item) => `
                            <article class="assignment-item">
                                <span>${escapeHtml(variantName(item.product_variant_id))} / ${escapeHtml(attributeValueLabel(findById(state.attributeValues, item.attribute_value_id) || {}))}</span>
                                <button data-delete-variant-value="${item.id}" type="button">حذف</button>
                            </article>
                        `).join('') : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderAttributes() {
    const currentType = state.editing?.type === 'attributeType' ? state.editing.item : {};
    const currentValue = state.editing?.type === 'attributeValue' ? state.editing.item : {};

    els.root.innerHTML = `
        <div class="split-layout">
            <div class="stack">
                <form class="panel form-panel compact" data-form="attributeType">
                    <h3>${currentType.id ? 'تعديل نوع خاصية' : 'إضافة نوع خاصية'}</h3>
                    <label>اسم النوع<input name="name" required value="${escapeHtml(currentType.name || '')}" placeholder="مثال: اللون"></label>
                    <div class="form-actions">
                        <button class="primary-button" type="submit">${currentType.id ? 'حفظ' : 'إضافة'}</button>
                        ${currentType.id ? '<button class="ghost-button" data-cancel type="button">إلغاء</button>' : ''}
                    </div>
                </form>

                <form class="panel form-panel compact" data-form="attributeValue">
                    <h3>${currentValue.id ? 'تعديل قيمة' : 'إضافة قيمة خاصية'}</h3>
                    ${state.attributeTypes.length ? `
                        <label>النوع<select name="attribute_type_id" required>${optionList(state.attributeTypes, (item) => item.name, currentValue.attribute_type_id)}</select></label>
                        <label>القيمة<input name="name" required value="${escapeHtml(currentValue.name || '')}" placeholder="مثال: أحمر"></label>
                        <div class="form-actions">
                            <button class="primary-button" type="submit">${currentValue.id ? 'حفظ' : 'إضافة'}</button>
                            ${currentValue.id ? '<button class="ghost-button" data-cancel type="button">إلغاء</button>' : ''}
                        </div>
                    ` : emptyState('أضف نوع خاصية أولاً')}
                </form>
            </div>

            <div class="panel list-panel">
                ${state.attributeTypes.length ? state.attributeTypes.map((type) => `
                    <article class="attribute-group">
                        <div class="group-head">
                            <strong>${escapeHtml(type.name)}</strong>
                            <div>
                                <button data-edit-attribute-type="${type.id}" type="button">تعديل</button>
                                <button data-delete-attribute-type="${type.id}" type="button">حذف</button>
                            </div>
                        </div>
                        <div class="chips">
                            ${valuesForType(type.id).map((value) => `
                                <span class="chip">
                                    ${escapeHtml(value.name)}
                                    <button data-edit-attribute-value="${value.id}" type="button">تعديل</button>
                                    <button data-delete-attribute-value="${value.id}" type="button">حذف</button>
                                </span>
                            `).join('') || '<small>لا توجد قيم</small>'}
                        </div>
                    </article>
                `).join('') : emptyState('لا توجد خصائص بعد')}
            </div>
        </div>
    `;
}

function valuesForType(typeId) {
    return state.attributeValues.filter((value) => Number(value.attribute_type_id) === Number(typeId));
}

function productName(id) {
    return findById(state.products, id)?.name || 'غير معروف';
}

function variantName(id) {
    const variant = findById(state.productVariants, id);
    return variant ? `${variant.name} - ${productName(variant.product_id)}` : 'غير معروف';
}

function attributeValueLabel(value) {
    const typeName = value.type?.name || findById(state.attributeTypes, value.attribute_type_id)?.name || 'خاصية';
    return `${typeName}: ${value.name || 'غير معروف'}`;
}

function variantAttributes(variantId) {
    return state.productVariantValues
        .filter((item) => Number(item.product_variant_id) === Number(variantId))
        .map((item) => attributeValueLabel(findById(state.attributeValues, item.attribute_value_id) || {}))
        .join('، ');
}

function findById(collection, id) {
    return collection.find((item) => Number(item.id) === Number(id));
}

function emptyState(text) {
    return `<div class="empty-state">${escapeHtml(text)}</div>`;
}

function render() {
    const meta = viewMeta[state.view];
    els.title.textContent = meta.title;
    els.eyebrow.textContent = meta.eyebrow;
    document.querySelectorAll('.nav-item').forEach((button) => button.classList.toggle('active', button.dataset.view === state.view));
    renderMetrics();

    if (state.view === 'products') renderProducts();
    if (state.view === 'variants') renderVariants();
    if (state.view === 'attributes') renderAttributes();
}

function formData(form) {
    return Object.fromEntries(new FormData(form).entries());
}

function syncDraftInput(target) {
    const index = Number(target.dataset.draftVariant);
    const variant = state.productDraftVariants[index];
    if (!variant) return;

    if (target.dataset.field) {
        variant[target.dataset.field] = target.value;
    }

    if (target.dataset.attributeValue) {
        const valueId = String(target.dataset.attributeValue);
        if (target.checked && !variant.attributeValueIds.includes(valueId)) {
            variant.attributeValueIds.push(valueId);
        }
        if (!target.checked) {
            variant.attributeValueIds = variant.attributeValueIds.filter((id) => id !== valueId);
        }
    }
}

async function createProductWithVariants(data) {
    const productResponse = await api.post('/products', {
        name: data.name,
        description: data.description,
    });

    const product = productResponse.data.product;
    const filledVariants = state.productDraftVariants.filter((variant) => variant.name || variant.sku || variant.price);

    for (const variant of filledVariants) {
        const variantResponse = await api.post('/product-variants', {
            product_id: product.id,
            name: variant.name || `${product.name} variant`,
            description: variant.description,
            price: variant.price || 0,
            cost: variant.cost || 0,
            sku: variant.sku,
            quantity: variant.quantity || 0,
        });

        const productVariant = variantResponse.data.productVariant;
        for (const attributeValueId of variant.attributeValueIds) {
            await api.post('/product-variant-values', {
                product_variant_id: productVariant.id,
                attribute_value_id: attributeValueId,
            });
        }
    }
}

async function handleSubmit(event) {
    const form = event.target.closest('form[data-form]');
    if (!form) return;
    event.preventDefault();

    const type = form.dataset.form;
    const data = formData(form);

    try {
        if (type === 'product') {
            const id = state.editing?.type === 'product' ? state.editing.item.id : null;
            if (id) {
                await api.put(`/products/${id}`, data);
            } else {
                await createProductWithVariants(data);
                state.productDraftVariants = [emptyVariant()];
            }
        }

        if (type === 'variant') {
            const id = state.editing?.type === 'variant' ? state.editing.item.id : null;
            await api[id ? 'put' : 'post'](id ? `/product-variants/${id}` : '/product-variants', data);
        }

        if (type === 'attributeType') {
            const id = state.editing?.type === 'attributeType' ? state.editing.item.id : null;
            await api[id ? 'put' : 'post'](id ? `/attribute-types/${id}` : '/attribute-types', data);
        }

        if (type === 'attributeValue') {
            const id = state.editing?.type === 'attributeValue' ? state.editing.item.id : null;
            await api[id ? 'put' : 'post'](id ? `/attribute-values/${id}` : '/attribute-values', data);
        }

        if (type === 'variantValue') {
            await api.post('/product-variant-values', data);
        }

        state.editing = null;
        await loadData();
        showMessage('تم حفظ البيانات بنجاح.');
    } catch (error) {
        showMessage(error.response?.data?.message || error.response?.data?.error || 'تعذر حفظ البيانات.', 'error');
    }
}

async function handleClick(event) {
    const button = event.target.closest('button');
    if (!button) return;

    if (button.dataset.view) {
        state.view = button.dataset.view;
        state.editing = null;
        render();
        return;
    }

    if (button.dataset.cancel !== undefined) {
        state.editing = null;
        render();
        return;
    }

    if (button.dataset.addProductVariant !== undefined) {
        state.productDraftVariants.push(emptyVariant());
        render();
        return;
    }

    if (button.dataset.removeProductVariant !== undefined) {
        state.productDraftVariants.splice(Number(button.dataset.removeProductVariant), 1);
        render();
        return;
    }

    const editMap = [
        ['editProduct', 'product', state.products],
        ['editVariant', 'variant', state.productVariants],
        ['editAttributeType', 'attributeType', state.attributeTypes],
        ['editAttributeValue', 'attributeValue', state.attributeValues],
    ];

    for (const [key, type, collection] of editMap) {
        if (button.dataset[key]) {
            state.editing = { type, item: collection.find((item) => Number(item.id) === Number(button.dataset[key])) };
            render();
            return;
        }
    }

    const deleteMap = [
        ['deleteProduct', '/products/'],
        ['deleteVariant', '/product-variants/'],
        ['deleteVariantValue', '/product-variant-values/'],
        ['deleteAttributeType', '/attribute-types/'],
        ['deleteAttributeValue', '/attribute-values/'],
    ];

    for (const [key, path] of deleteMap) {
        if (button.dataset[key]) {
            await api.delete(`${path}${button.dataset[key]}`);
            state.editing = null;
            await loadData();
            showMessage('تم الحذف بنجاح.');
            return;
        }
    }
}

document.addEventListener('submit', handleSubmit);
document.addEventListener('click', handleClick);
document.addEventListener('input', (event) => {
    if (event.target.matches('[data-draft-variant]')) {
        syncDraftInput(event.target);
    }
});
document.addEventListener('change', (event) => {
    if (event.target.matches('[data-draft-variant]')) {
        syncDraftInput(event.target);
    }
});
els.refresh.addEventListener('click', loadData);

loadData();
