import AdminJS from 'adminjs'
import AdminJSExpress from '@adminjs/express'
import * as AdminJSMongoose from '@adminjs/mongoose'
import PendingStudent from '../models/PendingStudentModel.js'
import PendingCourseDirector from '../models/PendingCourseDirectorModel.js'

AdminJS.registerAdapter(AdminJSMongoose)

const adminJsOptions = {
  resources: [
    {
      resource: PendingStudent,
      options: {
        navigation: {
          name: 'User Management',
          icon: 'User',
        },
        properties: {
          proofOfEnrollment: {
            isVisible: { list: false, filter: false, show: true, edit: true },
          },
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
        properties: {
          proofOfEmployment: {
            isVisible: { list: false, filter: false, show: true, edit: true },
          },
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