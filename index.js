const Koa = require('koa');
const app = new Koa();
const Router = require('koa-router');
const router = new Router();
const jwt = require('jsonwebtoken');
const koaBody = require('koa-body');

function verify(token) {
    if (token) {
        const data = jwt.verify(token, 'key')
        return data?.expires && data.expires > Date.now()
    }
}

const authMiddleware = (ctx, next) => {
    const { access_token } =  ctx.header
    if (verify(access_token)) {
        next()
    } else {
        ctx.body = {
            status: 401,
            msg: 'access_token invalid, please refresh'
        };
    }
}

function getToken() {
    return {
        access_token: jwt.sign({ user_id: 1, expires: Date.now() + 10 * 1000 }, 'key'),
        refresh_token: jwt.sign({ user_id: 1, expires: Date.now() + 60 * 60 * 100 }, 'key')
    }
}

router.get('/', (ctx, next) => {
    ctx.body = 'Hello World!';
});

// create access_token(The expiration time of the token is set to 10 seconds) and refresh_token
router.post('/login', (ctx, next) => {
    ctx.body = {
        status: 1,
        data: getToken()
    };
});

router.get('/auth/1',authMiddleware, (ctx, next) => {
    ctx.body = {
        status: 1,
        data: 'success'
    };
});

router.post('/auth/2', authMiddleware,(ctx, next) => {
    ctx.body = {
        status: 1,
        data: 'success'
    };
});

// access_token invalid, get new access_token with refresh_token
router.post('/refresh', (ctx, next) => {
    const { refresh_token } = ctx.request.body
        
    if (verify(refresh_token)) {
        ctx.body = {
            status: 1,
            data: getToken()
        }
    } else {
        ctx.body = {
            status: 401,
            msg: 'login invalid',
            data: {}
        }
    }
});

app
  .use(koaBody())
  .use(router.routes())
  .use(router.allowedMethods())

app.listen(3333);