export const URL_GIA_DINH = '/gia-dinh';
export const URL_THANH_VIEN = '/thanh-vien';
export const URL_AUTH = '/auth';
export const URL_AUTH_SIGN_IN = '/auth/signin';
export const URL_404 = '/404';
export const URL_403 = '/403';

// Household routes
export const URL_GIA_DINH_DETAIL = (id: string) => `/gia-dinh/${id}`;
export const URL_GIA_DINH_THANH_VIEN = (id: string) =>
  `/gia-dinh/${id}/thanh-vien`;
