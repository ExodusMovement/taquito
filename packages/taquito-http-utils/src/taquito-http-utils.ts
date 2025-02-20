/**
 * @packageDocumentation
 * @module @exodus/taquito-http-utils
 */

import { STATUS_CODE } from './status_code';
// @ts-ignore
import { fetch } from '@exodus/fetch';

export * from './status_code';
export { VERSION } from './version';

type ObjectType = Record<string, any>;

export interface HttpRequestOptions {
  url: string;
  method?: 'GET' | 'POST';
  timeout?: number;
  json?: boolean;
  query?: ObjectType;
  headers?: { [key: string]: string };
  mimeType?: string;
}

/**
 *  @category Error
 *  @description This error will be thrown when the endpoint returns an HTTP error to the client
 */
export class HttpResponseError extends Error {
  public name = 'HttpResponse';

  constructor(
    public message: string,
    public status: STATUS_CODE,
    public statusText: string,
    public body: string,
    public url: string
  ) {
    super(message);
  }
}

/**
 *  @category Error
 *  @description Error that indicates a general failure in making the HTTP request
 */
export class HttpRequestFailed extends Error {
  public name = 'HttpRequestFailed';

  constructor(public message: string) {
    super(message);
  }
}

export class HttpBackend {
  constructor(private timeout: number = 30000) {}

  protected serialize(obj?: ObjectType) {
    if (!obj) {
      return '';
    }

    const str = [];
    for (const p in obj) {
      // eslint-disable-next-line no-prototype-builtins
      if (Object.prototype.hasOwnProperty.call(obj, p) && typeof obj[p] !== 'undefined') {
        const prop = typeof obj[p].toJSON === 'function' ? obj[p].toJSON() : obj[p];
        // query arguments can have no value so we need some way of handling that
        // example https://domain.com/query?all
        if (prop === null) {
          str.push(encodeURIComponent(p));
          continue;
        }
        // another use case is multiple arguments with the same name
        // they are passed as array
        if (Array.isArray(prop)) {
          prop.forEach((item) => {
            str.push(encodeURIComponent(p) + '=' + encodeURIComponent(item));
          });
          continue;
        }
        str.push(encodeURIComponent(p) + '=' + encodeURIComponent(prop));
      }
    }
    const serialized = str.join('&');
    if (serialized) {
      return `?${serialized}`;
    } else {
      return '';
    }
  }

  /**
   *
   * @param options contains options to be passed for the HTTP request (url, method and timeout)
   */
  async createRequest<T>(
    { url, method, query, headers = {}, json = true }: HttpRequestOptions,
    data?: object | string
  ): Promise<T> {

    if (!headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    try {
      const res = await fetch(url + this.serialize(query), {
        method: method ?? 'GET',
        headers: headers,
        // timeout: timeout,
        body: headers['Content-Type'] === 'application/json' ? JSON.stringify(data) : data,
      });

      if (!res.ok) {
        throw new HttpResponseError(
          `Http error while loading ${url + this.serialize(query)}: ${res.status}`,
          res.status,
          '',
          '',
          url + this.serialize(query)
        )
      }

      if (json) {
        const jsonResponse: T = await res.json()
        return jsonResponse
      } else {
        return await res.text()
      }
    } catch (err: any) {
      throw new HttpRequestFailed(`${method} ${url + this.serialize(query)} ${String(err)}`);
    }
  }
}
