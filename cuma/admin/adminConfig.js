import AdminJS from 'adminjs'
import AdminJSExpress from '@adminjs/express'

const adminJsOptions = {}

export const setupAdminJS = async (app) => {
  const admin = new AdminJS(adminJsOptions)

  const adminRouter = AdminJSExpress.buildRouter(admin)

  app.use(admin.options.rootPath, adminRouter)

  return admin
}