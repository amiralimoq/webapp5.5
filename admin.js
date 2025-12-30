"use strict";

const supabaseUrl = "https://ducmehygksmijtynfuzt.supabase.co";
const supabaseKey =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1Y21laHlna3NtaWp0eW5mdXp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NTgyNTQsImV4cCI6MjA4MTIzNDI1NH0.Zo0RTm5fPn-sA6AkqSIPCCiehn8iW2Ou4I26HnC2CfU";
const dbClient = supabase.createClient(supabaseUrl, supabaseKey);

const sidebarLinks = document.querySelectorAll(".sidebar-list-item a");
const contentSections = document.querySelectorAll(".main-content");
const dateOverviewTitle = document.getElementById("date-overview-title");
const logoutBtn = document.getElementById("logout-btn");

const showSection = (targetId) => {
	contentSections.forEach((section) => {
		section.id === targetId
			? section.classList.remove("hidden")
			: section.classList.add("hidden");
	});
};

const updateDateRange = () => {
	const now = new Date();
	const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
	const options = { day: "numeric", month: "long" };
	const firstDayFormatted = firstDay.toLocaleDateString("en-US", options);
	const todayFormatted = now.toLocaleDateString("en-US", options);
	if (dateOverviewTitle)
		dateOverviewTitle.textContent = `${firstDayFormatted} - ${todayFormatted}`;
};

sidebarLinks.forEach((link) => {
	link.addEventListener("click", (e) => {
		e.preventDefault();
		const targetId = link.dataset.target;
		if (targetId) showSection(targetId);
	});
});

if (logoutBtn) {
	logoutBtn.addEventListener("click", () => {
		localStorage.removeItem("user");
		// مسیر اصلاح شده
		location.href = "login.html";
	});
}

window.addEventListener("load", () => {
	const user = JSON.parse(localStorage.getItem("user"));
	if (!user) {
		// مسیر اصلاح شده
		location.href = "login.html";
		return;
	}
	document.getElementById("user-name").innerHTML = user.name;
	showSection("dashboard-section");
	updateDateRange();
	loadDashboardData();
	setupEventListeners();
});

const loadDashboardData = async () => {
	showAllCustomer();
	getSells();
	getDiscounts();
	getUsers();
};

async function showAllCustomer() {
	let { data: customers } = await dbClient.from("customers").select("*");
	const customerTableBody = document.getElementById("customer-table-body");
	const totalCustomersSpan = document.getElementById("total-customers");
	if (customerTableBody) customerTableBody.innerHTML = "";
	customers.forEach((customer) => {
		if (customerTableBody)
			customerTableBody.innerHTML += `<tr><td>${customer.name}</td><td>${customer.phone}</td><td>${customer.point}</td><td><button class="btn" onclick="deleteCustomer(${customer.id})">Delete</button></td></tr>`;
	});
	if (totalCustomersSpan) totalCustomersSpan.textContent = customers.length;
}

async function deleteCustomer(id) {
	await dbClient.from("customers").delete().eq("id", id);
	showAllCustomer();
}

async function getDiscounts() {
	let { data: discounts } = await dbClient.from("discounts").select("*");
	const discountTableBody = document.getElementById("discount-table-body");
	const totalDiscountsSpan = document.getElementById("total-discounts");
	if (discountTableBody) discountTableBody.innerHTML = "";
	discounts.forEach((discount) => {
		if (discountTableBody)
			discountTableBody.innerHTML += `<tr><td>${discount.code}</td><td>${discount.percent}%</td><td><button class="btn" onclick="deleteDiscount(${discount.id})">Delete</button></td></tr>`;
	});
	if (totalDiscountsSpan) totalDiscountsSpan.textContent = discounts.length;
}

async function addDiscount() {
	const codeInput = document.getElementById("discount-code-input");
	const percentInput = document.getElementById("discount-percent-input");
	await dbClient
		.from("discounts")
		.insert([{ code: codeInput.value, percent: percentInput.value }]);
	codeInput.value = "";
	percentInput.value = "";
	getDiscounts();
}

async function deleteDiscount(id) {
	await dbClient.from("discounts").delete().eq("id", id);
	getDiscounts();
}

async function getSells() {
	let { data: sells } = await dbClient.from("sells").select("*");
	const sellsTableBody = document.getElementById("sells-table-body");
	const totalSellsSpan = document.getElementById("total-sells");
	if (sellsTableBody) sellsTableBody.innerHTML = "";
	sells.forEach((sell) => {
		if (sellsTableBody)
			sellsTableBody.innerHTML += `<tr><td>${
				sell.user_phone
			}</td><td>${sell.product_name}</td><td>$${
				sell.product_price
			}</td><td>${new Date(
				sell.created_at
			).toLocaleDateString()}</td></tr>`;
	});
	if (totalSellsSpan) totalSellsSpan.textContent = sells.length;
}

async function getUsers() {
	let { data: users } = await dbClient.from("users").select("*");
	const userTableBody = document.getElementById("user-table-body");
	const totalUsersSpan = document.getElementById("total-users");
	if (userTableBody) userTableBody.innerHTML = "";
	users.forEach((user) => {
		if (userTableBody)
			userTableBody.innerHTML += `<tr><td>${user.name}</td><td>${user.username}</td><td><button class="btn" onclick="deleteUser(${user.id})">Delete</button></td></tr>`;
	});
	if (totalUsersSpan) totalUsersSpan.textContent = users.length;
}

async function addNewUser() {
	const nameInput = document.getElementById("user-name-input");
	const usernameInput = document.getElementById("user-username-input");
	const passwordInput = document.getElementById("user-password-input");
	await dbClient.from("users").insert([
		{
			name: nameInput.value,
			username: usernameInput.value,
			password: passwordInput.value,
		},
	]);
	nameInput.value = "";
	usernameInput.value = "";
	passwordInput.value = "";
	getUsers();
}

async function deleteUser(id) {
	await dbClient.from("users").delete().eq("id", id);
	getUsers();
}

async function changeColor() {
	const colorPicker = document.getElementById("color-picker");
	await dbClient.from("temp").update({ color: colorPicker.value }).eq("id", 1);
	alert("Color Changed Successfully!");
}

function setupEventListeners() {
	const addDiscountBtn = document.getElementById("add-discount-btn");
	if (addDiscountBtn) addDiscountBtn.addEventListener("click", addDiscount);
	const addUserBtn = document.getElementById("add-user-btn");
	if (addUserBtn) addUserBtn.addEventListener("click", addNewUser);
	const changeColorBtn = document.getElementById("change-color-btn");
	if (changeColorBtn) changeColorBtn.addEventListener("click", changeColor);
}
