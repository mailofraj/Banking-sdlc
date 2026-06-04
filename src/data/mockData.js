export const USERS = [
  {
    id: "u1",
    username: "admin",
    password: "admin",
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 012-3456",
    memberSince: "January 2019",
    avatarInitials: "JD",
  },
  {
    id: "u2",
    username: "jane.smith",
    password: "password456",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "+1 (555) 987-6543",
    memberSince: "March 2021",
    avatarInitials: "JS",
  },
];

export const ACCOUNTS = {
  u1: [
    {
      id: "acc-001",
      type: "Checking",
      number: "****4521",
      fullNumber: "1234 5678 9012 4521",
      balance: 12450.75,
      availableBalance: 12200.75,
      currency: "USD",
      status: "Active",
      openedDate: "Jan 15, 2019",
      interestRate: "0.01%",
      color: "#4F46E5",
    },
    {
      id: "acc-002",
      type: "Savings",
      number: "****7893",
      fullNumber: "1234 5678 9012 7893",
      balance: 45200.0,
      availableBalance: 45200.0,
      currency: "USD",
      status: "Active",
      openedDate: "Jan 15, 2019",
      interestRate: "4.50%",
      color: "#059669",
    },
  ],
  u2: [
    {
      id: "acc-003",
      type: "Checking",
      number: "****2210",
      fullNumber: "9876 5432 1098 2210",
      balance: 8320.5,
      availableBalance: 8100.5,
      currency: "USD",
      status: "Active",
      openedDate: "Mar 10, 2021",
      interestRate: "0.01%",
      color: "#4F46E5",
    },
    {
      id: "acc-004",
      type: "Savings",
      number: "****6647",
      fullNumber: "9876 5432 1098 6647",
      balance: 22100.0,
      availableBalance: 22100.0,
      currency: "USD",
      status: "Active",
      openedDate: "Mar 10, 2021",
      interestRate: "4.50%",
      color: "#059669",
    },
  ],
};

export function authenticate(username, password) {
  const user = USERS.find(
    (u) => u.username === username && u.password === password
  );
  return user || null;
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}
