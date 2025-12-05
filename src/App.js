
document.body.style.margin = "0";
document.body.style.padding = "0";
document.body.style.fontFamily = "'Poppins', sans-serif";
document.body.style.background = "linear-gradient(135deg, #F6F9FF, #FFEFF2)";
document.body.style.color = "#444";

// ================================================================
// UNIVERSAL CONFIRM MODAL (REPLACES confirm())
// ================================================================
const modalOverlay = document.createElement("div");
modalOverlay.style = `
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(0,0,0,0.45);
    display: none;
    justify-content: center;
    align-items: center;
    z-index: 99999;
`;

const modalBox = document.createElement("div");
modalBox.style = `
    background: white;
    padding: 25px;
    border-radius: 15px;
    width: 360px;
    text-align: center;
    box-shadow: 0 10px 30px rgba(0,0,0,0.15);
`;

const modalText = document.createElement("div");
modalText.style = "font-size: 18px; margin-bottom: 20px; font-weight: 600; color:#222;";

const modalButtons = document.createElement("div");
modalButtons.style = "display: flex; justify-content: center; gap: 12px;";

const modalYes = document.createElement("button");
modalYes.textContent = "Yes";
modalYes.style = `
    padding: 10px 18px;
    background: linear-gradient(180deg,#C62828,#E53935);
    color: white;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-weight:700;
`;

const modalNo = document.createElement("button");
modalNo.textContent = "Cancel";
modalNo.style = `
    padding: 10px 18px;
    background: linear-gradient(180deg,#9e9e9e,#bdbdbd);
    color: white;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-weight:700;
`;

modalButtons.append(modalYes, modalNo);
modalBox.append(modalText, modalButtons);
modalOverlay.append(modalBox);
document.body.append(modalOverlay);

// Promise-based modal
function askConfirm(message) {
    modalText.textContent = message;
    modalOverlay.style.display = "flex";

    return new Promise(resolve => {
        modalYes.onclick = () => { modalOverlay.style.display = "none"; resolve(true); };
        modalNo.onclick = () => { modalOverlay.style.display = "none"; resolve(false); };
    });
}

// ================================================================
// UNIVERSAL TOAST POPUP (REPLACES alert())
// ================================================================
const toast = document.createElement("div");
toast.style = `
    position: fixed;
    bottom: 22px;
    right: 22px;
    background: #B02755;
    color: white;
    padding: 12px 20px;
    border-radius: 12px;
    opacity: 0;
    transition: 0.3s;
    z-index: 999999;
    font-weight:700;
`;
document.body.append(toast);

function showToast(msg) {
    toast.textContent = msg;
    toast.style.opacity = "1";
    setTimeout(() => (toast.style.opacity = "0"), 2000);
}

// ================================================================
// GLOBAL UTILITY STYLE (single <style> for animations & small rules)
// ================================================================
const globalStyleTag = document.createElement("style");
globalStyleTag.textContent = `
/* small global resets for inputs created via JS (keeps consistent across browsers) */
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input { box-sizing: border-box; }
textarea { box-sizing: border-box; }
`;
document.head.appendChild(globalStyleTag);

// ================================================================
// MAIN LAYOUT
// ================================================================
const container = document.createElement("div");
container.style.display = "flex";
container.style.height = "100vh";
container.style.overflow = "hidden";
document.body.appendChild(container);

// ================================================================
// SIDEBAR
// ================================================================
const sidebar = document.createElement("div");
sidebar.style = `
    width: 260px;
    background: rgba(255,235,240,0.9);
    backdrop-filter: blur(8px);
    border-right: 1px solid #FFD6E0;
    padding: 25px 15px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    border-radius: 0 20px 20px 0;
    box-shadow: 4px 0 18px rgba(0,0,0,0.04);
`;
container.appendChild(sidebar);

// Logo
const logo = document.createElement("div");
logo.textContent = "Inventory Management System";
logo.style = `
    font-size: 18px;
    font-weight: 800;
    color: #B02755;
    margin-bottom: 22px;
    text-align: center;
`;
sidebar.appendChild(logo);

