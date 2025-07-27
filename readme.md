# 🔐 permitTo – Role and Membership-Based Access Middleware

A flexible, string-based authorization middleware for Node.js/Express apps. Easily define access control using simple, readable expressions combining `role` and `membership`.

---

## ✨ Features

- Allow or deny access using compact permission strings.
- Supports nested conditions like role-based and membership-specific logic.
- Easy to plug into existing Express routes as middleware.
- Inspired by a simple DSL-style matching pattern.

---

## 📆 Installation

Just copy `permitTo` function into your middleware file:

```js
const { permitTo } = require("./permitTo");
```

Make sure you also have `AppError` and `messages.userRestricted` configured to match your project’s error handling.

---

## 🧐 Syntax – Permission String Format

Each permission is defined in the form:

```txt
role(membership)
```

You can combine multiple permissions with commas:

```txt
"admin,staff(employee),!user(basic),distributors(!basic)"
```

### ✅ Allow
- `admin`: allow all users with role `admin`
- `staff(employee)`: allow only staff with `employee` membership
- `distributors(!basic)`: allow distributors except `basic` ones

### ❌ Deny
- `!user(basic)`: deny users with basic membership
- `!user`: deny all users
- `!(...)`: deny a condition globally

---

## 🚀 Usage

```js
app.get(
  "/dashboard",
  permitTo("admin", "staff(employee)", "!user(basic)"),
  (req, res) => {
    res.send("Welcome to dashboard!");
  }
);
```

---

## 🧙 Internal Logic (Simplified)

- It uses dynamic regex to match permissions from the user `role` and `membership`.
- Rules are recursively evaluated.
- Negation (`!`) is used to define restrictions.
- If no permissions are passed, access is granted by default.

---

## 🔍 Example Requests

```js
req.user = { role: "user", membership: "basic" };
permitTo("!user(basic)"); // ❌ Denied

req.user = { role: "distributors", membership: "pro" };
permitTo("distributors(!basic)"); // ✅ Allowed

req.user = { role: "staff", membership: "employee" };
permitTo("staff(employee),!user"); // ✅ Allowed

req.user = { role: "user", membership: "premium" };
permitTo("user(premium),!user(basic)"); // ✅ Allowed
```

---

## ⚠️ Notes

- If no matching logic is defined for `role` or `membership`, access is allowed.
- Invalid string formats won’t throw but might silently allow/deny—validate your patterns.
- The logic is customizable and extensible.

---

## 📁 File Structure Assumptions

Ensure the following exists:

```js
// ./appError.js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}
module.exports = AppError;
```

```js
// ./messages.js
module.exports = {
  userRestricted: "You are not allowed to access this resource.",
};
```

---

## 🛠️ To-Do / Improvements

- [ ] Convert permit string into parsed object structure
- [ ] Add test cases with Jest or Mocha
- [ ] Add TypeScript definitions (optional)
- [ ] Allow dynamic field matching beyond role & membership (e.g., plan, team)

---

## 📃 License

MIT

---

## 🙌 Author

Crafted with logic and recursion by Shakib Ali @hamamagraphics – feel free to star ⭐ or fork 🍜 the repo!

