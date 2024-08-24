import AdminJS from 'adminjs'
import AdminJSExpress from '@adminjs/express'
import * as AdminJSMongoose from '@adminjs/mongoose'
import PendingStudent  from '../api/models/PendingStudentModel.js'

AdminJS.registerAdapter({
    Resource: AdminJSMongoose.Resource,
    Database: AdminJSMongoose.Database,
  })

const adminJsOptions = {
    resources: [PendingStudent],
    rootPath: '/admin',
    branding: {
        companyName: 'Cuma Admin',
        softwareBrothers: false,
        logo: false
    },
}

export const setupAdminJS = async (app) => {
  const admin = new AdminJS(adminJsOptions)

  const adminRouter = AdminJSExpress.buildRouter(admin)

  app.use(admin.options.rootPath, adminRouter)

  return admin
}