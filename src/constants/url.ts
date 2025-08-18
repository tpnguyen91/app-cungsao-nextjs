export const URL_GIA_DINH = '/gia-dinh';
export const URL_THANH_VIEN = '/thanh-vien';
export const URL_AUTH = '/auth';
export const URL_AUTH_SIGN_IN = '/auth/signin';
export const URL_404 = '/404';
export const URL_403 = '/403';
export const URL_GIA_DINH_DETAIL = (giadinhId: string) =>
  `/gia-dinh/${giadinhId}/thanh-vien`;