// Sidebar Button Builder
function navBtn(label, action) {
    const btn = document.createElement("div");
    btn.textContent = label;
    btn.style = `
        padding: 12px 16px;
        cursor: pointer;
        border-radius: 12px;
        font-weight: 600;
        transition: 0.25s;
        color: #444;
    `;

    btn.onmouseover = () => { btn.style.background = "linear-gradient(90deg,#FFF0F4,#FFF6F8)"; btn.style.color = "#B03060"; btn.style.transform = "translateX(6px)"; };
    btn.onmouseout = () => { btn.style.background = "transparent"; btn.style.color = "#444"; btn.style.transform = "translateX(0)"; };
    btn.onclick = action;
    return btn;
}

// Sidebar Navigation
sidebar.append(
    navBtn("🏠 Dashboard", Dashboard),
    navBtn("📦 Product List", ProductList),
    navBtn("➕ Add Product", AddProduct),
    navBtn("🚚 Supplier List", SupplierList),
    navBtn("➕ Add Supplier", AddSupplier),
    navBtn("📑 Order List", OrderList)
);

// ================================================================
// CONTENT AREA
// ================================================================
const contentWrapper = document.createElement("div");
contentWrapper.style = `
    flex: 1;
    padding: 28px;
    overflow-y: auto;
`;
container.appendChild(contentWrapper);

const app = contentWrapper; // legacy naming in original code

// ================================================================
// API BASE
// ================================================================
const API_BASE_URL = "https://inventory-management-01-1.onrender.com/api"; // keep your original API base

async function apiRequest(endpoint, method = "GET", data = null) {
    const options = { method, headers: { "Content-Type": "application/json" } };
    if (data) options.body = JSON.stringify(data);

    const res = await fetch(API_BASE_URL + endpoint, options);
    if (!res.ok) {
        // attempt to read json error or text
        let txt;
        try { txt = await res.text(); } catch (e) { txt = "Unknown error"; }
        throw new Error(txt || "Request failed");
    }

    return res.status === 204 ? null : res.json();
}

// ================================================================
// ELEMENT BUILDER
// ================================================================
function h(tag, props = {}, ...children) {
    const el = document.createElement(tag);

    Object.entries(props).forEach(([k, v]) => {
        if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.substring(2), v);
        else if (k === "style") el.style.cssText = v;
        else el[k] = v;
    });

    children.forEach(c => el.append(typeof c === "string" ? document.createTextNode(c) : c));
    return el;
}

// ================================================================
// 3D BUTTON CREATOR (re-usable)
// ================================================================
function create3DButton(label, onClick, opts = {}) {
    const { colorStart = "#FFB6C9", colorEnd = "#FFDEE7", textColor = "#8A003A", padding = "12px 22px" } = opts;
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.onclick = onClick;
    btn.style = `
        padding: ${padding};
        font-weight: 800;
        font-size: 15px;
        color: ${textColor};
        background: linear-gradient(135deg, ${colorStart}, ${colorEnd});
        border: none;
        border-radius: 14px;
        cursor: pointer;
        box-shadow: 0 8px 0 rgba(255,200,215,0.9), 0 14px 28px rgba(255,160,190,0.25);
        transition: transform 0.18s ease, box-shadow 0.18s ease;
    `;
    btn.onmouseover = () => {
        btn.style.transform = "translateY(-4px) scale(1.02)";
        btn.style.boxShadow = "0 10px 0 rgba(255,200,215,0.95), 0 18px 36px rgba(255,140,170,0.28)";
    };
    btn.onmouseout = () => {
        btn.style.transform = "translateY(0) scale(1)";
        btn.style.boxShadow = "0 8px 0 rgba(255,200,215,0.9), 0 14px 28px rgba(255,160,190,0.25)";
    };
    btn.onmousedown = () => { btn.style.transform = "translateY(2px) scale(0.98)"; btn.style.boxShadow = "0 4px 0 rgba(255,200,215,0.8)"; };
    btn.onmouseup = () => { btn.style.transform = "translateY(-4px) scale(1.02)"; };

    return btn;
}

