declare namespace API {
  type Base = Record<string, any>;

  type PagingParams = {
    page?: number;
    page_size?: number;
  };

  type Res<T = any> = {
    code: number;
    data: T;
    msg: string;
  };

  type PagingRes<T = any> = {
    total: number;
    list: T[];
  };

  type UserGenderEnum = 'MALE' | 'FEMALE';

  interface UserInfo {
    id?: string;
    name?: string;
    /** nick */
    nickName?: string;
    /** email */
    email?: string;
    gender?: UserGenderEnum;
  }
}
