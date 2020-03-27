import * as express from 'express';
import axios from 'axios';

// eslint-disable-next-line new-cap
const router = express.Router();

router.all('/', async (req: any, res) => {
  try {
    const { method } = req;

    if (!req.headers['x-proxy-url']) {
      throw new Error('URL not informed');
    }

    const fullUrl = req.headers['x-proxy-url'] as string;

    let data: any = req.body;
    let headers: any = {};

    if (req.headers['x-authorization']) {
      headers.authorization = req.headers['x-authorization'];
    } else if (req.headers.authorization) {
      headers.authorization = req.headers.authorization;
    }

    if (req.headers['x-origin']) {
      headers.origin = req.headers['x-origin'];
    }

    const requestHeaders = {
      ...req.headers,
      ...headers,
    };

    delete requestHeaders.host;

    const axiosRequest = {
      method: method as any,
      params: req.query,
      data,
      maxContentLength: Infinity,
      headers: requestHeaders,
    };

    const serviceResponse = await axios(fullUrl, axiosRequest);

    res.status(serviceResponse.status);
    res.send(serviceResponse.data);
  } catch (e) {
    if (e.response) {
      res.status(e.response.status);
      res.send(e.response.data);
    } else {
      res.status(500);
      res.send({ message: e.message });
    }
  }
});

module.exports = router;
