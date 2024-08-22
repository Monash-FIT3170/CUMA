import AdminJS from 'adminjs'
import AdminJSExpress from '@adminjs/express'

const DEFAULT_ADMIN = {
  email: 'admin@example.com',
  password: 'password',
}

const authenticate = async (email, password) => {
  if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
    return Promise.resolve(DEFAULT_ADMIN)
  }
  return null
}

export const setupAdminJS = async (app, client) => {
  const admin = new AdminJS({})

  const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
    admin,
    {
      authenticate,
      cookieName: 'adminjs',
      cookiePassword: 'sessionsecret'
    },
    null,
    {
      resave: false,
      saveUninitialized: true,
      secret: 'sessionsecret'
    }
  )

  app.use(admin.options.rootPath, adminRouter)

  return admin
}