// ================================================================
// UNIFIED INPUT CREATOR (3D pastel input style)
// ================================================================
function createInput({ placeholder = "", value = "", type = "text", width = "100%" } = {}) {
    const inp = document.createElement("input");
    inp.type = type;
    inp.value = value;
    inp.placeholder = placeholder;
    inp.style = `
        width: ${width};
        padding: 12px 14px;
        margin-bottom: 12px;
        border-radius: 12px;
        border: 1px solid #FFD6E0;
        font-size: 14px;
        background: linear-gradient(180deg,#FFFDFD,#FFF7FB);
        box-shadow: inset 0 3px 8px rgba(255,230,235,0.9);
        outline: none;
        transition: box-shadow 0.18s ease, border 0.18s ease, transform 0.12s ease;
    `;
    inp.onfocus = (e) => {
        e.target.style.boxShadow = "0 6px 24px rgba(255,150,170,0.12), inset 0 2px 6px rgba(255,220,230,0.9)";
        e.target.style.border = "1px solid #FF98B3";
        e.target.style.transform = "translateY(-1px)";
    };
    inp.onblur = (e) => {
        e.target.style.boxShadow = "inset 0 3px 8px rgba(255,230,235,0.9)";
        e.target.style.border = "1px solid #FFD6E0";
        e.target.style.transform = "translateY(0)";
    };
    return inp;
}

// ================================================================
// CARD CREATOR (keeps original behavior, but uses 3D buttons)
// ================================================================
function createCard(title, items, fields, editFn, deleteFn) {
    const grid = h("div", {
        style: `
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 20px;
        `
    });

    items.forEach(item => {
        const card = h("div", {
            style: `
                background: #FFFFFF;
                border-radius: 18px;
                padding: 18px;
                box-shadow: 0 14px 30px rgba(18,18,18,0.04), inset 0 1px 0 rgba(255,255,255,0.6);
                border: 1px solid #FFE8EF;
                transition: transform 0.18s ease, box-shadow 0.18s ease;
            `
        });
        card.onmouseover = () => { card.style.transform = "translateY(-6px)"; card.style.boxShadow = "0 18px 40px rgba(18,18,18,0.06)"; };
        card.onmouseout = () => { card.style.transform = "translateY(0)"; card.style.boxShadow = "0 14px 30px rgba(18,18,18,0.04)"; };

        // Title field
        card.appendChild(
            h("div", {
                style: "font-size: 18px; font-weight: 800; margin-bottom: 10px; color: #B02755;"
            }, item[fields[0]] || "—")
        );

        // Details
        fields.slice(1).forEach(f => {
            card.appendChild(
                h("div", { style: "margin: 6px 0; font-size: 14px; color:#334;" }, `${f}: ${item[f] || "-"}`)
            );
        });

        // Buttons
        const btnRow = h("div", {
            style: "margin-top: 14px; display: flex; gap: 10px; flex-wrap:wrap;"
        });

        btnRow.appendChild(create3DButton("Edit", () => editFn(item), { colorStart: "#FFF1B6", colorEnd: "#FFD6A5", textColor: "#5B2E00" }));
        btnRow.appendChild(create3DButton("Delete", async () => {
            await deleteFn(item._id);
        }, { colorStart: "#FFB6C9", colorEnd: "#FF8DAA", textColor: "#6a001a" }));

        card.appendChild(btnRow);
        grid.appendChild(card);
    });

    return grid;
}

