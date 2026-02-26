const axios = require('axios');
const { JSDOM } = require('jsdom');
const { URL } = require('url');

async function fetchResource(resourceUrl, baseUrl) {
  try {
    const absolute = new URL(resourceUrl, baseUrl).href;
    const resp = await axios.get(absolute, {
      responseType: 'text',
      maxRedirects: 5,
      timeout: 10000,
    });
    return {
      url: absolute,
      headers: resp.headers,
      content: resp.data,
      status: resp.status,
    };
  } catch (err) {
    return { url: resourceUrl, error: err.message };
  }
}

function extractApiEndpointsFromJs(jsText) {
  const endpoints = new Set();
  // naive regex for fetch/axios/xhr calls
  const regex = /(?:fetch|axios\.(?:get|post|put|delete))\((?:`([^`]+)`|'([^']+)'|"([^" ]+)")/g;
  let m;
  while ((m = regex.exec(jsText))) {
    const candidate = m[1] || m[2] || m[3];
    if (candidate) {
      endpoints.add(candidate);
    }
  }
  // look for strings that look like /api/ or https?://.../api
  const apiRegex = /(https?:\\/\\/[\w\.-]+(?:\\/[^'"\s]+)?|\/[\w\/\-]+)\b/api\b[\w\/\-]*/g;
  while ((m = apiRegex.exec(jsText))) {
    endpoints.add(m[1]);
  }
  return Array.from(endpoints);
}

async function crawl(url) {
  const result = {
    url,
    headers: {},
    cookies: [],
    html: '',
    jsResources: [],
    cssResources: [],
    forms: [],
    inputs: [],
    apiEndpoints: [],
  };

  // fetch main page
  let resp;
  try {
    resp = await axios.get(url, {
      responseType: 'text',
      maxRedirects: 5,
      timeout: 10000,
    });
  } catch (err) {
    throw new Error(`failed to fetch ${url}: ${err.message}`);
  }

  result.headers = resp.headers;
  if (resp.headers['set-cookie']) {
    result.cookies = resp.headers['set-cookie'];
  }
  result.html = resp.data;

  const dom = new JSDOM(resp.data, { url });
  const { document } = dom.window;

  // forms + inputs
  const formEls = [...document.querySelectorAll('form')];
  result.forms = formEls.map(f => ({
    action: f.getAttribute('action') || null,
    method: f.getAttribute('method') || 'get',
    inputs: [...f.querySelectorAll('input,textarea,select')].map(i => ({
      name: i.getAttribute('name'),
      type: i.getAttribute('type') || i.tagName.toLowerCase(),
      value: i.getAttribute('value') || '',
    })),
  }));

  result.inputs = [...document.querySelectorAll('input')].map(i => ({
    name: i.getAttribute('name'),
    type: i.getAttribute('type') || 'text',
  }));

  // collect script/css URLs
  const scriptEls = [...document.querySelectorAll('script[src]')];
  const linkEls = [...document.querySelectorAll('link[rel="stylesheet"]')];

  const jsPromises = scriptEls.map(s => fetchResource(s.src, url));
  const cssPromises = linkEls.map(l => fetchResource(l.href, url));

  const jsResults = await Promise.all(jsPromises);
  const cssResults = await Promise.all(cssPromises);
  result.jsResources = jsResults;
  result.cssResources = cssResults;

  // try to discover APIs in html and JS
  const foundApis = new Set();
  // scan html for action attributes or api-looking hrefs
  [...document.querySelectorAll('[href],[action]')].forEach(el => {
    const href = el.getAttribute('href') || el.getAttribute('action');
    if (href && /\/api\//.test(href)) {
      foundApis.add(new URL(href, url).href);
    }
  });

  // scan JS content
  jsResults.forEach(js => {
    if (js.content) {
      extractApiEndpointsFromJs(js.content).forEach(ep => {
        try {
          foundApis.add(new URL(ep, url).href);
        } catch (e) {
          foundApis.add(ep);
        }
      });
    }
  });

  result.apiEndpoints = Array.from(foundApis);
  return result;
}

module.exports = { crawl };
