import { describe, expect, it } from 'vitest';
import { requestMatchConfig } from './requestMatchConfig';

describe('requestMatchConfig', () => {
  describe('exact match config', () => {
    const config = {
      url: 'https://api.coindesk.com/',
      method: 'GET',
      body: '',
      headers: {
        'Content-Type': 'application/json',
      },
      response: {
        status: 200,
      },
    };
    it('returns true when the request matches the config', () => {
      const request = {
        url: 'https://api.coindesk.com/',
        method: 'GET',
        body: '',
        headers: {
          'content-type': 'application/json',
        },
      };
      expect(requestMatchConfig(request, config)).toBe(true);
    });
    it('returns false when the request does not match the config', () => {
      const request = {
        url: 'https://api.coindesk.com/',
        method: 'POST',
        body: '',
        headers: {
          'content-type': 'application/json',
        },
      };
      expect(requestMatchConfig(request, config)).toBe(false);
    });
  });
  describe('method exact match config', () => {
    const config = {
      method: 'GET',
      response: {
        status: 200,
      },
    };
    it('returns true when the request matches the config', () => {
      const request = {
        url: 'https://api.coindesk.com/',
        method: 'GET',
        body: '',
        headers: {},
      };
      expect(requestMatchConfig(request, config)).toBe(true);
    });
    it('returns false when the request does not match the config', () => {
      const request = {
        url: 'https://api.coindesk.com/',
        method: 'POST',
        body: '',
        headers: {},
      };
      expect(requestMatchConfig(request, config)).toBe(false);
    });
  });
  describe('headers match config', () => {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': '1234',
      },
      response: {
        status: 200,
      },
    };
    it('returns true when the headers contains all the ones of the config', () => {
      const request = {
        url: 'https://api.coindesk.com/',
        method: 'GET',
        body: '',
        headers: {
          'content-type': 'application/json',
          'x-api-key': '1234',
          accept: 'application/json',
        },
      };
      expect(requestMatchConfig(request, config)).toBe(true);
    });
    it('returns false when an header does not match with the one of the config', () => {
      const request = {
        url: 'https://api.coindesk.com/',
        method: 'GET',
        body: '',
        headers: {
          'content-type': 'application/json',
          'x-api-key': '5678',
          accept: 'application/json',
        },
      };
      expect(requestMatchConfig(request, config)).toBe(false);
    });
    it('returns false when an header is missing from the config', () => {
      const request = {
        url: 'https://api.coindesk.com/',
        method: 'GET',
        body: '',
        headers: {
          'content-type': 'application/json',
          accept: 'application/json',
        },
      };
      expect(requestMatchConfig(request, config)).toBe(false);
    });
  });
  describe('url exact match config', () => {
    const config = {
      url: 'https://api.coindesk.com/',
      response: {
        status: 200,
      },
    };
    it('returns true when the url match the regex', () => {
      const request = {
        url: 'https://api.coindesk.com/',
        method: 'GET',
        body: '',
        headers: {},
      };
      expect(requestMatchConfig(request, config)).toBe(true);
    });
    it('returns false when the url does not match the regex', () => {
      const request = {
        url: 'https://api.coindesk.fr/',
        method: 'GET',
        body: '',
        headers: {},
      };
      expect(requestMatchConfig(request, config)).toBe(false);
    });
  });
  describe('url wildcard match config', () => {
    const config = {
      url: 'https://api.coindesk.com/*',
      response: {
        status: 200,
      },
    };
    it('returns true when the url match with wildcard', () => {
      const request = {
        url: 'https://api.coindesk.com/BTC',
        method: 'GET',
        body: '',
        headers: {},
      };
      expect(requestMatchConfig(request, config)).toBe(true);
    });
    it('returns false when the url does not match', () => {
      const request = {
        url: 'https://api.coindesk.fr/BTC',
        method: 'GET',
        body: '',
        headers: {},
      };
      expect(requestMatchConfig(request, config)).toBe(false);
    });
  });
  describe('body exact match config', () => {
    const config = {
      body: JSON.stringify({ foo: 'bar' }),
      response: {
        status: 200,
      },
    };
    it('returns true when the body match', () => {
      const request = {
        url: 'https://api.coindesk.com/',
        method: 'GET',
        body: JSON.stringify({ foo: 'bar' }),
        headers: {},
      };
      expect(requestMatchConfig(request, config)).toBe(true);
    });
    it('returns false when the body does not match', () => {
      const request = {
        url: 'https://api.coindesk.com/',
        method: 'GET',
        body: JSON.stringify({ foo: 'baz' }),
        headers: {},
      };
      expect(requestMatchConfig(request, config)).toBe(false);
    });
  });
  it('returns always true with an empty config', () => {
    const config = {
      response: {
        status: 200,
      },
    };
    const request = {
      url: 'https://api.coindesk.com/',
      method: 'GET',
      body: '',
      headers: {
        'content-type': 'application/json',
      },
    };
    expect(requestMatchConfig(request, config)).toBe(true);
  });
  it('returns true when all present member match', () => {
    const config = {
      url: 'https://api.coindesk.com/*',
      method: 'GET',
      response: {
        status: 200,
      },
    };
    const request = {
      url: 'https://api.coindesk.com/BTC',
      method: 'GET',
      body: '',
      headers: {
        'content-type': 'application/json',
      },
    };
    expect(requestMatchConfig(request, config)).toBe(true);
  });
  it('returns false when one member does not match', () => {
    const config = {
      url: 'https://api.coindesk.com/*',
      method: 'GET',
      response: {
        status: 200,
      },
    };
    const request = {
      url: 'https://api.coindesk.com/BTC',
      method: 'POST',
      body: '',
      headers: {
        'content-type': 'application/json',
      },
    };
    expect(requestMatchConfig(request, config)).toBe(false);
  });
});