// ================================================================
// DASHBOARD
// ================================================================
async function Dashboard() {
    app.innerHTML = "";
    app.appendChild(h("h2", { style: "color:#B02755; margin-bottom:10px;" }, "Dashboard Overview"));

    let prodRes = [], suppRes = [], orderRes = [];
    try {
        [prodRes, suppRes, orderRes] = await Promise.all([
            apiRequest("/products").catch(() => ([])),
            apiRequest("/suppliers").catch(() => ([])),
            apiRequest("/orders").catch(() => ([]))
        ]);
    } catch (e) {
        // ignore - we handled individually
    }

    const products = prodRes.products || prodRes || [];
    const suppliers = suppRes.suppliers || suppRes || [];
    const orders = orderRes.orders || orderRes || [];

    const lowStock = (Array.isArray(products) ? products.filter(p => Number(p.stock) < 5).length : 0);

    const card = (title, number) =>
        h("div", {
            style: `
                background: white;
                padding: 20px;
                width: 220px;
                border-radius: 16px;
                box-shadow: 0 10px 26px rgba(18,18,18,0.04);
                border: 1px solid #FFE8EF;
            `
        },
            h("div", { style: "font-size: 13px; font-weight: 700; color:#B02755;" }, title),
            h("div", { style: "font-size: 28px; font-weight: 800; margin-top: 8px;" }, number)
        );

    const grid = h("div", { style: "display:flex; gap:18px; flex-wrap:wrap; margin-top:20px;" });
    grid.append(card("Total Products", products.length || 0), card("Suppliers", suppliers.length || 0), card("Orders", orders.length || 0), card("Low Stock (<5)", lowStock));
    app.appendChild(grid);
}

// ================================================================
// PRODUCT LIST
// ================================================================
async function ProductList() {
    app.innerHTML = "";
    app.appendChild(h("h2", { style: "color:#B02755; margin-bottom:10px;" }, "Product List"));

    let res = [];
    try { res = await apiRequest("/products"); } catch(e) { res = []; showToast("Couldn't fetch products"); }
    const products = res.products || res || [];

    app.appendChild(createCard("Products", products, ["name", "sku", "stock", "price"], EditProduct, DeleteProduct));
}

// ================================================================
// SUPPLIER LIST
// ================================================================
async function SupplierList() {
    app.innerHTML = "";
    app.appendChild(h("h2", { style: "color:#B02755; margin-bottom:10px;" }, "Supplier List"));

    let res = [];
    try { res = await apiRequest("/suppliers"); } catch(e) { res = []; showToast("Couldn't fetch suppliers"); }
    const suppliers = res.suppliers || res || [];

    app.appendChild(createCard("Suppliers", suppliers, ["name", "contact"], EditSupplier, DeleteSupplier));
}
// ================================================================
// ORDER LIST (Supplier ID, Item Name, Qty, Price, Status)
// ================================================================
async function OrderList() {
    app.innerHTML = "";
    app.appendChild(h("h2", { style: "color:#B02755; margin-bottom:10px;" }, "Order List"));

    let res = [];
    try { res = await apiRequest("/orders"); } catch(e) { res = []; showToast("Couldn't fetch orders"); }
    const orders = res.orders || res || [];

    // Transform orders so the card can show readable fields
    const formatted = orders.map(o => {
        const item = o.items && o.items[0] ? o.items[0] : {};
        return {
            _id: o._id,
            supplierId: o.supplierId,
            productId: item.productId,
            qty: item.qty,
            price: item.price,
            status: o.status
        };
    });

    app.appendChild(
        createCard(
            "Orders",
            formatted,
            ["supplierId", "productId", "qty", "price", "status"],
            EditOrder,
            DeleteOrder
        )
    );
}


// ================================================================
// EDIT ORDER (supplierId is NOT editable)
// ================================================================
function EditOrder(order) {
    app.innerHTML = "";
    app.appendChild(h("h2", { style: "color:#B02755; margin-bottom:12px;" }, "Edit Order"));

    const card = h("div", {
        style: `
            background: #FFFFFFCC;
            backdrop-filter: blur(8px);
            padding: 26px;
            width: 720px;
            border-radius: 20px;
            box-shadow: 0 18px 40px rgba(18,18,18,0.04);
            border: 1px solid #FFDDE6;
        `
    });

    const qty = createInput({
        type: "number",
        value: order.qty || "",
        placeholder: "Quantity",
        width: "200px"
    });

    const price = createInput({
        type: "number",
        value: order.price || "",
        placeholder: "Price",
        width: "200px"
    });

    const status = createInput({
        value: order.status || "",
        placeholder: "Status",
        width: "200px"
    });

    const btn = create3DButton("Update Order", async () => {
        try {
            await apiRequest(`/orders/${order._id}`, "PUT", {
                items: [
                    {
                        productId: order.productId,
                        qty: Number(qty.value),
                        price: Number(price.value)
                    }
                ],
                supplierId: order.supplierId,
                status: status.value
            });
            showToast("Order Updated!");
            OrderList();
        } catch (e) {
            showToast("Failed to update order");
            console.error(e);
        }
    });

    card.append(
        h("div", { style: "margin-bottom:10px; font-weight:700;" }, `Supplier ID: ${order.supplierId}`),
        h("div", { style: "margin-bottom:10px; font-weight:700;" }, `Product ID: ${order.productId}`),
        qty,
        price,
        status,
        btn
    );

    app.appendChild(card);
}


