import { Cache } from 'cache-manager';

export interface ExtendedCache extends Cache {
    increment(key: string, value?: number): Promise<number>;
    // 필요한 경우 다른 메소드도 여기에 추가할 수 있습니다.
}
