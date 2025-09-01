// Kullanıcı Tipi
export type User = {
  id: number;
  name: string;
  role: "worker" | "admin";
  line: string;
  password: string;
};

// Hata Kodu Tipi
export type ErrorCode = {
  id: number;
  code: string;
  description: string;
};

// Rapor Tipi
export type Report = {
  id: number;
  barcode: string;
  productType: string;
  lineNumber: string;
  errorCode: ErrorCode;
  note?: string;
  photos: string[];
  createdAt: string;
  userId?: number; // opsiyonel, admin için
};

// 🔹 Mock Kullanıcılar
export let mockUsers: User[] = [
  { id: 1, name: "Harika", role: "worker", line: "A1", password: "1234" },
  { id: 2, name: "Ayşe", role: "worker", line: "B2", password: "1234" },
  { id: 3, name: "Admin", role: "admin", line: "", password: "admin123" },
];

// 🔹 Mock Hata Kodları
export let mockErrorCodes: ErrorCode[] = [
  { id: 1, code: "E101", description: "Yüzey Çizik" },
  { id: 2, code: "E205", description: "Lehim Hatası" },
  { id: 3, code: "E309", description: "Montaj Eksik" },
];

// 🔹 Mock Raporlar
export let mockReports: Report[] = [
  {
    id: 1,
    barcode: "1234567890",
    productType: "Motor Parçası",
    lineNumber: "Bant 1",
    errorCode: mockErrorCodes[0],
    note: "Ürün üzerinde çizik var.",
    photos: ["https://placekitten.com/200/200", "https://placekitten.com/201/200"],
    createdAt: "2025-08-27T14:00:00Z",
    userId: 1,
  },
  {
    id: 2,
    barcode: "0987654321",
    productType: "Elektronik Kart",
    lineNumber: "Bant 3",
    errorCode: mockErrorCodes[1],
    note: "Birkaç bacak yanlış lehimlenmiş.",
    photos: ["https://placekitten.com/202/200"],
    createdAt: "2025-08-27T15:30:00Z",
    userId: 2,
  },
];

// 🔹 Giriş yapan kullanıcı 
export let currentUser: User = mockUsers[0];
export function setCurrentUser(userId: number) {
  const user = mockUsers.find((u) => u.id === userId);
  if (user) currentUser = user;
}

// 🔹 Kullanıcı işlemleri (Admin için)
export function addUser(name: string, line: string, password: string) {
  const newUser: User = {
    id: mockUsers.length + 1,
    name,
    role: "worker",
    line,
    password,
  };
  mockUsers.push(newUser);
}

export function updateLine(userId: number, newLine: string) {
  mockUsers = mockUsers.map((u) => (u.id === userId ? { ...u, line: newLine } : u));
}

export function updatePassword(userId: number, newPassword: string) {
  mockUsers = mockUsers.map((u) => (u.id === userId ? { ...u, password: newPassword } : u));
}

// 🔹 Hata Kodu işlemleri (Admin için)
export function addErrorCode(code: string, description: string) {
  const newCode: ErrorCode = {
    id: mockErrorCodes.length + 1,
    code,
    description,
  };
  mockErrorCodes.push(newCode);
}

// 🔹 Rapor işlemleri
export function addReport(report: Report) {
  report.id = mockReports.length + 1;
  mockReports.push(report);
}

export function getReportsByUser(userId: number) {
  return mockReports.filter((r) => r.userId === userId);
}

export function getAllReports() {
  return mockReports;
}