// ================================================================
// DELETE ORDER
// ================================================================
async function DeleteOrder(id) {
    const ok = await askConfirm("Delete this order?");
    if (!ok) return;

    try {
        await apiRequest(`/orders/${id}`, "DELETE");
        showToast("Order Deleted!");
        OrderList();
    } catch (e) {
        showToast("Failed to delete order");
        console.error(e);
    }
}


// ================================================================
// ADD PRODUCT (3D Pastel Form Card)
// ================================================================
function AddProduct() {
    app.innerHTML = "";
    app.appendChild(h("h2", { style: "color:#B02755; margin-bottom:12px;" }, "Add Product"));

    const formCard = h("div", {
        style: `
            background: #FFFFFFCC;
            backdrop-filter: blur(8px);
            padding: 26px;
            width: 720px;
            border-radius: 20px;
            box-shadow: 0 18px 40px rgba(18,18,18,0.04), inset 0 1px 0 rgba(255,255,255,0.7);
            border: 1px solid #FFDDE6;
        `
    });

    const row = h("div", { style: "display:flex; gap:12px; align-items:flex-start; flex-wrap:wrap;" });

    const name = createInput({ placeholder: "Product Name", width: "320px" });
    const sku = createInput({ placeholder: "SKU", width: "180px" });
    const stock = createInput({ placeholder: "Stock", type: "number", width: "120px" });
    const price = createInput({ placeholder: "Price", type: "number", width: "120px" });

    const btn = create3DButton("Add Product", async () => {
        try {
            await apiRequest("/products", "POST", {
                name: name.value,
                sku: sku.value,
                stock: Number(stock.value),
                price: Number(price.value)
            });
            showToast("Product Added!");
            ProductList();
        } catch (e) {
            showToast("Failed to add product");
            console.error(e);
        }
    }, { colorStart: "#C8F7C5", colorEnd: "#A8E6A1", textColor: "#053D03" });

    // stack layout
    row.append(name, sku, stock, price);
    formCard.append(row, h("div", { style: "margin-top:10px;" }, btn));
    app.appendChild(formCard);
}

// ================================================================
// EDIT PRODUCT (3D Pastel Form Card)
// ================================================================
function EditProduct(p) {
    app.innerHTML = "";
    app.appendChild(h("h2", { style: "color:#B02755; margin-bottom:12px;" }, "Edit Product"));

    const formCard = h("div", {
        style: `
            background: #FFFFFFCC;
            backdrop-filter: blur(8px);
            padding: 26px;
            width: 720px;
            border-radius: 20px;
            box-shadow: 0 18px 40px rgba(18,18,18,0.04), inset 0 1px 0 rgba(255,255,255,0.7);
            border: 1px solid #FFDDE6;
        `
    });

    const row = h("div", { style: "display:flex; gap:12px; align-items:flex-start; flex-wrap:wrap;" });

    const name = createInput({ value: p.name || "", width: "320px" });
    const sku = createInput({ value: p.sku || "", width: "180px" });
    const stock = createInput({ value: p.stock || 0, type: "number", width: "120px" });
    const price = createInput({ value: p.price || 0, type: "number", width: "120px" });

    const btn = create3DButton("Update Product", async () => {
        try {
            await apiRequest(`/products/${p._id}`, "PUT", {
                name: name.value,
                sku: sku.value,
                stock: Number(stock.value),
                price: Number(price.value)
            });
            showToast("Product Updated!");
            ProductList();
        } catch (e) {
            showToast("Failed to update product");
            console.error(e);
        }
    }, { colorStart: "#FFF1B6", colorEnd: "#FFD6A5", textColor: "#5B2E00" });

    row.append(name, sku, stock, price);
    formCard.append(row, h("div", { style: "margin-top:10px;" }, btn));
    app.appendChild(formCard);
}

