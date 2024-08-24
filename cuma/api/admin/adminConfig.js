import AdminJS from 'adminjs'
import AdminJSExpress from '@adminjs/express'
import * as AdminJSMongoose from '@adminjs/mongoose'
import PendingStudent from '../models/PendingStudentModel.js'
import PendingCourseDirector from '../models/PendingCourseDirectorModel.js'
import dotenv from 'dotenv'

dotenv.config()

AdminJS.registerAdapter({
  Resource: AdminJSMongoose.Resource,
  Database: AdminJSMongoose.Database,
})

const adminJsOptions = {
  resources: [
    {
      resource: PendingStudent,
      options: {
        navigation: {
          name: 'User Management',
          icon: 'User',
        },
      },
    },
    {
      resource: PendingCourseDirector,
      options: {
        navigation: {
          name: 'User Management',
          icon: 'User',
        },
      },
    },
  ],
  rootPath: '/admin',
  branding: {
    companyName: 'CUMA Admin Panel',
    logo: false,
    softwareBrothers: false,
  },
}

export const setupAdminJS = async (app, client) => {
  const admin = new AdminJS(adminJsOptions)

  // Use non-authenticated router for development
  const adminRouter = AdminJSExpress.buildRouter(admin)

  app.use(admin.options.rootPath, adminRouter)

  return admin
}