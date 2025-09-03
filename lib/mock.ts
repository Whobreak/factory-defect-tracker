// Kullanıcı Tipi
export type User = {
  id: number;
  username: string;
  role: "user" | "admin";
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
  { id: 1, username: "Harika", role: "admin", line: "A1", password: "1234" },
  { id: 2, username: "Ayşe", role: "user", line: "B2", password: "1234" },
  { id: 3, username: "Admin", role: "admin", line: "", password: "admin123" },
];

// 🔹 Mock Hata Kodları
export let mockErrorCodes: ErrorCode[] = [
  { id: 1, code: "E101", description: "Yüzey Çizik" },
  { id: 2, code: "E205", description: "Lehim Hatası" },
  { id: 3, code: "E309", description: "Montaj Eksik" },
  { id: 4, code: "E102", description: "Nakliye Hasarı" },
  { id: 5, code: "E201", description: "Elektrik aksan hatası" },
  { id: 6, code: "E303", description: "Elektronik aksan hatası" },
  { id: 7, code: "E106", description: "Sol arka ayak kırık" },
  { id: 8, code: "E206", description: "Sağ arka ayak kırık" },
  { id: 9, code: "E306", description: "Sol ön ayak kırık" },
  { id: 10, code: "E107", description: "Sağ ön ayak kırık" },
  { id: 11, code: "E207", description: "Üst menteşe kırık" },
  { id: 12, code: "E307", description: "Alt menteşe kırık" },
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
export function addUser(username: string, line: string, password: string) {
  const newUser: User = {
    id: mockUsers.length + 1,
    username,
    role: "user",
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
