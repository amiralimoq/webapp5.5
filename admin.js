"use strict";

const supabaseUrl = "https://ducmehygksmijtynfuzt.supabase.co";
const supabaseKey =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1Y21laHlna3NtaWp0eW5mdXp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NTgyNTQsImV4cCI6MjA4MTIzNDI1NH0.Zo0RTm5fPn-sA6AkqSIPCCiehn8iW2Ou4I26HnC2CfU";
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// DOM Elements
const sidebarLinks = document.querySelectorAll(".sidebar-list-item a");
const contentSections = document.querySelectorAll(".main-content");
const dateOverviewTitle = document.getElementById("date-overview-title");
const logoutBtn = document.getElementById("logout-btn");

// Helper function to switch between content sections
const showSection = (targetId) => {
	contentSections.forEach((section) => {
		if (section.id === targetId) {
			section.classList.remove("hidden");
		} else {
			section.classList.add("hidden");
		}
	});
};

// Function to update the dashboard date range
const updateDateRange = () => {
	const now = new Date();
	const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
	const options = { day: "numeric", month: "long" };

	const firstDayFormatted = firstDay.toLocaleDateString("en-US", options);
	const todayFormatted = now.toLocaleDateString("en-US", options);

	if (dateOverviewTitle) {
		dateOverviewTitle.textContent = `${firstDayFormatted} - ${todayFormatted}`;
	}
};

// --- Event Listeners ---

// Sidebar navigation
sidebarLinks.forEach((link) => {
	link.addEventListener("click", (e) => {
		// Stop link from navigating
		e.preventDefault();

		const targetId = link.dataset.target;
		if (targetId) {
			showSection(targetId);
		}
	});
});

// Logout button
if (logoutBtn) {
	logoutBtn.addEventListener("click", () => {
		localStorage.removeItem("user");
		location.href = "login-1.html";
	});
}

// Check for logged-in user on page load
window.addEventListener("load", () => {
	const user = JSON.parse(localStorage.getItem("user"));
	if (!user) {
		location.href = "login-1.html";
		return;
	}

	// Set user name in header
	document.getElementById("user-name").innerHTML = user.name;

	// Initial setup
	showSection("dashboard-section"); // Show dashboard by default
	updateDateRange();
	loadDashboardData();
    setupEventListeners();
});


// Function to load all necessary data for the dashboard
const loadDashboardData = async () => {
    // These functions will be defined below
    showAllCustomer();
    getSells();
    getDiscounts();
    getUsers();
};


// --- Functions ported from admin.js (Royam 1.0) ---

// Customers
async function showAllCustomer() {
	let { data: customers, error } = await supabase.from("customers").select("*");
	const customerTableBody = document.getElementById("customer-table-body");
    const totalCustomersSpan = document.getElementById('total-customers');

	if (customerTableBody) customerTableBody.innerHTML = "";

	customers.forEach((customer) => {
		if (customerTableBody) {
			customerTableBody.innerHTML += `
                <tr>
                    <td>${customer.name}</td>
                    <td>${customer.phone}</td>
                    <td>${customer.point}</td>
                    <td><button class="btn" onclick="deleteCustomer(${customer.id})">Delete</button></td>
                </tr>
            `;
		}
	});

    if(totalCustomersSpan) totalCustomersSpan.textContent = customers.length;
}

async function deleteCustomer(id) {
	await supabase.from("customers").delete().eq("id", id);
	showAllCustomer();
}

// Discounts
async function getDiscounts() {
	let { data: discounts, error } = await supabase.from("discounts").select("*");
    const discountTableBody = document.getElementById('discount-table-body');
    const totalDiscountsSpan = document.getElementById('total-discounts');

	if(discountTableBody) discountTableBody.innerHTML = "";

	discounts.forEach((discount) => {
		if(discountTableBody){
            discountTableBody.innerHTML += `
            <tr>
                <td>${discount.code}</td>
                <td>${discount.percent}%</td>
                <td><button class="btn" onclick="deleteDiscount(${discount.id})">Delete</button></td>
            </tr>
            `;
        }
	});

    if(totalDiscountsSpan) totalDiscountsSpan.textContent = discounts.length;
}

async function addDiscount() {
    const codeInput = document.getElementById('discount-code-input');
    const percentInput = document.getElementById('discount-percent-input');

	await supabase.from("discounts").insert([{ code: codeInput.value, percent: percentInput.value }]);
    
    codeInput.value = '';
    percentInput.value = '';
	getDiscounts();
}

async function deleteDiscount(id) {
	await supabase.from("discounts").delete().eq("id", id);
	getDiscounts();
}

// Sells
async function getSells() {
	let { data: sells, error } = await supabase.from("sells").select("*");
    const sellsTableBody = document.getElementById('sells-table-body');
    const totalSellsSpan = document.getElementById('total-sells');

	if(sellsTableBody) sellsTableBody.innerHTML = "";

	sells.forEach((sell) => {
		if(sellsTableBody){
            sellsTableBody.innerHTML += `
            <tr>
                <td>${sell.user_phone}</td>
                <td>${sell.product_name}</td>
                <td>$${sell.product_price}</td>
                <td>${new Date(sell.created_at).toLocaleDateString()}</td>
            </tr>
            `;
        }
	});

    if(totalSellsSpan) totalSellsSpan.textContent = sells.length;
}

// Users
async function getUsers() {
	let { data: users, error } = await supabase.from("users").select("*");
    const userTableBody = document.getElementById('user-table-body');
    const totalUsersSpan = document.getElementById('total-users');

	if(userTableBody) userTableBody.innerHTML = "";

	users.forEach((user) => {
		if(userTableBody){
            userTableBody.innerHTML += `
            <tr>
                <td>${user.name}</td>
                <td>${user.username}</td>
                <td><button class="btn" onclick="deleteUser(${user.id})">Delete</button></td>
            </tr>
            `;
        }
	});

    if(totalUsersSpan) totalUsersSpan.textContent = users.length;
}

async function addNewUser() {
    const nameInput = document.getElementById('user-name-input');
    const usernameInput = document.getElementById('user-username-input');
    const passwordInput = document.getElementById('user-password-input');

	await supabase.from("users").insert([{ name: nameInput.value, username: usernameInput.value, password: passwordInput.value }]);
	
    nameInput.value = '';
    usernameInput.value = '';
    passwordInput.value = '';

    getUsers();
}

async function deleteUser(id) {
	await supabase.from("users").delete().eq("id", id);
	getUsers();
}

// Template/Theme
async function changeColor() {
	const colorPicker = document.getElementById("color-picker");
	await supabase.from("temp").update({ color: colorPicker.value }).eq("id", 1);
	alert("Color Changed Successfully!");
}

// This function sets up all the other event listeners for buttons inside the sections
function setupEventListeners() {
    const addDiscountBtn = document.getElementById('add-discount-btn');
    if(addDiscountBtn) addDiscountBtn.addEventListener('click', addDiscount);

    const addUserBtn = document.getElementById('add-user-btn');
    if(addUserBtn) addUserBtn.addEventListener('click', addNewUser);

    const changeColorBtn = document.getElementById('change-color-btn');
    if(changeColorBtn) changeColorBtn.addEventListener('click', changeColor);
}
