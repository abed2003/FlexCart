<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>لوحة المتجر</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body>
    <main id="app" class="app-shell">
        <aside class="sidebar">
            <div class="brand-block">
                <span class="brand-mark"></span>
                <div>
                    <strong>StoreFlow</strong>
                    <small>لوحة إدارة المتجر</small>
                </div>
            </div>

            <nav class="nav-stack" aria-label="Main navigation">
                <button class="nav-item active" data-view="products" type="button">
                    <span class="nav-icon nav-products"></span>
                    المنتجات
                </button>
                <button class="nav-item" data-view="variants" type="button">
                    <span class="nav-icon nav-variants"></span>
                    المتغيرات
                </button>
                <button class="nav-item" data-view="attributes" type="button">
                    <span class="nav-icon nav-attributes"></span>
                    الخصائص
                </button>
            </nav>

            <div class="sidebar-note">
                <span></span>
                <p>ابنِ المنتج ومتغيراته وخصائصه من نفس لوحة التحكم.</p>
            </div>
        </aside>

        <section class="main-panel">
            <section class="topbar">
                <div>
                    <p class="eyebrow">E-Commerce Admin</p>
                    <h1>لوحة إدارة المنتجات</h1>
                    <p class="subhead">إدارة المنتجات، المتغيرات، والخصائص من واجهة واحدة متصلة بالـ backend.</p>
                </div>
                <div class="topbar-actions">
                    <div class="status-pill" id="connectionStatus">جاري الاتصال...</div>
                    <button class="ghost-button refresh-top" id="refreshButton" type="button">تحديث</button>
                </div>
            </section>

            <section class="metrics-grid" id="metrics"></section>

            <section class="content-area">
                <div class="section-head">
                    <div>
                        <p class="eyebrow" id="viewEyebrow">Catalog</p>
                        <h2 id="viewTitle">المنتجات</h2>
                    </div>
                </div>

                <div class="message hidden" id="message"></div>
                <div id="viewRoot"></div>
            </section>
        </section>
    </main>
</body>
</html>
