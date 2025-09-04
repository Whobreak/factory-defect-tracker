import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = '@access_token';
const USER_ROLE_KEY = '@user_role';
const USER_NAME_KEY = '@user_name';
const USER_LINE_KEY = '@user_line';

export async function saveAccessToken(token: string) {
  await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export async function getAccessToken() {
  return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
}

export async function clearAccessToken() {
  await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
}

export async function saveUserRole(role: string) {
  await AsyncStorage.setItem(USER_ROLE_KEY, role);
}

export async function getUserRole() {
  return AsyncStorage.getItem(USER_ROLE_KEY);
}

export async function clearUserRole() {
  await AsyncStorage.removeItem(USER_ROLE_KEY);
}

export async function saveUserName(name: string) {
  await AsyncStorage.setItem(USER_NAME_KEY, name);
}

export async function getUserName() {
  return AsyncStorage.getItem(USER_NAME_KEY);
}

export async function clearUserName() {
  await AsyncStorage.removeItem(USER_NAME_KEY);
}

export async function saveUserLine(line: string) {
  await AsyncStorage.setItem(USER_LINE_KEY, line);
}

export async function getUserLine() {
  return AsyncStorage.getItem(USER_LINE_KEY);
}

export async function clearUserLine() {
  await AsyncStorage.removeItem(USER_LINE_KEY);
}