// ================================================================
// DELETE PRODUCT
// ================================================================
async function DeleteProduct(id) {
    const ok = await askConfirm("Delete this product?");
    if (!ok) return;
    try {
        await apiRequest(`/products/${id}`, "DELETE");
        showToast("Product Deleted!");
        ProductList();
    } catch (e) {
        showToast("Failed to delete product");
        console.error(e);
    }
}

// ================================================================
// ADD SUPPLIER (3D Pastel Form Card)
// ================================================================
function AddSupplier() {
    app.innerHTML = "";
    app.appendChild(h("h2", { style: "color:#B02755; margin-bottom:12px;" }, "Add Supplier"));

    const card = h("div", {
        style: `
            background: #FFFFFFCC;
            backdrop-filter: blur(8px);
            padding: 28px;
            width: 720px;
            border-radius: 20px;
            box-shadow: 0 18px 40px rgba(18,18,18,0.04), inset 0 1px 0 rgba(255,255,255,0.7);
            border: 1px solid #FFDDE6;
        `
    });

    const formGrid = h("div", { style: "display:flex; gap:12px; flex-wrap:wrap; align-items:flex-start;" });

    const name = createInput({ placeholder: "Supplier Name", width: "320px" });
    const contact = createInput({ placeholder: "Contact", width: "220px" });

    const btn = create3DButton("Submit", async () => {
        try {
            await apiRequest("/suppliers", "POST", {
                name: name.value,
                contact: contact.value,
                });
            showToast("Supplier Added!");
            SupplierList();
        } catch (e) {
            showToast("Failed to add supplier");
            console.error(e);
        }
    }, { colorStart: "#FFB6C9", colorEnd: "#FFDEE7", textColor: "#8A003A" });

    formGrid.append(name, contact);
    card.append(formGrid, h("div", { style: "margin-top:12px;" }, btn));
    app.appendChild(card);
}

// ================================================================
// EDIT SUPPLIER (3D Pastel Form Card)
// ================================================================
function EditSupplier(s) {
    app.innerHTML = "";
    app.appendChild(h("h2", { style: "color:#B02755; margin-bottom:12px;" }, "Edit Supplier"));

    const card = h("div", {
        style: `
            background: #FFFFFFCC;
            backdrop-filter: blur(8px);
            padding: 28px;
            width: 720px;
            border-radius: 20px;
            box-shadow: 0 18px 40px rgba(18,18,18,0.04), inset 0 1px 0 rgba(255,255,255,0.7);
            border: 1px solid #FFDDE6;
        `
    });

    const formGrid = h("div", { style: "display:flex; gap:12px; flex-wrap:wrap; align-items:flex-start;" });

    const name = createInput({ value: s.name || "", width: "320px" });
    const contact = createInput({ value: s.contact || "", width: "220px" });
    const email = createInput({ value: s.email || "", width: "320px" });

    const btn = create3DButton("Update", async () => {
        try {
            await apiRequest(`/suppliers/${s._id}`, "PUT", {
                name: name.value,
                contact: contact.value,
                email: email.value
            });
            showToast("Supplier Updated!");
            SupplierList();
        } catch (e) {
            showToast("Failed to update supplier");
            console.error(e);
        }
    }, { colorStart: "#FFF1B6", colorEnd: "#FFD6A5", textColor: "#5B2E00" });

    formGrid.append(name, contact, email);
    card.append(formGrid, h("div", { style: "margin-top:12px;" }, btn));
    app.appendChild(card);
}

// ================================================================
// DELETE SUPPLIER
// ================================================================
async function DeleteSupplier(id) {
    const ok = await askConfirm("Delete this supplier?");
    if (!ok) return;
    try {
        await apiRequest(`/suppliers/${id}`, "DELETE");
        showToast("Supplier Deleted!");
        SupplierList();
    } catch (e) {
        showToast("Failed to delete supplier");
        console.error(e);
    }
}

// ================================================================
// START APP
// ================================================================
Dashboard();
